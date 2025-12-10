import { useState, useCallback } from 'react'
import { useAnalysis } from './contexts'
import {
  FileUploader,
  ApiKeyManager,
  ProgressBar,
  CardSwiper,
  SummaryImage,
  StatsCard,
  ActivityCard,
  BehaviorCard,
  WordAnalysisCard,
  TopicCard,
  ThemeEvolutionCard,
  TopSessionsCard,
  WritingStyleCard,
  StyleDiagnosisCard,
  BestQuotesCard,
  IntelligenceMapCard,
} from './components'
import {
  parseConversationsFile,
  calculateBasicStats,
  calculateActivityPattern,
  calculateInsightsStats,
  calculateBehaviorStats,
  AnalysisOrchestrator,
} from './services'
import type { LLMProvider } from './types'

interface ApiKeyState {
  provider: LLMProvider
  apiKey: string | null
}

function App() {
  const { state, dispatch } = useAnalysis()
  const [apiKeyState, setApiKeyState] = useState<ApiKeyState>({
    provider: 'gemini',
    apiKey: null,
  })

  const handleApiKeyChange = useCallback((provider: LLMProvider, apiKey: string | null) => {
    setApiKeyState({ provider, apiKey })
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      dispatch({ type: 'START_PARSING' })

      const result = await parseConversationsFile(file)

      if (result.success && result.data) {
        dispatch({ type: 'PARSING_COMPLETE', conversations: result.data })

        // Calculate basic stats immediately (no LLM required)
        const basicStats = calculateBasicStats(result.data)
        const activityPattern = calculateActivityPattern(result.data)
        const insightsStats = calculateInsightsStats(result.data)
        const behaviorStats = calculateBehaviorStats(result.data)
        dispatch({ type: 'UPDATE_RESULTS', results: { basicStats, activityPattern, insightsStats, behaviorStats } })
      } else {
        dispatch({
          type: 'PARSING_ERROR',
          error: result.error?.message || 'ファイルの解析に失敗しました',
        })
      }
    },
    [dispatch]
  )

  const handleStartAnalysis = useCallback(async () => {
    if (!apiKeyState.apiKey || state.conversations.length === 0) return

    dispatch({ type: 'START_ANALYSIS' })

    const orchestrator = new AnalysisOrchestrator(apiKeyState.provider, apiKeyState.apiKey)

    try {
      const results = await orchestrator.runAllAnalyses(state.conversations, (progress, step) => {
        dispatch({ type: 'UPDATE_PROGRESS', progress, currentStep: step })
      })

      dispatch({ type: 'UPDATE_RESULTS', results })
      dispatch({ type: 'ANALYSIS_COMPLETE' })
    } catch (error) {
      dispatch({
        type: 'ANALYSIS_ERROR',
        error: error instanceof Error ? error.message : '分析に失敗しました',
      })
    }
  }, [apiKeyState, state.conversations, dispatch])

  const renderContent = () => {
    // Step 1: File upload
    if (state.conversations.length === 0) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              ChatGPT Wrapped
            </h1>
            <p className="text-gray-400">あなたの1年間のChatGPT利用を振り返ろう</p>
          </div>

          {state.error && (
            <div className="max-w-xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{state.error}</p>
            </div>
          )}

          <FileUploader onFileSelect={handleFileSelect} />

          <div className="text-center text-sm text-gray-500">
            <p>ChatGPTの設定 → データエクスポートから</p>
            <p>conversations.json をダウンロードしてください</p>
          </div>
        </div>
      )
    }

    // Step 2: API Key setup and analysis trigger
    if (state.status === 'idle' && !state.results.wordAnalysis) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              データ読み込み完了!
            </h1>
            <p className="text-gray-400">
              {state.conversations.length}件の会話が見つかりました
            </p>
          </div>

          {/* Show basic stats and activity immediately (no LLM required) */}
          {state.results.basicStats && <StatsCard stats={state.results.basicStats} />}
          {state.results.activityPattern && <ActivityCard activity={state.results.activityPattern} />}
          {state.results.behaviorStats && state.results.insightsStats && (
            <BehaviorCard behavior={state.results.behaviorStats} insights={state.results.insightsStats} />
          )}

          <div className="max-w-xl mx-auto space-y-4">
            <ApiKeyManager onApiKeyChange={handleApiKeyChange} />

            {apiKeyState.apiKey && (
              <button
                onClick={handleStartAnalysis}
                className={`w-full py-4 px-6 ${
                  apiKeyState.provider === 'gemini'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                } text-white font-bold rounded-xl transition-all transform hover:scale-105`}
              >
                {apiKeyState.provider === 'gemini' ? 'Gemini' : 'OpenAI'}で分析を開始 ✨
              </button>
            )}
          </div>
        </div>
      )
    }

    // Step 3: Analyzing
    if (state.status === 'analyzing') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              分析中...
            </h1>
            <p className="text-gray-400">AIがあなたの会話を分析しています</p>
          </div>

          <ProgressBar
            progress={state.progress}
            currentStep={state.currentStep}
            hasError={false}
            onRetry={handleStartAnalysis}
          />
        </div>
      )
    }

    // Step 4: Results
    if (state.status === 'complete' || state.results.wordAnalysis) {
      const cards = []

      if (state.results.basicStats) {
        cards.push(<StatsCard key="stats" stats={state.results.basicStats} />)
      }
      if (state.results.activityPattern) {
        cards.push(<ActivityCard key="activity" activity={state.results.activityPattern} />)
      }
      if (state.results.behaviorStats && state.results.insightsStats) {
        cards.push(
          <BehaviorCard
            key="behavior"
            behavior={state.results.behaviorStats}
            insights={state.results.insightsStats}
          />
        )
      }
      if (state.results.styleDiagnosis) {
        cards.push(<StyleDiagnosisCard key="diagnosis" data={state.results.styleDiagnosis} />)
      }
      if (state.results.topicClassification) {
        cards.push(<TopicCard key="topics" data={state.results.topicClassification} />)
      }
      if (state.results.wordAnalysis) {
        cards.push(<WordAnalysisCard key="words" data={state.results.wordAnalysis} />)
      }
      if (state.results.themeEvolution) {
        cards.push(<ThemeEvolutionCard key="themes" data={state.results.themeEvolution} />)
      }
      if (state.results.topSessions) {
        cards.push(<TopSessionsCard key="sessions" data={state.results.topSessions} />)
      }
      if (state.results.writingStyle) {
        cards.push(<WritingStyleCard key="style" data={state.results.writingStyle} />)
      }
      if (state.results.bestQuotes) {
        cards.push(<BestQuotesCard key="quotes" data={state.results.bestQuotes} />)
      }
      if (state.results.intelligenceMap) {
        cards.push(<IntelligenceMapCard key="map" data={state.results.intelligenceMap} />)
      }

      // Add summary image card at the end
      if (state.results.basicStats) {
        cards.push(
          <SummaryImage
            key="summary"
            stats={state.results.basicStats}
            diagnosis={state.results.styleDiagnosis}
            topics={state.results.topicClassification}
          />
        )
      }

      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              あなたの2024年
            </h1>
            <p className="text-gray-400">ChatGPTとの1年間を振り返ろう</p>
          </div>

          <CardSwiper>{cards}</CardSwiper>

          <div className="text-center">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-sm text-gray-500 hover:text-gray-400"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      )
    }

    // Error state
    if (state.status === 'error') {
      return (
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">エラーが発生しました</div>
          <p className="text-gray-400">{state.error}</p>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            最初からやり直す
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">{renderContent()}</div>
    </div>
  )
}

export default App
