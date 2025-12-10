import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { ApiError, AnalysisResult, LLMClient, JSONSchema } from '../types'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000
const REQUEST_TIMEOUT_MS = 60000 // 60 seconds

// JSON SchemaからGemini SchemaType形式への変換
function convertToGeminiSchema(schema: JSONSchema): object {
  const typeMap: Record<string, SchemaType> = {
    object: SchemaType.OBJECT,
    array: SchemaType.ARRAY,
    string: SchemaType.STRING,
    number: SchemaType.NUMBER,
    integer: SchemaType.INTEGER,
    boolean: SchemaType.BOOLEAN,
  }

  const result: Record<string, unknown> = {
    type: typeMap[schema.type] ?? SchemaType.STRING,
  }

  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        convertToGeminiSchema(value),
      ])
    )
  }

  if (schema.items) {
    result.items = convertToGeminiSchema(schema.items)
  }

  if (schema.required) {
    result.required = schema.required
  }

  if (schema.enum) {
    result.enum = schema.enum
  }

  return result
}

export class GeminiClient implements LLMClient {
  private genAI: GoogleGenerativeAI
  private abortController: AbortController | null = null

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateWithSchema<T>(
    prompt: string,
    schema: JSONSchema
  ): Promise<AnalysisResult<T>> {
    this.abortController = new AbortController()
    const geminiSchema = convertToGeminiSchema(schema)

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: geminiSchema as never,
          },
        })

        const result = await this.withTimeout(model.generateContent(prompt))
        const text = result.response.text()
        const data = JSON.parse(text) as T

        return { success: true, data }
      } catch (error) {
        const apiError = this.parseError(error)

        // Retry on rate limit, timeout, or server error
        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await this.withTimeout(model.generateContent(prompt))
        const text = result.response.text()

        return { success: true, data: text }
      } catch (error) {
        const apiError = this.parseError(error)

        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
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
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' })
        const result = await this.withTimeout(model.embedContent(text))

        return { success: true, data: result.embedding.values }
      } catch (error) {
        const apiError = this.parseError(error)

        const retryableCodes = ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR']
        if (retryableCodes.includes(apiError.code) && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
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

      if (message.includes('429') || message.includes('rate') || message.includes('quota')) {
        return {
          code: 'RATE_LIMIT',
          message: 'APIレート制限に達しました。しばらく待ってから再試行してください。',
          retryAfter: 60,
        }
      }

      if (message.includes('401') || message.includes('api_key') || message.includes('invalid')) {
        return {
          code: 'AUTH_ERROR',
          message: 'APIキーが無効です。正しいAPIキーを入力してください。',
        }
      }

      if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました。接続を確認してください。',
        }
      }

      if (message.includes('500') || message.includes('503') || message.includes('internal')) {
        return {
          code: 'SERVER_ERROR',
          message: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
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
