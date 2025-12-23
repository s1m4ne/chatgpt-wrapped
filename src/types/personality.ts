// Big Five (OCEAN) 診断
export interface BigFiveScore {
  openness: number // 0-100: 開放性
  conscientiousness: number // 0-100: 誠実性
  extraversion: number // 0-100: 外向性
  agreeableness: number // 0-100: 協調性
  neuroticism: number // 0-100: 神経症傾向
}

export interface BigFiveAnalysis {
  scores: BigFiveScore
  descriptions: {
    openness: string
    conscientiousness: string
    extraversion: string
    agreeableness: string
    neuroticism: string
  }
  dominantTrait: keyof BigFiveScore
  summary: string
}

// MBTI風タイプ診断
export interface MBTIAxisScore {
  ei: number // -100 (I) to +100 (E)
  sn: number // -100 (S) to +100 (N)
  tf: number // -100 (T) to +100 (F)
  jp: number // -100 (J) to +100 (P)
}

export interface MBTIAnalysis {
  type: string // e.g., "INTJ"
  axisScores: MBTIAxisScore
  typeTitle: string // e.g., "建築家"
  description: string
  chatgptStyle: string // ChatGPT活用スタイル
}

// 思考スタイル分析
export interface ThinkingStyleScores {
  logicalCreative: number // -100 (論理的) to +100 (創造的)
  specialistGeneralist: number // -100 (専門型) to +100 (汎用型)
  practicalTheoretical: number // -100 (実践的) to +100 (理論的)
  independentCollaborative: number // -100 (独立型) to +100 (協調型)
}

export interface ThinkingStyleAnalysis {
  scores: ThinkingStyleScores
  styleName: string
  description: string
  strengths: string[]
  characteristics: string[]
}

// コミュニケーション傾向分析
export type QuestionStyle = 'direct' | 'gradual' | 'exploratory'
export type ResponseFormat = 'concise' | 'detailed' | 'interactive'
export type FeedbackTendency = 'immediate' | 'delayed' | 'minimal'
export type InformationProcessing = 'structured' | 'freeform'

export interface CommunicationPattern {
  questionStyle: QuestionStyle
  expectedResponseFormat: ResponseFormat
  feedbackTendency: FeedbackTendency
  informationProcessing: InformationProcessing
}

export interface CommunicationAnalysis {
  patterns: CommunicationPattern
  descriptions: {
    questionStyle: string
    expectedResponseFormat: string
    feedbackTendency: string
    informationProcessing: string
  }
  strengths: string[]
  improvements: string[]
  bestPractices: string[]
}

// 総合パーソナリティサマリー
export interface PersonalitySummary {
  title: string // e.g., "探求する革新者"
  emoji: string // e.g., "🔬"
  tagline: string // 一言キャッチコピー
  description: string // 3-5文の説明
  strengths: string[] // 3つの強み
  growthPoints: string[] // 2つの成長ポイント
  recommendations: string[] // おすすめ活用法
}

// 性格分析タイプ
export type PersonalityAnalysisType =
  | 'big_five'
  | 'mbti'
  | 'thinking_style'
  | 'communication'
  | 'summary'
