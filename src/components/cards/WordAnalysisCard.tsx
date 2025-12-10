import type { WordAnalysis } from '../../types'

interface WordAnalysisCardProps {
  data: WordAnalysis
}

export function WordAnalysisCard({ data }: WordAnalysisCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        よく使った言葉
      </h2>

      <div className="space-y-6">
        {/* Top Words */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">頻出ワードTOP10</h3>
          <div className="flex flex-wrap gap-2">
            {data.topWords.slice(0, 10).map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
              >
                {item.word}
                <span className="ml-1 text-blue-500">{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Phrases */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">口癖・頻出フレーズ</h3>
          <div className="space-y-2">
            {data.phrases.slice(0, 5).map((phrase, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-cyan-400">💬</span>
                <span className="text-gray-200">"{phrase}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Words */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">重要キーワード</h3>
          <div className="flex flex-wrap gap-2">
            {data.importantWords.slice(0, 8).map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm"
                style={{ fontSize: `${0.8 + item.tfidf * 0.3}rem` }}
              >
                {item.word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
