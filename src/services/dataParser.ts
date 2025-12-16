import type {
  ConversationsExport,
  RawConversation,
  MappingNode,
  Conversation,
  Message,
  ParseResult,
  ParseError,
} from '../types'

const MAX_FILE_SIZE = 1000 * 1024 * 1024 // 1GB

export async function parseConversationsFile(file: File): Promise<ParseResult<Conversation[]>> {
  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `ファイルサイズが大きすぎます（${Math.round(file.size / 1024 / 1024)}MB）。1GB以下のファイルを選択してください。`,
      },
    }
  }

  // File type validation
  if (!file.name.endsWith('.json')) {
    return {
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'JSONファイルを選択してください。',
      },
    }
  }

  try {
    const text = await file.text()

    // Empty file check
    if (!text.trim()) {
      return {
        success: false,
        error: {
          code: 'EMPTY_FILE',
          message: 'ファイルが空です。',
        },
      }
    }

    return parseConversationsJson(text)
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'READ_ERROR',
        message: 'ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。',
        details: error instanceof Error ? error.message : undefined,
      },
    }
  }
}

export function parseConversationsJson(jsonString: string): ParseResult<Conversation[]> {
  let rawData: unknown

  try {
    rawData = JSON.parse(jsonString)
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSONの解析に失敗しました。有効なJSONファイルを選択してください。',
      },
    }
  }

  const validationError = validateFormat(rawData)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const rawConversations = rawData as ConversationsExport

  if (rawConversations.length === 0) {
    return {
      success: false,
      error: {
        code: 'EMPTY_FILE',
        message: '会話データが見つかりませんでした。',
      },
    }
  }

  let totalMessages = 0
  let skippedMessages = 0

  const conversations: Conversation[] = rawConversations.map((raw) => {
    const { messages, skipped } = flattenMapping(raw.mapping)
    totalMessages += messages.length + skipped
    skippedMessages += skipped

    return {
      id: raw.id,
      title: raw.title || '無題の会話',
      createTime: new Date(raw.create_time * 1000),
      updateTime: new Date(raw.update_time * 1000),
      modelSlug: raw.default_model_slug || null,
      isArchived: raw.is_archived,
      isStarred: raw.is_starred,
      gizmoId: raw.gizmo_id || null,
      messages,
    }
  })

  // Sort conversations by create time (newest first)
  conversations.sort((a, b) => b.createTime.getTime() - a.createTime.getTime())

  return {
    success: true,
    data: conversations,
    stats: {
      totalConversations: conversations.length,
      totalMessages,
      skippedMessages,
    },
  }
}

function validateFormat(data: unknown): ParseError | null {
  if (!Array.isArray(data)) {
    return {
      code: 'INVALID_FORMAT',
      message: 'ChatGPTエクスポート形式ではありません。conversations.jsonを選択してください。',
      details: 'ルート要素が配列ではありません',
    }
  }

  if (data.length > 0) {
    const first = data[0]
    if (
      typeof first !== 'object' ||
      first === null ||
      !('mapping' in first) ||
      !('id' in first)
    ) {
      return {
        code: 'INVALID_FORMAT',
        message: 'ChatGPTエクスポート形式ではありません。conversations.jsonを選択してください。',
        details: '必要なフィールド（mapping, id）が見つかりません',
      }
    }
  }

  return null
}

function flattenMapping(mapping: Record<string, MappingNode>): {
  messages: Message[]
  skipped: number
} {
  const messages: Message[] = []
  let skipped = 0

  // Find root node (parent is null or id contains 'root')
  const rootNodeId = Object.keys(mapping).find((id) => {
    const node = mapping[id]
    return node.parent === null || id.includes('root')
  })

  if (!rootNodeId) {
    return { messages, skipped }
  }

  // DFS traversal
  const visited = new Set<string>()
  const stack: string[] = [rootNodeId]

  while (stack.length > 0) {
    const nodeId = stack.pop()!
    if (visited.has(nodeId)) continue
    visited.add(nodeId)

    const node = mapping[nodeId]
    if (!node) continue

    if (node.message) {
      const message = extractMessage(node.message)
      if (message) {
        messages.push(message)
      } else {
        skipped++
      }
    }

    // Add children in reverse order so we process them in correct order
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i])
      }
    }
  }

  // Sort by create time
  messages.sort((a, b) => {
    if (!a.createTime && !b.createTime) return 0
    if (!a.createTime) return -1
    if (!b.createTime) return 1
    return a.createTime.getTime() - b.createTime.getTime()
  })

  return { messages, skipped }
}

function extractMessage(raw: RawConversation['mapping'][string]['message']): Message | null {
  if (!raw) return null

  // Skip system messages and tool results for analysis
  if (raw.author.role === 'system') return null

  const content = extractTextContent(raw.content)
  if (!content) return null

  return {
    id: raw.id,
    role: raw.author.role,
    contentType: raw.content.content_type,
    content,
    createTime: raw.create_time ? new Date(raw.create_time * 1000) : null,
    metadata: {
      modelSlug: raw.metadata.model_slug,
      isComplete: raw.metadata.is_complete,
    },
  }
}

function extractTextContent(content: { content_type: string; parts: (string | object)[] }): string {
  if (!content.parts || !Array.isArray(content.parts)) {
    return ''
  }

  return content.parts
    .map((part) => {
      if (typeof part === 'string') {
        return sanitizeText(part)
      }
      // Handle multimodal_text - extract text parts only
      if (typeof part === 'object' && part !== null && 'text' in part) {
        return sanitizeText((part as { text: string }).text)
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''

  // Remove null bytes and other control characters (except newlines/tabs)
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
  return text
    .replace(/\0/g, '')
    .replace(controlCharRegex, '')
    .slice(0, 50000) // Limit per-message text length
}
