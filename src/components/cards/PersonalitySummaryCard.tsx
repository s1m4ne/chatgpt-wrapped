import type { PersonalitySummary } from '../../types'
import { CardHeader } from './CardHeader'

interface PersonalitySummaryCardProps {
  data: PersonalitySummary
}

export function PersonalitySummaryCard({ data }: PersonalitySummaryCardProps) {
  return (
    <div className="pixel-box border-yellow-400 bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="YOUR PERSONALITY"
        description="あなたのChatGPT利用パターンから導き出された総合的なパーソナリティ診断です"
        colorClass="text-yellow-400"
      />

      {/* Title with Emoji */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{data.emoji}</div>
        <div className="inline-block px-4 py-2 pixel-box border-yellow-400 bg-yellow-400/20">
          <span className="text-lg sm:text-xl text-yellow-400 font-bold">{data.title}</span>
        </div>
        <p className="text-gray-400 text-sm mt-2">「{data.tagline}」</p>
      </div>

      {/* Description */}
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-3 mb-4">
        <p className="text-gray-300 text-xs leading-relaxed">{data.description}</p>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <p className="text-green-400 text-xs mb-2">&gt; STRENGTHS</p>
        <div className="space-y-1">
          {data.strengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-green-400 text-xs">+</span>
              <span className="text-gray-300 text-xs">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Points */}
      <div className="mb-4">
        <p className="text-blue-400 text-xs mb-2">&gt; GROWTH POINTS</p>
        <div className="space-y-1">
          {data.growthPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-blue-400 text-xs">*</span>
              <span className="text-gray-300 text-xs">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p className="text-purple-400 text-xs mb-2">&gt; RECOMMENDATIONS</p>
        <div className="space-y-1">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-purple-400 text-xs">{i + 1}.</span>
              <span className="text-gray-300 text-xs">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
