import type { ThemeEvolution } from '../../types'

interface ThemeEvolutionCardProps {
  data: ThemeEvolution
}

export function ThemeEvolutionCard({ data }: ThemeEvolutionCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-8 backdrop-blur-sm border border-green-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
        興味の変遷
      </h2>

      <div className="space-y-4">
        {data.months.map((month, i) => (
          <div key={i} className="relative pl-8 pb-4 border-l-2 border-green-500/30 last:border-l-0">
            {/* Timeline dot */}
            <div className="absolute left-[-9px] top-0 w-4 h-4 bg-green-500 rounded-full" />

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-green-400 font-medium mb-2">{month.month}</div>

              <div className="flex flex-wrap gap-2 mb-2">
                {month.mainTopics.map((topic, j) => (
                  <span
                    key={j}
                    className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {month.newTopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {month.newTopics.map((topic, j) => (
                    <span
                      key={j}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded flex items-center gap-1"
                    >
                      <span className="text-emerald-400">✨</span>
                      {topic}
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
