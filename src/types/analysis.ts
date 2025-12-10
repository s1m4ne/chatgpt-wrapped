export type AnalysisType =
  | 'word_analysis'
  | 'topic_classification'
  | 'theme_evolution'
  | 'top_sessions'
  | 'writing_style'
  | 'style_diagnosis'
  | 'best_quotes'

export interface WordAnalysis {
  topWords: { word: string; count: number }[]
  phrases: string[]
  importantWords: { word: string; tfidf: number }[]
}

export interface TopicClassification {
  topics: {
    name: string
    percentage: number
    emoji: string
    conversationIds: string[]
  }[]
}

export interface ThemeEvolution {
  months: {
    month: string
    mainTopics: string[]
    newTopics: string[]
  }[]
}

export interface TopSession {
  conversationId: string
  title: string
  reason: string
  score: number
}

export interface WritingStyle {
  characteristics: string[]
  emotionalTendency: string[]
  questionPatterns: string[]
}

export interface StyleDiagnosis {
  type: string
  compatibilityScore: number
  description: string
}

export interface BestQuote {
  quote: string
  context: string
  reason: string
}

export interface IntelligenceMap {
  points: {
    x: number
    y: number
    conversationId: string
    title: string
    summary: string
  }[]
  axisLabels: {
    xPositive: string
    xNegative: string
    yPositive: string
    yNegative: string
  }
}

export interface AnalysisResults {
  basicStats?: import('./statistics').BasicStats
  activityPattern?: import('./statistics').ActivityPattern
  insightsStats?: import('./statistics').InsightsStats
  behaviorStats?: import('./statistics').BehaviorStats
  wordAnalysis?: WordAnalysis
  topicClassification?: TopicClassification
  themeEvolution?: ThemeEvolution
  intelligenceMap?: IntelligenceMap
  topSessions?: TopSession[]
  writingStyle?: WritingStyle
  styleDiagnosis?: StyleDiagnosis
  bestQuotes?: BestQuote[]
}
