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
    // Parsing state - show loading
    if (state.status === 'parsing') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl mb-4 pixel-gradient crt-glow">
              LOADING...
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              &gt; ファイルを読み込み中<span className="blink">_</span>
            </p>
          </div>

          <div className="max-w-xl mx-auto text-center">
            <div className="pixel-box p-8 border-nes-cyan">
              <div className="text-4xl mb-4 animate-pulse">📂</div>
              <p className="text-xs text-gray-400">
                会話データを解析しています...
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ファイルサイズによっては時間がかかる場合があります
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Step 1: File upload
    if (state.conversations.length === 0) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl mb-4 pixel-gradient crt-glow">
              ChatGPT Wrapped
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              &gt; あなたの今までのChatGPT利用を振り返ろう_<span className="blink">|</span>
            </p>
          </div>

          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm sm:text-base text-nes-cyan mb-4">
              ChatGPTから会話履歴をエクスポートしてアップロードしよう！
            </p>
          </div>

          {state.error && (
            <div className="max-w-xl mx-auto p-4 pixel-box border-red-500 bg-red-500/20">
              <p className="text-red-400 text-xs">{state.error}</p>
            </div>
          )}

          <FileUploader onFileSelect={handleFileSelect} />

          <div className="max-w-xl mx-auto pixel-box p-4 sm:p-6 border-gray-600">
            <p className="text-xs sm:text-sm text-nes-purple mb-3">&gt; エクスポート方法</p>
            <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
              <li><a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-nes-cyan hover:underline">chatgpt.com</a> にアクセス</li>
              <li>設定 → データコントロール → 「データをエクスポート」をクリック</li>
              <li>届いたメールからZIPをダウンロード<span className="text-gray-500">（数時間かかる場合があります）</span></li>
              <li>ZIPを解凍して <span className="text-nes-green">conversations.json</span> をアップロード</li>
            </ol>
          </div>
        </div>
      )
    }

    // Step 2: API Key setup and analysis trigger
    if (state.status === 'idle' && !state.results.wordAnalysis) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl mb-2 pixel-gradient crt-glow">
              DATA LOADED!
            </h1>
            <p className="text-xs text-gray-400">
              &gt; {state.conversations.length}件の会話を発見_<span className="blink">|</span>
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
                className={`w-full py-4 px-6 pixel-btn text-white text-xs sm:text-sm ${
                  apiKeyState.provider === 'gemini'
                    ? 'bg-nes-purple border-purple-300'
                    : 'bg-nes-green border-green-300'
                }`}
              >
                &gt; {apiKeyState.provider === 'gemini' ? 'GEMINI' : 'OPENAI'}で分析開始
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
            <h1 className="text-xl sm:text-2xl mb-2 pixel-gradient crt-glow">
              ANALYZING...
            </h1>
            <p className="text-xs text-gray-400">
              &gt; AIがあなたの会話を分析中<span className="blink">_</span>
            </p>
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
            <h1 className="text-xl sm:text-2xl mb-2 pixel-gradient crt-glow">
              YOUR HISTORY
            </h1>
            <p className="text-xs text-gray-400">
              &gt; ChatGPTとの歩み_<span className="blink">|</span>
            </p>
          </div>

          <CardSwiper>{cards}</CardSwiper>

          <div className="text-center">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-xs text-gray-500 hover:text-nes-cyan pixel-btn bg-gray-800 border-gray-600 px-4 py-2"
            >
              &gt; RESTART
            </button>
          </div>
        </div>
      )
    }

    // Error state
    if (state.status === 'error') {
      return (
        <div className="text-center space-y-4">
          <div className="text-xl nes-red crt-glow">ERROR!</div>
          <p className="text-xs text-gray-400">&gt; {state.error}</p>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-6 py-2 pixel-btn bg-gray-700 border-gray-500 text-xs"
          >
            &gt; RESTART
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-2 sm:px-4 relative scanlines">
      <div className="max-w-4xl mx-auto">{renderContent()}</div>
    </div>
  )
}

export default App
