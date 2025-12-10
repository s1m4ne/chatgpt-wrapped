import type { AnalysisResult } from './errors'

// LLMプロバイダーの種別
export type LLMProvider = 'gemini' | 'openai'

// JSON Schema型（OpenAI互換形式を共通スキーマ形式として採用）
export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'integer'
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  enum?: string[]
  description?: string
}

// LLMクライアント共通インターフェース
export interface LLMClient {
  generateWithSchema<T>(prompt: string, schema: JSONSchema): Promise<AnalysisResult<T>>
  generate(prompt: string): Promise<AnalysisResult<string>>
  getEmbedding(text: string): Promise<AnalysisResult<number[]>>
  abort(): void
}

// APIキー設定
export interface ApiKeyConfig {
  provider: LLMProvider
  apiKey: string
}
