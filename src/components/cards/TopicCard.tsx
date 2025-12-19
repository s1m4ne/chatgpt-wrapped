import type { TopicClassification } from '../../types'
import { CardHeader } from './CardHeader'

interface TopicCardProps {
  data: TopicClassification
}

const PIXEL_COLORS = [
  '#ff004d', // nes-red
  '#ff77a8', // nes-pink
  '#ffa300', // nes-orange
  '#ffec27', // nes-yellow
  '#00e436', // nes-green
  '#29adff', // nes-cyan
  '#7e2553', // nes-purple
  '#1d2b53', // nes-blue
  '#ff6b9d',
  '#83769c',
]

export function TopicCard({ data }: TopicCardProps) {
  const maxPercentage = Math.max(...data.topics.map((t) => t.percentage))

  return (
    <div className="pixel-box border-nes-purple bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="TOPICS TOP10"
        description="ChatGPTとの会話でよく話題にしたトピックのランキングです"
        colorClass="nes-purple"
      />

      {/* Pixel Bar Chart */}
      <div className="space-y-2">
        {data.topics.slice(0, 10).map((topic, i) => {
          const barWidth = (topic.percentage / maxPercentage) * 100
          const totalBlocks = 15
          const filledBlocks = Math.round((barWidth / 100) * totalBlocks)

          return (
            <div key={i} className="flex items-center gap-2">
              {/* Rank */}
              <div className="w-6 text-xs text-gray-500 text-right">
                {i + 1}.
              </div>

              {/* Label */}
              <div className="w-20 sm:w-28 text-xs text-gray-300 truncate">
                {topic.emoji} {topic.name}
              </div>

              {/* Pixel Bar */}
              <div className="flex-1 flex gap-px">
                {Array.from({ length: totalBlocks }, (_, blockIndex) => (
                  <div
                    key={blockIndex}
                    className="h-3 flex-1"
                    style={{
                      backgroundColor:
                        blockIndex < filledBlocks
                          ? PIXEL_COLORS[i % PIXEL_COLORS.length]
                          : '#374151',
                    }}
                  />
                ))}
              </div>

              {/* Percentage */}
              <div
                className="w-12 text-xs text-right"
                style={{ color: PIXEL_COLORS[i % PIXEL_COLORS.length] }}
              >
                {topic.percentage.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend dots */}
      <div className="mt-4 pt-4 border-t-2 border-gray-700">
        <div className="flex flex-wrap gap-2 justify-center">
          {data.topics.slice(0, 5).map((topic, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: PIXEL_COLORS[i % PIXEL_COLORS.length] }}
              />
              <span className="text-xs text-gray-400">{topic.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
