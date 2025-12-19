import type { WordAnalysis } from '../../types'
import { CardHeader } from './CardHeader'

interface WordAnalysisCardProps {
  data: WordAnalysis
}

export function WordAnalysisCard({ data }: WordAnalysisCardProps) {
  return (
    <div className="pixel-box border-nes-cyan bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="WORDS"
        description="あなたがよく使う単語やフレーズの傾向を分析しています"
        colorClass="nes-cyan"
      />

      <div className="space-y-6">
        {/* Top Words */}
        <div>
          <h3 className="text-xs text-gray-400 mb-3">&gt; TOP 10 WORDS</h3>
          <div className="flex flex-wrap gap-2">
            {data.topWords.slice(0, 10).map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 pixel-box border-cyan-600 bg-cyan-500/20 text-cyan-300 text-xs"
              >
                {item.word}
                <span className="ml-1 nes-cyan">{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Phrases */}
        <div>
          <h3 className="text-xs text-gray-400 mb-3">&gt; PHRASES</h3>
          <div className="space-y-2">
            {data.phrases.slice(0, 5).map((phrase, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="nes-cyan">&gt;</span>
                <span className="text-gray-200">"{phrase}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Words */}
        <div>
          <h3 className="text-xs text-gray-400 mb-3">&gt; KEYWORDS</h3>
          <div className="flex flex-wrap gap-2">
            {data.importantWords.slice(0, 8).map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 pixel-box border-teal-600 bg-teal-500/20 text-teal-300 text-xs"
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
