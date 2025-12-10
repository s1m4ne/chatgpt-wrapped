import OpenAI from 'openai'
import type { ApiError, AnalysisResult, LLMClient, JSONSchema } from '../types'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000
const REQUEST_TIMEOUT_MS = 60000 // 60 seconds

// OpenAI Structured Outputs用のスキーマ型
interface OpenAISchema {
  type: string
  properties?: Record<string, OpenAISchema>
  items?: OpenAISchema
  required?: string[]
  enum?: string[]
  additionalProperties?: boolean
  [key: string]: unknown
}

// JSON SchemaをOpenAI Structured Outputs形式に変換（additionalProperties: false を追加）
function prepareOpenAISchema(schema: JSONSchema): OpenAISchema {
  const result: OpenAISchema = {
    type: schema.type,
  }

  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        prepareOpenAISchema(value),
      ])
    )
    result.additionalProperties = false
  }

  if (schema.items) {
    result.items = prepareOpenAISchema(schema.items)
  }

  if (schema.required) {
    result.required = schema.required
  }

  if (schema.enum) {
    result.enum = schema.enum
  }

  return result
}

export class OpenAIClient implements LLMClient {
  private client: OpenAI
  private abortController: AbortController | null = null

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // クライアントサイドで使用するため
    })
  }

  async generateWithSchema<T>(
    prompt: string,
    schema: JSONSchema
  ): Promise<AnalysisResult<T>> {
    this.abortController = new AbortController()
    const openaiSchema = prepareOpenAISchema(schema)

    console.log('[OpenAI] generateWithSchema 開始', {
      promptLength: prompt.length,
      schemaKeys: schema.properties ? Object.keys(schema.properties) : [],
    })
    console.log('[OpenAI] 変換後スキーマ:', JSON.stringify(openaiSchema, null, 2))

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const startTime = Date.now()
      try {
        console.log(`[OpenAI] API呼び出し attempt=${attempt + 1}`)
        const response = await this.withTimeout(
          this.client.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: prompt }],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'response',
                schema: openaiSchema,
                strict: true,
              },
            },
          })
        )

        const duration = Date.now() - startTime
        console.log('[OpenAI] API成功', {
          duration,
          usage: response.usage,
          finishReason: response.choices[0]?.finish_reason,
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
          console.warn('[OpenAI] レスポンスが空')
          return {
            success: false,
            error: { code: 'UNKNOWN', message: 'レスポンスが空です' },
          }
        }

        console.log('[OpenAI] レスポンス内容:', content.slice(0, 200) + (content.length > 200 ? '...' : ''))
        const data = JSON.parse(content) as T
        return { success: true, data }
      } catch (error) {
        const duration = Date.now() - startTime
        console.error('[OpenAI] generateWithSchema エラー:', {
          duration,
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStatus: error instanceof OpenAI.APIError ? error.status : undefined,
          errorBody: error instanceof OpenAI.APIError ? error.message : undefined,
        })
        const apiError = this.parseError(error)
        console.log('[OpenAI] パース後エラー:', apiError)

        // Retry on rate limit, timeout, network, or server error
        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR', 'NETWORK_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
          console.log(`[OpenAI] リトライ ${attempt + 1}/${MAX_RETRIES} (${backoffMs}ms後)`)
          await this.sleep(backoffMs)
          continue
        }

        return { success: false, error: apiError }
      }
    }

    return {
      success: false,
      error: { code: 'UNKNOWN', message: 'リトライ回数を超えました' },
    }
  }

  async generate(prompt: string): Promise<AnalysisResult<string>> {
    this.abortController = new AbortController()

    console.log('[OpenAI] generate 開始', { promptLength: prompt.length })

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const startTime = Date.now()
      try {
        console.log(`[OpenAI] generate API呼び出し attempt=${attempt + 1}`)
        const response = await this.withTimeout(
          this.client.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: prompt }],
          })
        )

        const duration = Date.now() - startTime
        console.log('[OpenAI] generate 成功', { duration, usage: response.usage })

        const content = response.choices[0]?.message?.content
        if (!content) {
          console.warn('[OpenAI] generate レスポンスが空')
          return {
            success: false,
            error: { code: 'UNKNOWN', message: 'レスポンスが空です' },
          }
        }

        return { success: true, data: content }
      } catch (error) {
        const duration = Date.now() - startTime
        console.error('[OpenAI] generate エラー:', {
          duration,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStatus: error instanceof OpenAI.APIError ? error.status : undefined,
        })
        const apiError = this.parseError(error)

        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR', 'NETWORK_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
          console.log(`[OpenAI] generate リトライ ${attempt + 1}/${MAX_RETRIES} (${backoffMs}ms後)`)
          await this.sleep(backoffMs)
          continue
        }

        return { success: false, error: apiError }
      }
    }

    return {
      success: false,
      error: { code: 'UNKNOWN', message: 'リトライ回数を超えました' },
    }
  }

  async getEmbedding(text: string): Promise<AnalysisResult<number[]>> {
    console.log('[OpenAI] getEmbedding 開始', { textLength: text.length })

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const startTime = Date.now()
      try {
        console.log(`[OpenAI] getEmbedding API呼び出し attempt=${attempt + 1}`)
        const response = await this.withTimeout(
          this.client.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
          })
        )

        const duration = Date.now() - startTime
        console.log('[OpenAI] getEmbedding 成功', { duration, usage: response.usage })

        const embedding = response.data[0]?.embedding
        if (!embedding) {
          console.warn('[OpenAI] getEmbedding レスポンスが空')
          return {
            success: false,
            error: { code: 'UNKNOWN', message: 'Embeddingが空です' },
          }
        }

        return { success: true, data: embedding }
      } catch (error) {
        const duration = Date.now() - startTime
        console.error('[OpenAI] getEmbedding エラー:', {
          duration,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStatus: error instanceof OpenAI.APIError ? error.status : undefined,
        })
        const apiError = this.parseError(error)

        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR', 'NETWORK_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
          console.log(`[OpenAI] getEmbedding リトライ ${attempt + 1}/${MAX_RETRIES} (${backoffMs}ms後)`)
          await this.sleep(backoffMs)
          continue
        }

        return { success: false, error: apiError }
      }
    }

    return {
      success: false,
      error: { code: 'UNKNOWN', message: 'リトライ回数を超えました' },
    }
  }

  abort() {
    this.abortController?.abort()
  }

  private parseError(error: unknown): ApiError {
    // OpenAI APIError handling
    if (error instanceof OpenAI.APIError) {
      const status = error.status

      if (status === 429) {
        return {
          code: 'RATE_LIMIT',
          message: 'APIレート制限に達しました。しばらく待ってから再試行してください。',
          retryAfter: 60,
        }
      }

      if (status === 401) {
        return {
          code: 'AUTH_ERROR',
          message: 'APIキーが無効です。正しいAPIキーを入力してください。',
        }
      }

      if (status === 403) {
        return {
          code: 'AUTH_ERROR',
          message: 'APIキーに必要な権限がありません。',
        }
      }

      if (status === 500 || status === 503) {
        return {
          code: 'SERVER_ERROR',
          message: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
        }
      }
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      const name = error.name.toLowerCase()

      // Timeout error
      if (name === 'aborterror' || message.includes('timeout') || message.includes('aborted')) {
        return {
          code: 'TIMEOUT',
          message: 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。',
        }
      }

      if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました。接続を確認してください。',
        }
      }
    }

    return {
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number = REQUEST_TIMEOUT_MS): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      ),
    ])
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
