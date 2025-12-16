import { useState } from 'react'
import type { IntelligenceMap } from '../../types'

interface IntelligenceMapCardProps {
  data: IntelligenceMap
}

export function IntelligenceMapCard({ data }: IntelligenceMapCardProps) {
  const [selectedPoint, setSelectedPoint] = useState<(typeof data.points)[0] | null>(null)

  const size = 280
  const padding = 40
  const pointSize = 4

  const toPixel = (value: number, axis: 'x' | 'y') => {
    const normalized = (value + 1) / 2
    if (axis === 'x') {
      return padding + normalized * (size - 2 * padding)
    }
    return size - padding - normalized * (size - 2 * padding)
  }

  return (
    <div className="pixel-box border-nes-cyan bg-gray-900/80 p-4 sm:p-6">
      <h2 className="text-sm sm:text-base text-center mb-6 nes-cyan crt-glow">
        INT MAP
      </h2>

      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="pixel-box border-gray-600 bg-gray-900/50">
          {/* Grid lines */}
          <line
            x1={padding}
            y1={size / 2}
            x2={size - padding}
            y2={size / 2}
            stroke="#374151"
            strokeWidth={2}
          />
          <line
            x1={size / 2}
            y1={padding}
            x2={size / 2}
            y2={size - padding}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Axis labels */}
          <text
            x={size - padding + 5}
            y={size / 2 + 4}
            fill="#29adff"
            fontSize={8}
            textAnchor="start"
            fontFamily="'Press Start 2P', monospace"
          >
            {data.axisLabels.xPositive}
          </text>
          <text
            x={padding - 5}
            y={size / 2 + 4}
            fill="#29adff"
            fontSize={8}
            textAnchor="end"
            fontFamily="'Press Start 2P', monospace"
          >
            {data.axisLabels.xNegative}
          </text>
          <text
            x={size / 2}
            y={padding - 10}
            fill="#00e436"
            fontSize={8}
            textAnchor="middle"
            fontFamily="'Press Start 2P', monospace"
          >
            {data.axisLabels.yPositive}
          </text>
          <text
            x={size / 2}
            y={size - padding + 15}
            fill="#00e436"
            fontSize={8}
            textAnchor="middle"
            fontFamily="'Press Start 2P', monospace"
          >
            {data.axisLabels.yNegative}
          </text>

          {/* Data points - pixel squares */}
          {data.points.map((point, i) => (
            <rect
              key={i}
              x={toPixel(point.x, 'x') - pointSize / 2}
              y={toPixel(point.y, 'y') - pointSize / 2}
              width={selectedPoint?.conversationId === point.conversationId ? pointSize * 2 : pointSize}
              height={selectedPoint?.conversationId === point.conversationId ? pointSize * 2 : pointSize}
              fill={selectedPoint?.conversationId === point.conversationId ? '#00e436' : '#29adff'}
              className="cursor-pointer"
              onClick={() => setSelectedPoint(point)}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          &gt; CLICK POINT FOR DETAILS
        </div>

        {/* Selected point details */}
        {selectedPoint && (
          <div className="mt-3 w-full pixel-box border-gray-600 bg-gray-800/50 p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs nes-cyan mb-1 truncate">{selectedPoint.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{selectedPoint.summary}</p>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-500 hover:text-gray-300 text-xs ml-2"
              >
                [X]
              </button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 w-full">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-sm nes-cyan">{data.points.length}</div>
            <div className="text-xs text-gray-400">POINTS</div>
          </div>
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-xs nes-green truncate">
              {data.axisLabels.xNegative}-{data.axisLabels.xPositive}
            </div>
            <div className="text-xs text-gray-400">AXIS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
