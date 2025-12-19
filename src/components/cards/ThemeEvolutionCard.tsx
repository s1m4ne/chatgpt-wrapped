import type { ThemeEvolution } from '../../types'
import { CardHeader } from './CardHeader'

interface ThemeEvolutionCardProps {
  data: ThemeEvolution
}

export function ThemeEvolutionCard({ data }: ThemeEvolutionCardProps) {
  return (
    <div className="pixel-box border-nes-green bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="EVOLUTION"
        description="月ごとの話題の変化を時系列で表示しています"
        colorClass="nes-green"
      />

      <div className="space-y-3">
        {data.months.map((month, i) => (
          <div key={i} className="relative pl-6 pb-3 border-l-2 border-emerald-600 last:border-l-0">
            {/* Timeline dot */}
            <div className="absolute left-[-5px] top-0 w-2 h-2 bg-nes-green" />

            <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
              <div className="text-xs nes-green mb-2">{month.month}</div>

              <div className="flex flex-wrap gap-1 mb-2">
                {month.mainTopics.map((topic, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {month.newTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {month.newTopics.map((topic, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs"
                    >
                      NEW: {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
