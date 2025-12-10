import { PCA } from '@saehrimnir/druidjs'
import { createLLMClient } from './clientFactory'
import type { Conversation, IntelligenceMap, LLMClient, LLMProvider, JSONSchema } from '../types'

interface ConversationSummary {
  id: string
  title: string
  summary: string
  embedding: number[]
}

const BATCH_SIZE = 10
const MAX_CONVERSATIONS = 30 // Reduced for faster processing
const MAP_TIMEOUT_MS = 60000 // 60 seconds timeout for entire map generation

export class IntelligenceMapService {
  private client: LLMClient

  constructor(provider: LLMProvider, apiKey: string) {
    this.client = createLLMClient(provider, apiKey)
  }

  async generateMap(
    conversations: Conversation[],
    onProgress?: (progress: number) => void
  ): Promise<IntelligenceMap | null> {
    const startTime = Date.now()
    const limited = conversations.slice(0, MAX_CONVERSATIONS)
    const summaries: ConversationSummary[] = []

    console.log('[IntelligenceMap] 生成開始', { conversationCount: limited.length })

    // Step 1: Generate summaries and embeddings
    for (let i = 0; i < limited.length; i += BATCH_SIZE) {
      // Check timeout
      if (Date.now() - startTime > MAP_TIMEOUT_MS) {
        console.warn('[IntelligenceMap] タイムアウト - 収集済みデータで継続', {
          elapsed: Date.now() - startTime,
          summariesCollected: summaries.length
        })
        break
      }

      const batch = limited.slice(i, i + BATCH_SIZE)
      console.log(`[IntelligenceMap] バッチ処理 ${i / BATCH_SIZE + 1}`, { batchSize: batch.length })

      for (const conv of batch) {
        // Check timeout per conversation
        if (Date.now() - startTime > MAP_TIMEOUT_MS) break

        try {
          const summaryStart = Date.now()
          const summary = await this.generateSummary(conv)
          if (!summary) {
            console.warn(`[IntelligenceMap] サマリー生成失敗: ${conv.id}`)
            continue
          }
          console.log(`[IntelligenceMap] サマリー生成: ${conv.id}`, { duration: Date.now() - summaryStart })

          const embeddingStart = Date.now()
          const embeddingResult = await this.client.getEmbedding(summary)
          if (!embeddingResult.success || !embeddingResult.data) {
            console.warn(`[IntelligenceMap] Embedding生成失敗: ${conv.id}`, embeddingResult.error)
            continue
          }
          console.log(`[IntelligenceMap] Embedding生成: ${conv.id}`, { duration: Date.now() - embeddingStart })

          summaries.push({
            id: conv.id,
            title: conv.title,
            summary,
            embedding: embeddingResult.data,
          })
        } catch (error) {
          console.error(`[IntelligenceMap] 会話処理エラー: ${conv.id}`, error)
          // Continue with next conversation
        }
      }

      onProgress?.(((i + batch.length) / limited.length) * 70)
    }

    console.log('[IntelligenceMap] サマリー収集完了', { count: summaries.length })

    if (summaries.length < 3) {
      console.warn('[IntelligenceMap] サマリー不足でマップ生成スキップ', { count: summaries.length })
      return null
    }

    // Step 2: Apply PCA to reduce dimensions
    onProgress?.(75)
    console.log('[IntelligenceMap] PCA開始')
    const embeddings = summaries.map((s) => s.embedding)
    const reduced = this.applyPCA(embeddings)
    console.log('[IntelligenceMap] PCA完了')

    // Step 3: Infer axis meanings using LLM (with timeout protection)
    onProgress?.(85)
    console.log('[IntelligenceMap] 軸ラベル推定開始')
    let axisLabels: IntelligenceMap['axisLabels']
    try {
      const axisStart = Date.now()
      const remainingTime = MAP_TIMEOUT_MS - (Date.now() - startTime)
      if (remainingTime > 5000) {
        axisLabels = await this.inferAxisMeanings(summaries, reduced)
        console.log('[IntelligenceMap] 軸ラベル推定完了', { duration: Date.now() - axisStart })
      } else {
        console.warn('[IntelligenceMap] 時間不足 - デフォルトラベル使用')
        axisLabels = this.getDefaultAxisLabels()
      }
    } catch (error) {
      console.error('[IntelligenceMap] 軸ラベル推定エラー - デフォルト使用', error)
      axisLabels = this.getDefaultAxisLabels()
    }

    onProgress?.(100)

    console.log('[IntelligenceMap] 生成完了', {
      totalDuration: Date.now() - startTime,
      pointCount: summaries.length
    })

    return {
      points: summaries.map((s, i) => ({
        x: reduced[i][0],
        y: reduced[i][1],
        conversationId: s.id,
        title: s.title,
        summary: s.summary,
      })),
      axisLabels,
    }
  }

