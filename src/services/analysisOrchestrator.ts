import { createLLMClient } from './clientFactory'
import type {
  Conversation,
  AnalysisResults,
  BigFiveAnalysis,
  BigFiveScore,
  MBTIAnalysis,
  MBTIAxisScore,
  ThinkingStyleAnalysis,
  ThinkingStyleScores,
  CommunicationAnalysis,
  CommunicationPattern,
  PersonalitySummary,
  LLMClient,
  LLMProvider,
  JSONSchema,
} from '../types'

type ProgressCallback = (progress: number, step: string) => void

const TOTAL_TIMEOUT_MS = 300000 // 5 minutes total timeout
const STEP_TIMEOUT_MS = 90000 // 90 seconds per step

const PERSONALITY_ANALYSIS_STEPS = [
  { key: 'bigFive', label: 'Big Five診断', weight: 20 },
  { key: 'mbti', label: 'タイプ診断', weight: 20 },
  { key: 'thinkingStyle', label: '思考スタイル分析', weight: 20 },
  { key: 'communication', label: 'コミュニケーション分析', weight: 20 },
  { key: 'personalitySummary', label: '総合サマリー生成', weight: 20 },
] as const

export class AnalysisOrchestrator {
  private client: LLMClient
  private aborted = false

  constructor(provider: LLMProvider, apiKey: string) {
    this.client = createLLMClient(provider, apiKey)
  }

  async runAllAnalyses(
    conversations: Conversation[],
    onProgress: ProgressCallback
  ): Promise<AnalysisResults> {
    this.aborted = false
    const results: AnalysisResults = {}
    let cumulativeProgress = 0
    const startTime = Date.now()

    console.log('[Analysis] 性格分析開始', { conversationCount: conversations.length })

    const summaries = this.prepareConversationSummaries(conversations)
    console.log('[Analysis] サマリー準備完了', { summaryLength: summaries.length })

    for (const step of PERSONALITY_ANALYSIS_STEPS) {
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
          this.runAnalysis(step.key, summaries, results),
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
      .slice(0, 100)
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
    previousResults: AnalysisResults
  ): Promise<unknown> {
    switch (key) {
      case 'bigFive':
        return this.analyzeBigFive(summaries)
      case 'mbti':
        return this.analyzeMBTI(summaries)
      case 'thinkingStyle':
        return this.analyzeThinkingStyle(summaries)
      case 'communication':
        return this.analyzeCommunication(summaries)
      case 'personalitySummary':
        return this.generatePersonalitySummary(summaries, previousResults)
      default:
        return null
    }
  }

  private async analyzeBigFive(summaries: string): Promise<BigFiveAnalysis | null> {
    const prompt = `以下のChatGPT会話履歴から、ユーザーの性格をBig Five（OCEAN）モデルで分析してください。

会話履歴:
${summaries}

各因子を0-100のスコアで評価し、それぞれの説明を付けてください。
- Openness（開放性）: 新しいアイデアや経験への興味、創造性
- Conscientiousness（誠実性）: 計画性、責任感、目標志向
- Extraversion（外向性）: 社交性、積極性、会話の活発さ
- Agreeableness（協調性）: 協力的態度、感謝表現、柔軟性
- Neuroticism（神経症傾向）: 不安傾向、確認行動、迷いの表現

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          properties: {
            openness: { type: 'number' },
            conscientiousness: { type: 'number' },
            extraversion: { type: 'number' },
            agreeableness: { type: 'number' },
            neuroticism: { type: 'number' },
          },
          required: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
        },
        descriptions: {
          type: 'object',
          properties: {
            openness: { type: 'string' },
            conscientiousness: { type: 'string' },
            extraversion: { type: 'string' },
            agreeableness: { type: 'string' },
            neuroticism: { type: 'string' },
          },
          required: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
        },
        dominantTrait: { type: 'string' },
        summary: { type: 'string' },
      },
      required: ['scores', 'descriptions', 'dominantTrait', 'summary'],
    }

    const result = await this.client.generateWithSchema<{
      scores: BigFiveScore
      descriptions: BigFiveAnalysis['descriptions']
      dominantTrait: string
      summary: string
    }>(prompt, schema)

    if (result.success && result.data) {
      return {
        ...result.data,
        dominantTrait: result.data.dominantTrait as keyof BigFiveScore,
      }
    }
    return null
  }

  private async analyzeMBTI(summaries: string): Promise<MBTIAnalysis | null> {
    const prompt = `以下のChatGPT会話履歴から、ユーザーのMBTI風性格タイプを診断してください。

会話履歴:
${summaries}

4つの軸それぞれを-100から+100のスコアで評価してください:
- E/I軸: 外向(+100) vs 内向(-100) - 会話スタイル、雑談傾向
- S/N軸: 直感(+100) vs 感覚(-100) - 抽象的思考 vs 具体的思考
- T/F軸: 感情(+100) vs 思考(-100) - 感情的アプローチ vs 論理的アプローチ
- J/P軸: 知覚(+100) vs 判断(-100) - 探索的 vs 計画的

4文字のタイプコード（例: INTJ）、日本語のタイプ名（例: 建築家）、ChatGPT活用スタイルの説明を出力してください。

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        axisScores: {
          type: 'object',
          properties: {
            ei: { type: 'number' },
            sn: { type: 'number' },
            tf: { type: 'number' },
            jp: { type: 'number' },
          },
          required: ['ei', 'sn', 'tf', 'jp'],
        },
        typeTitle: { type: 'string' },
        description: { type: 'string' },
        chatgptStyle: { type: 'string' },
      },
      required: ['type', 'axisScores', 'typeTitle', 'description', 'chatgptStyle'],
    }

