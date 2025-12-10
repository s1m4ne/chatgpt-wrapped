// Raw conversations.json format (ChatGPT export)
export type ConversationsExport = RawConversation[]

export interface RawConversation {
  id: string
  title: string
  create_time: number
  update_time: number
  mapping: Record<string, MappingNode>
  current_node: string
  conversation_id: string
  default_model_slug?: string
  gizmo_id?: string
  gizmo_type?: string
  is_archived: boolean
  is_starred: boolean
  is_read_only: boolean
  is_do_not_remember: boolean
  moderation_results: unknown[]
  plugin_ids: string[] | null
  safe_urls: string[]
  blocked_urls: string[]
  conversation_origin: string | null
  voice: string | null
  async_status: string | null
}

export interface MappingNode {
  id: string
  parent: string | null
  children: string[]
  message: RawMessage | null
}

export interface RawMessage {
  id: string
  author: {
    role: 'system' | 'user' | 'assistant' | 'tool'
    name: string | null
    metadata: Record<string, unknown>
  }
  create_time: number | null
  update_time: number | null
  content: {
    content_type: 'text' | 'multimodal_text' | 'code'
    parts: (string | object)[]
  }
  status: string
  end_turn: boolean
  weight: number
  metadata: {
    model_slug?: string
    finish_details?: { type: string }
    is_complete?: boolean
    citations?: unknown[]
    message_type?: string
    [key: string]: unknown
  }
  recipient: string
  channel: string | null
}

// Normalized internal format
export interface Conversation {
  id: string
  title: string
  createTime: Date
  updateTime: Date
  modelSlug: string | null
  isArchived: boolean
  isStarred: boolean
  gizmoId: string | null
  messages: Message[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  contentType: 'text' | 'multimodal_text' | 'code'
  content: string
  createTime: Date | null
  metadata: {
    modelSlug?: string
    isComplete?: boolean
  }
}
