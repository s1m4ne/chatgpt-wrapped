import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Conversation, AnalysisResults } from '../types'

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
  const [state, dispatch] = useReducer(analysisReducer, initialState)

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
