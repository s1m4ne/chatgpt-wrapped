import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Conversation, AnalysisResults } from '../types'

const STORAGE_KEY = 'chatgpt-wrapped-results'

export type AnalysisStatus = 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error'

export interface AnalysisState {
  status: AnalysisStatus
  progress: number
  currentStep: string
  conversations: Conversation[]
  results: AnalysisResults
  error: string | null
}

type AnalysisAction =
  | { type: 'START_PARSING' }
  | { type: 'PARSING_COMPLETE'; conversations: Conversation[] }
  | { type: 'PARSING_ERROR'; error: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'UPDATE_PROGRESS'; progress: number; currentStep: string }
  | { type: 'UPDATE_RESULTS'; results: Partial<AnalysisResults> }
  | { type: 'ANALYSIS_COMPLETE' }
  | { type: 'ANALYSIS_ERROR'; error: string }
  | { type: 'RESET' }

const initialState: AnalysisState = {
  status: 'idle',
  progress: 0,
  currentStep: '',
  conversations: [],
  results: {},
  error: null,
}

// 保存用の型（Dateを文字列に変換）
interface SerializedResults {
  basicStats?: {
    totalConversations: number
    totalMessages: number
    userMessages: number
    assistantMessages: number
    estimatedTokens: number
    activeDays: number
    longestStreak: number
    dateRange: {
      start: string
      end: string
    }
  }
  activityPattern?: AnalysisResults['activityPattern']
  insightsStats?: AnalysisResults['insightsStats']
  behaviorStats?: AnalysisResults['behaviorStats']
  bigFive?: AnalysisResults['bigFive']
  mbti?: AnalysisResults['mbti']
  thinkingStyle?: AnalysisResults['thinkingStyle']
  communication?: AnalysisResults['communication']
  personalitySummary?: AnalysisResults['personalitySummary']
}

// localStorageに保存するための変換（分析結果のみ）
function serializeResults(results: AnalysisResults): string {
  const toSave: SerializedResults = {
    ...results,
    basicStats: results.basicStats ? {
      ...results.basicStats,
      dateRange: {
        start: results.basicStats.dateRange.start.toISOString(),
        end: results.basicStats.dateRange.end.toISOString(),
      },
    } : undefined,
  }
  return JSON.stringify(toSave)
}

// localStorageから復元するための変換
function deserializeResults(json: string): AnalysisResults | null {
  try {
    const parsed: SerializedResults = JSON.parse(json)
    return {
      ...parsed,
      basicStats: parsed.basicStats ? {
        ...parsed.basicStats,
        dateRange: {
          start: new Date(parsed.basicStats.dateRange.start),
          end: new Date(parsed.basicStats.dateRange.end),
        },
      } : undefined,
    }
  } catch (e) {
    console.error('Failed to deserialize results:', e)
    return null
  }
}

// localStorageから初期状態を読み込む
function loadInitialState(): AnalysisState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const results = deserializeResults(saved)
      if (results && (results.basicStats || results.bigFive)) {
        console.log('[Storage] Restored results from localStorage')
        return {
          ...initialState,
          status: 'complete',
          results,
        }
      }
    }
  } catch (e) {
    console.error('[Storage] Failed to load from localStorage:', e)
  }
  return initialState
}

function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'START_PARSING':
      return {
        ...state,
        status: 'parsing',
        progress: 0,
        currentStep: 'ファイルを解析中...',
        error: null,
      }
    case 'PARSING_COMPLETE':
      return {
        ...state,
        status: 'idle',
        progress: 100,
        currentStep: '解析完了',
        conversations: action.conversations,
      }
    case 'PARSING_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      }
    case 'START_ANALYSIS':
      return {
        ...state,
        status: 'analyzing',
        progress: 0,
        currentStep: '分析を開始...',
        error: null,
      }
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.progress,
        currentStep: action.currentStep,
      }
    case 'UPDATE_RESULTS':
      return {
        ...state,
        results: { ...state.results, ...action.results },
      }
    case 'ANALYSIS_COMPLETE':
      return {
        ...state,
        status: 'complete',
        progress: 100,
        currentStep: '分析完了',
      }
    case 'ANALYSIS_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      }
    case 'RESET':
      // localStorageもクリア
      try {
        localStorage.removeItem(STORAGE_KEY)
        console.log('[Storage] Cleared localStorage')
      } catch {
        // 無視
      }
      return initialState
    default:
      return state
  }
}

interface AnalysisContextValue {
  state: AnalysisState
  dispatch: React.Dispatch<AnalysisAction>
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState, loadInitialState)

  // 状態が変わったらlocalStorageに保存（分析結果のみ）
  useEffect(() => {
    // parsing/analyzing中は保存しない
    if (state.status === 'parsing' || state.status === 'analyzing') {
      return
    }
    // 分析結果がある場合のみ保存
    if (state.results.basicStats || state.results.bigFive) {
      try {
        const serialized = serializeResults(state.results)
        localStorage.setItem(STORAGE_KEY, serialized)
        console.log('[Storage] Saved results to localStorage', { size: serialized.length })
      } catch (e) {
        console.error('[Storage] Failed to save to localStorage:', e)
      }
    }
  }, [state.status, state.results])

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>{children}</AnalysisContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}
