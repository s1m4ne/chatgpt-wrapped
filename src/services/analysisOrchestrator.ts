import { createLLMClient } from './clientFactory'
import { IntelligenceMapService } from './intelligenceMapService'
import type {
  Conversation,
  AnalysisResults,
  WordAnalysis,
  TopicClassification,
  ThemeEvolution,
  TopSession,
  WritingStyle,
  StyleDiagnosis,
  BestQuote,
  LLMClient,
  LLMProvider,
  JSONSchema,
} from '../types'

type ProgressCallback = (progress: number, step: string) => void

const TOTAL_TIMEOUT_MS = 300000 // 5 minutes total timeout
const STEP_TIMEOUT_MS = 90000 // 90 seconds per step (gpt-5-nano is slow)

const ANALYSIS_STEPS = [
  { key: 'wordAnalysis', label: '単語・フレーズ分析', weight: 12 },
  { key: 'topicClassification', label: 'トピック分類', weight: 12 },
  { key: 'themeEvolution', label: 'テーマ変遷分析', weight: 12 },
  { key: 'topSessions', label: '代表セッション選出', weight: 12 },
  { key: 'writingStyle', label: '文章特徴分析', weight: 12 },
  { key: 'styleDiagnosis', label: 'GPTスタイル診断', weight: 12 },
  { key: 'bestQuotes', label: '名言選出', weight: 8 },
  { key: 'intelligenceMap', label: '知性マップ生成', weight: 20 },
] as const

export class AnalysisOrchestrator {
  private client: LLMClient
  private mapService: IntelligenceMapService
  private aborted = false

  constructor(provider: LLMProvider, apiKey: string) {
    this.client = createLLMClient(provider, apiKey)
    this.mapService = new IntelligenceMapService(provider, apiKey)
  }

  async runAllAnalyses(
    conversations: Conversation[],
    onProgress: ProgressCallback
  ): Promise<AnalysisResults> {
    this.aborted = false
    const results: AnalysisResults = {}
    let cumulativeProgress = 0
    const startTime = Date.now()

    console.log('[Analysis] 分析開始', { conversationCount: conversations.length })

    const summaries = this.prepareConversationSummaries(conversations)
    console.log('[Analysis] サマリー準備完了', { summaryLength: summaries.length })

    for (const step of ANALYSIS_STEPS) {
      // Check total timeout
      const elapsed = Date.now() - startTime
      if (elapsed > TOTAL_TIMEOUT_MS) {
        console.warn('[Analysis] 全体タイムアウト - 部分結果を返却', { elapsed, completedSteps: Object.keys(results) })
        onProgress(cumulativeProgress, 'タイムアウト - 部分結果を表示')
        break
      }

      if (this.aborted) {
        console.log('[Analysis] ユーザーによる中断')
        break
      }

      onProgress(cumulativeProgress, `${step.label}中...`)
      console.log(`[Analysis] ${step.key} 開始`, { cumulativeProgress })
      const stepStart = Date.now()

      try {
        const result = await this.withStepTimeout(
          this.runAnalysis(step.key, summaries, conversations),
          step.key
        )
        if (result) {
          (results as Record<string, unknown>)[step.key] = result
          console.log(`[Analysis] ${step.key} 成功`, { duration: Date.now() - stepStart })
        } else {
          console.warn(`[Analysis] ${step.key} 結果なし`, { duration: Date.now() - stepStart })
        }
      } catch (error) {
        console.error(`[Analysis] ${step.key} エラー:`, error, { duration: Date.now() - stepStart })
        // Continue with next step instead of stopping
      }

      cumulativeProgress += step.weight
      onProgress(cumulativeProgress, `${step.label}完了`)
    }

    console.log('[Analysis] 分析完了', {
      totalDuration: Date.now() - startTime,
      completedSteps: Object.keys(results),
      resultCount: Object.keys(results).length
    })

    return results
  }

