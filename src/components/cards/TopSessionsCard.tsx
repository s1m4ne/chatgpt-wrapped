import type { TopSession } from '../../types'
import { CardHeader } from './CardHeader'

interface TopSessionsCardProps {
  data: TopSession[]
}

export function TopSessionsCard({ data }: TopSessionsCardProps) {
  return (
    <div className="pixel-box border-nes-orange bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="BEST CHATS"
        description="AIが選んだ特に印象的だった会話のベスト5です"
        colorClass="nes-orange"
      />

      <div className="space-y-3">
        {data.slice(0, 5).map((session, i) => {
          const totalBlocks = 10
          const filledBlocks = Math.round((session.score / 100) * totalBlocks)

          return (
            <div
              key={i}
              className="pixel-box border-gray-600 bg-gray-800/50 p-3"
            >
              <div className="flex items-start gap-3">
                <div className="text-xs nes-orange">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs text-amber-300 mb-1 truncate">{session.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{session.reason}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-xs text-gray-500">SCORE:</div>
                    <div className="flex gap-px flex-1">
                      {Array.from({ length: totalBlocks }, (_, blockIndex) => (
                        <div
                          key={blockIndex}
                          className={`h-2 flex-1 ${
                            blockIndex < filledBlocks ? 'bg-nes-orange' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs nes-orange">{session.score}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