  private getDefaultAxisLabels(): IntelligenceMap['axisLabels'] {
    return {
      xPositive: '創造的',
      xNegative: '実用的',
      yPositive: '技術的',
      yNegative: '日常的',
    }
  }

  private async generateSummary(conversation: Conversation): Promise<string | null> {
    const userMessages = conversation.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content.slice(0, 200))
      .join('\n')
      .slice(0, 500)

    const prompt = `以下の会話を30文字以内で要約してください:
タイトル: ${conversation.title}
ユーザー発言: ${userMessages}`

    const result = await this.client.generate(prompt)
    return result.success && result.data ? result.data.slice(0, 100) : null
  }

  private applyPCA(embeddings: number[][]): number[][] {
    if (embeddings.length < 2) {
      return embeddings.map(() => [0, 0])
    }

    try {
      const pca = new PCA(embeddings, 2)
      const transformed = pca.transform()

      // Normalize to -1 to 1 range
      const result: number[][] = []
      let minX = Infinity,
        maxX = -Infinity
      let minY = Infinity,
        maxY = -Infinity

      for (let i = 0; i < transformed.shape[0]; i++) {
        const x = transformed.entry(i, 0)
        const y = transformed.entry(i, 1)
        result.push([x, y])
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }

      const rangeX = maxX - minX || 1
      const rangeY = maxY - minY || 1

      return result.map(([x, y]) => [
        ((x - minX) / rangeX) * 2 - 1,
        ((y - minY) / rangeY) * 2 - 1,
      ])
    } catch (error) {
      console.error('PCA error:', error)
      return embeddings.map(() => [Math.random() * 2 - 1, Math.random() * 2 - 1])
    }
  }

  private async inferAxisMeanings(
    summaries: ConversationSummary[],
    reduced: number[][]
  ): Promise<IntelligenceMap['axisLabels']> {
    // Get extreme points for each axis
    const sortedByX = [...summaries].sort(
      (a, b) => reduced[summaries.indexOf(a)][0] - reduced[summaries.indexOf(b)][0]
    )
    const sortedByY = [...summaries].sort(
      (a, b) => reduced[summaries.indexOf(a)][1] - reduced[summaries.indexOf(b)][1]
    )

    const xNegSamples = sortedByX.slice(0, 3).map((s) => s.summary)
    const xPosSamples = sortedByX.slice(-3).map((s) => s.summary)
    const yNegSamples = sortedByY.slice(0, 3).map((s) => s.summary)
    const yPosSamples = sortedByY.slice(-3).map((s) => s.summary)

    const prompt = `会話データを2次元に次元削減しました。各軸の両極端にある会話から軸の意味を推定してください。

X軸マイナス側の会話:
${xNegSamples.join('\n')}

X軸プラス側の会話:
${xPosSamples.join('\n')}

Y軸マイナス側の会話:
${yNegSamples.join('\n')}

Y軸プラス側の会話:
${yPosSamples.join('\n')}

各軸のラベルを短い単語（3-5文字）で提案してください。例: 技術↔企画、論理↔感情`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        xPositive: { type: 'string' },
        xNegative: { type: 'string' },
        yPositive: { type: 'string' },
        yNegative: { type: 'string' },
      },
      required: ['xPositive', 'xNegative', 'yPositive', 'yNegative'],
    }

    const result = await this.client.generateWithSchema<IntelligenceMap['axisLabels']>(
      prompt,
      schema
    )

    if (result.success && result.data) {
      return result.data
    }

    return this.getDefaultAxisLabels()
  }
}