  private withStepTimeout<T>(promise: Promise<T>, stepName: string): Promise<T | null> {
    return Promise.race([
      promise,
      new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn(`[Analysis] ${stepName} ステップタイムアウト (${STEP_TIMEOUT_MS}ms)`)
          resolve(null)
        }, STEP_TIMEOUT_MS)
      }),
    ])
  }

  abort() {
    this.aborted = true
    this.client.abort()
  }

  private prepareConversationSummaries(conversations: Conversation[]): string {
    return conversations
      .slice(0, 100) // Limit to prevent token overflow
      .map((conv, i) => {
        const userMessages = conv.messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content.slice(0, 200))
          .join('\n')
        return `【会話${i + 1}】タイトル: ${conv.title}\n日時: ${conv.createTime.toISOString()}\nユーザー発言:\n${userMessages.slice(0, 500)}`
      })
      .join('\n\n---\n\n')
  }

  private async runAnalysis(
    key: string,
    summaries: string,
    conversations: Conversation[]
  ): Promise<unknown> {
    switch (key) {
      case 'wordAnalysis':
        return this.analyzeWords(summaries)
      case 'topicClassification':
        return this.classifyTopics(summaries)
      case 'themeEvolution':
        return this.analyzeThemeEvolution(summaries)
      case 'topSessions':
        return this.selectTopSessions(conversations)
      case 'writingStyle':
        return this.analyzeWritingStyle(summaries)
      case 'styleDiagnosis':
        return this.diagnoseStyle(summaries)
      case 'bestQuotes':
        return this.selectBestQuotes(summaries)
      case 'intelligenceMap':
        return this.mapService.generateMap(conversations)
      default:
        return null
    }
  }

  private async analyzeWords(summaries: string): Promise<WordAnalysis | null> {
    const prompt = `以下のChatGPT会話履歴から、ユーザーがよく使う単語とフレーズを分析してください。

${summaries}

分析結果をJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        topWords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              count: { type: 'number' },
            },
            required: ['word', 'count'],
          },
        },
        phrases: {
          type: 'array',
          items: { type: 'string' },
        },
        importantWords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              tfidf: { type: 'number' },
            },
            required: ['word', 'tfidf'],
          },
        },
      },
      required: ['topWords', 'phrases', 'importantWords'],
    }

    const result = await this.client.generateWithSchema<WordAnalysis>(prompt, schema)
    return result.success && result.data ? result.data : null
  }

  private async classifyTopics(summaries: string): Promise<TopicClassification | null> {
    const prompt = `以下のChatGPT会話履歴を分析し、トピック別に分類してください。各トピックには適切な絵文字を付けてください。

${summaries}

上位10個のトピックをJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              percentage: { type: 'number' },
              emoji: { type: 'string' },
            },
            required: ['name', 'percentage', 'emoji'],
          },
        },
      },
      required: ['topics'],
    }

    const result = await this.client.generateWithSchema<TopicClassification>(prompt, schema)
    return result.success && result.data ? result.data : null
  }

  private async analyzeThemeEvolution(summaries: string): Promise<ThemeEvolution | null> {
    const prompt = `以下のChatGPT会話履歴を月ごとに分析し、テーマの変遷を抽出してください。新しく登場したトピックも特定してください。

${summaries}

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        months: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              mainTopics: {
                type: 'array',
                items: { type: 'string' },
              },
              newTopics: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['month', 'mainTopics', 'newTopics'],
          },
        },
      },
      required: ['months'],
    }

    const result = await this.client.generateWithSchema<ThemeEvolution>(prompt, schema)
    return result.success && result.data ? result.data : null
  }

  private async selectTopSessions(conversations: Conversation[]): Promise<TopSession[] | null> {
    const summaries = conversations.slice(0, 50).map((conv) => ({
      id: conv.id,
      title: conv.title,
      messageCount: conv.messages.length,
      preview: conv.messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content.slice(0, 100))
        .join(' ')
        .slice(0, 300),
    }))

    const prompt = `以下のChatGPT会話から、最も印象的な会話を5つ選出してください。
選出基準: 会話の深度、技術的密度、感情的な変動、創造性など

会話リスト:
${JSON.stringify(summaries, null, 2)}

各会話に印象的なタイトルと選出理由を付けてJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              conversationId: { type: 'string' },
              title: { type: 'string' },
              reason: { type: 'string' },
              score: { type: 'number' },
            },
            required: ['conversationId', 'title', 'reason', 'score'],
          },
        },
      },
      required: ['sessions'],
    }

    const result = await this.client.generateWithSchema<{ sessions: TopSession[] }>(prompt, schema)
    return result.success && result.data ? result.data.sessions : null
  }

  private async analyzeWritingStyle(summaries: string): Promise<WritingStyle | null> {
    const prompt = `以下のChatGPT会話履歴からユーザーの文章スタイルと感情傾向を分析してください。

${summaries}

分析結果をJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        characteristics: {
          type: 'array',
          items: { type: 'string' },
        },
        emotionalTendency: {
          type: 'array',
          items: { type: 'string' },
        },
        questionPatterns: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['characteristics', 'emotionalTendency', 'questionPatterns'],
    }

    const result = await this.client.generateWithSchema<WritingStyle>(prompt, schema)
    return result.success && result.data ? result.data : null
  }

  private async diagnoseStyle(summaries: string): Promise<StyleDiagnosis | null> {
    const prompt = `以下のChatGPT利用パターンから、ユーザーの「GPT活用タイプ」を診断してください。
タイプ例: 思索型、企画爆発型、効率追求型、学習探求型、クリエイティブ型など

${summaries}

ユニークで面白いタイプ名と説明、相性スコア（0-100%）をJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        compatibilityScore: { type: 'number' },
        description: { type: 'string' },
      },
      required: ['type', 'compatibilityScore', 'description'],
    }

    const result = await this.client.generateWithSchema<StyleDiagnosis>(prompt, schema)
    return result.success && result.data ? result.data : null
  }

  private async selectBestQuotes(summaries: string): Promise<BestQuote[] | null> {
    const prompt = `以下のChatGPT会話履歴から、最も印象的なユーザーの発言（名言/ベストプロンプト）を5つ選出してください。

${summaries}

各名言に選出理由と文脈を付けてJSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        quotes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              quote: { type: 'string' },
              context: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['quote', 'context', 'reason'],
          },
        },
      },
      required: ['quotes'],
    }

    const result = await this.client.generateWithSchema<{ quotes: BestQuote[] }>(prompt, schema)
    return result.success && result.data ? result.data.quotes : null
  }
}
