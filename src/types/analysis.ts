import type {
  BigFiveAnalysis,
  MBTIAnalysis,
  ThinkingStyleAnalysis,
  CommunicationAnalysis,
  PersonalitySummary,
} from './personality'

export interface AnalysisResults {
  // 統計系（維持）
  basicStats?: import('./statistics').BasicStats
  activityPattern?: import('./statistics').ActivityPattern
  insightsStats?: import('./statistics').InsightsStats
  behaviorStats?: import('./statistics').BehaviorStats
  // 性格分析（新規）
  bigFive?: BigFiveAnalysis
  mbti?: MBTIAnalysis
  thinkingStyle?: ThinkingStyleAnalysis
  communication?: CommunicationAnalysis
  personalitySummary?: PersonalitySummary
}
