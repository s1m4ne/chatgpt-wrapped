import type { TopSession } from '../../types'

interface TopSessionsCardProps {
  data: TopSession[]
}

export function TopSessionsCard({ data }: TopSessionsCardProps) {
  return (
    <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-2xl p-8 backdrop-blur-sm border border-amber-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
        今年のベスト会話TOP5
      </h2>

      <div className="space-y-4">
        {data.slice(0, 5).map((session, i) => (
          <div
            key={i}
            className="bg-gray-800/50 rounded-lg p-4 border-l-4"
            style={{
              borderLeftColor: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#6b7280',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-300 mb-1">{session.title}</h3>
                <p className="text-sm text-gray-400">{session.reason}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs text-gray-500">スコア:</div>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${session.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-amber-400">{session.score}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