    const result = await this.client.generateWithSchema<{
      type: string
      axisScores: MBTIAxisScore
      typeTitle: string
      description: string
      chatgptStyle: string
    }>(prompt, schema)

    return result.success && result.data ? result.data : null
  }

  private async analyzeThinkingStyle(summaries: string): Promise<ThinkingStyleAnalysis | null> {
    const prompt = `以下のChatGPT会話履歴から、ユーザーの思考スタイルを分析してください。

会話履歴:
${summaries}

4つの軸それぞれを-100から+100のスコアで評価してください:
- 論理的(-100) vs 創造的(+100): 論理的思考か創造的思考か
- 専門型(-100) vs 汎用型(+100): 特定分野の深堀りか幅広い探求か
- 実践的(-100) vs 理論的(+100): 実用的解決か理論的理解か
- 独立型(-100) vs 協調型(+100): 自己完結か対話重視か

ユニークな思考スタイル名（例: 「探求するエンジニア」）、説明、強み、特徴を出力してください。

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          properties: {
            logicalCreative: { type: 'number' },
            specialistGeneralist: { type: 'number' },
            practicalTheoretical: { type: 'number' },
            independentCollaborative: { type: 'number' },
          },
          required: ['logicalCreative', 'specialistGeneralist', 'practicalTheoretical', 'independentCollaborative'],
        },
        styleName: { type: 'string' },
        description: { type: 'string' },
        strengths: {
          type: 'array',
          items: { type: 'string' },
        },
        characteristics: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['scores', 'styleName', 'description', 'strengths', 'characteristics'],
    }

    const result = await this.client.generateWithSchema<{
      scores: ThinkingStyleScores
      styleName: string
      description: string
      strengths: string[]
      characteristics: string[]
    }>(prompt, schema)

    return result.success && result.data ? result.data : null
  }

  private async analyzeCommunication(summaries: string): Promise<CommunicationAnalysis | null> {
    const prompt = `以下のChatGPT会話履歴から、ユーザーのコミュニケーション傾向を分析してください。

会話履歴:
${summaries}

以下のパターンを特定してください:
- questionStyle: "direct"（直接的）/ "gradual"（段階的）/ "exploratory"（探索的）
- expectedResponseFormat: "concise"（簡潔）/ "detailed"（詳細）/ "interactive"（対話的）
- feedbackTendency: "immediate"（即座）/ "delayed"（遅延）/ "minimal"（最小限）
- informationProcessing: "structured"（構造的）/ "freeform"（自由形式）

各パターンの説明、強み、改善点、AIとの効果的な対話のベストプラクティスを出力してください。

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        patterns: {
          type: 'object',
          properties: {
            questionStyle: { type: 'string' },
            expectedResponseFormat: { type: 'string' },
            feedbackTendency: { type: 'string' },
            informationProcessing: { type: 'string' },
          },
          required: ['questionStyle', 'expectedResponseFormat', 'feedbackTendency', 'informationProcessing'],
        },
        descriptions: {
          type: 'object',
          properties: {
            questionStyle: { type: 'string' },
            expectedResponseFormat: { type: 'string' },
            feedbackTendency: { type: 'string' },
            informationProcessing: { type: 'string' },
          },
          required: ['questionStyle', 'expectedResponseFormat', 'feedbackTendency', 'informationProcessing'],
        },
        strengths: {
          type: 'array',
          items: { type: 'string' },
        },
        improvements: {
          type: 'array',
          items: { type: 'string' },
        },
        bestPractices: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['patterns', 'descriptions', 'strengths', 'improvements', 'bestPractices'],
    }

    const result = await this.client.generateWithSchema<{
      patterns: CommunicationPattern
      descriptions: CommunicationAnalysis['descriptions']
      strengths: string[]
      improvements: string[]
      bestPractices: string[]
    }>(prompt, schema)

    return result.success && result.data ? result.data : null
  }

  private async generatePersonalitySummary(
    summaries: string,
    previousResults: AnalysisResults
  ): Promise<PersonalitySummary | null> {
    const contextInfo = []
    if (previousResults.bigFive) {
      contextInfo.push(`Big Five: ${previousResults.bigFive.dominantTrait}が優勢、${previousResults.bigFive.summary}`)
    }
    if (previousResults.mbti) {
      contextInfo.push(`MBTI: ${previousResults.mbti.type}（${previousResults.mbti.typeTitle}）`)
    }
    if (previousResults.thinkingStyle) {
      contextInfo.push(`思考スタイル: ${previousResults.thinkingStyle.styleName}`)
    }

    const prompt = `以下のChatGPT会話履歴と分析結果から、ユーザーの総合的なパーソナリティサマリーを生成してください。

会話履歴:
${summaries}

これまでの分析結果:
${contextInfo.join('\n')}

以下を出力してください:
- title: ユニークで印象的なパーソナリティタイトル（例: 「探求する革新者」「論理の詩人」）
- emoji: タイトルに合った絵文字1つ
- tagline: 一言キャッチコピー（20文字以内）
- description: 3-5文での性格特徴の説明
- strengths: AI活用における3つの強み
- growthPoints: さらに活用を高める2つのポイント
- recommendations: 性格に基づく3つの具体的なAI活用提案

JSON形式で出力してください。`

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        emoji: { type: 'string' },
        tagline: { type: 'string' },
        description: { type: 'string' },
        strengths: {
          type: 'array',
          items: { type: 'string' },
        },
        growthPoints: {
          type: 'array',
          items: { type: 'string' },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['title', 'emoji', 'tagline', 'description', 'strengths', 'growthPoints', 'recommendations'],
    }

    const result = await this.client.generateWithSchema<PersonalitySummary>(prompt, schema)
    return result.success && result.data ? result.data : null
  }
}
