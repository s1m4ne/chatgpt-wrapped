import type { LLMClient, LLMProvider } from '../types'
import { GeminiClient } from './geminiClient'
import { OpenAIClient } from './openaiClient'

export function createLLMClient(provider: LLMProvider, apiKey: string): LLMClient {
  switch (provider) {
    case 'gemini':
      return new GeminiClient(apiKey)
    case 'openai':
      return new OpenAIClient(apiKey)
    default:
      throw new Error(`Unknown provider: ${provider satisfies never}`)
  }
}
