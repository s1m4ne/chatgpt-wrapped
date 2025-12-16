export interface BasicStats {
  totalConversations: number
  totalMessages: number
  userMessages: number
  assistantMessages: number
  estimatedTokens: number
  activeDays: number
  longestStreak: number
  dateRange: {
    start: Date
    end: Date
  }
}

export interface ActivityPattern {
  // 7x24 matrix (day of week x hour)
  hourlyHeatmap: number[][]
  monthlyMessages: MonthlyCount[]
  weekdayDistribution: WeekdayCount[]
  // GitHub-style yearly heatmap (keyed by year)
  yearlyHeatmaps: YearlyHeatmap[]
}

export interface DailyData {
  count: number
  conversationIds: string[]
}

export interface YearlyHeatmap {
  year: number
  // Map of date string (YYYY-MM-DD) to daily data
  dailyCounts: Record<string, number>
  // Map of date string (YYYY-MM-DD) to conversation IDs for that day
  dailyConversations: Record<string, string[]>
}

export interface MonthlyCount {
  month: string // YYYY-MM format
  count: number
}

export interface WeekdayCount {
  day: string // 'Mon', 'Tue', etc.
  dayIndex: number // 0-6
  count: number
}

export interface WordUsage {
  conversationId: string
  conversationTitle: string
  messageContent: string
  createTime: Date
}

export interface WordFrequency {
  word: string
  count: number
  usages: WordUsage[]
}

export interface QuestionPattern {
  pattern: string
  count: number
  examples: string[]
}

export interface QuestionStats {
  totalQuestions: number
  questionRate: number // percentage of user messages that are questions
  patterns: QuestionPattern[]
}

export interface MVPConversation {
  id: string
  title: string
  messageCount: number
  userMessageCount: number
  assistantMessageCount: number
  totalChars: number
  createTime: Date
  messages: { role: string; content: string; createTime?: Date }[]
}

export interface InsightsStats {
  frequentWords: WordFrequency[]
  questionStats: QuestionStats
  mvpConversations: MVPConversation[] // Top conversations by various metrics
  firstConversations: MVPConversation[] // Earliest conversations
}

export interface HourlyHeatmapData {
  // 7x24 matrix: [dayOfWeek][hour] = count
  matrix: number[][]
  peakHour: number
  peakDay: number
  peakCount: number
}

export interface PhraseUsage {
  conversationId: string
  conversationTitle: string
  messageContent: string
  createTime: Date
}

export interface CatchPhrase {
  phrase: string
  count: number
  usages: PhraseUsage[]
}

export interface GratitudeVariation {
  phrase: string
  count: number
  usages: PhraseUsage[]
}

export interface GratitudeStats {
  totalThanks: number
  thanksRate: number // percentage of messages with thanks
  variations: GratitudeVariation[]
}

export interface ConfusionPattern {
  pattern: string
  count: number
  usages: PhraseUsage[]
}

export interface ConfusionStats {
  totalConfused: number
  confusionRate: number
  patterns: ConfusionPattern[]
}

export interface NgramPhrase {
  phrase: string
  count: number
  n: number // 2 for bigram, 3 for trigram, etc.
  usages: PhraseUsage[]
}

export interface NgramStats {
  unigrams: NgramPhrase[] // 1-gram (単語)
  bigrams: NgramPhrase[] // 2-gram (2単語の組み合わせ)
  trigrams: NgramPhrase[] // 3-gram (3単語の組み合わせ)
}

export interface BehaviorStats {
  hourlyHeatmap: HourlyHeatmapData
  catchPhrases: CatchPhrase[]
  ngramPhrases: NgramStats
  gratitude: GratitudeStats
  confusion: ConfusionStats
}
