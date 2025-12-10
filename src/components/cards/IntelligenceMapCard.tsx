import { useState } from 'react'
import type { IntelligenceMap } from '../../types'

interface IntelligenceMapCardProps {
  data: IntelligenceMap
}

export function IntelligenceMapCard({ data }: IntelligenceMapCardProps) {
  const [selectedPoint, setSelectedPoint] = useState<(typeof data.points)[0] | null>(null)

  const size = 300
  const padding = 40
  const pointRadius = 6

  const toPixel = (value: number, axis: 'x' | 'y') => {
    const normalized = (value + 1) / 2
    if (axis === 'x') {
      return padding + normalized * (size - 2 * padding)
    }
    return size - padding - normalized * (size - 2 * padding)
  }

  return (
    <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 rounded-2xl p-8 backdrop-blur-sm border border-cyan-500/20">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
        あなたの知性マップ
      </h2>

      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="bg-gray-900/50 rounded-lg">
          {/* Grid lines */}
          <line
            x1={padding}
            y1={size / 2}
            x2={size - padding}
            y2={size / 2}
            stroke="#374151"
            strokeWidth={1}
          />
          <line
            x1={size / 2}
            y1={padding}
            x2={size / 2}
            y2={size - padding}
            stroke="#374151"
            strokeWidth={1}
          />

          {/* Axis labels */}
          <text
            x={size - padding + 5}
            y={size / 2 + 4}
            fill="#22d3ee"
            fontSize={10}
            textAnchor="start"
          >
            {data.axisLabels.xPositive}
          </text>
          <text x={padding - 5} y={size / 2 + 4} fill="#22d3ee" fontSize={10} textAnchor="end">
            {data.axisLabels.xNegative}
          </text>
          <text x={size / 2} y={padding - 10} fill="#2dd4bf" fontSize={10} textAnchor="middle">
            {data.axisLabels.yPositive}
          </text>
          <text
            x={size / 2}
            y={size - padding + 15}
            fill="#2dd4bf"
            fontSize={10}
            textAnchor="middle"
          >
            {data.axisLabels.yNegative}
          </text>

          {/* Data points */}
          {data.points.map((point, i) => (
            <circle
              key={i}
              cx={toPixel(point.x, 'x')}
              cy={toPixel(point.y, 'y')}
              r={selectedPoint?.conversationId === point.conversationId ? pointRadius * 1.5 : pointRadius}
              fill={selectedPoint?.conversationId === point.conversationId ? '#22d3ee' : '#0891b2'}
              stroke="#fff"
              strokeWidth={1}
              className="cursor-pointer transition-all hover:fill-cyan-400"
              onClick={() => setSelectedPoint(point)}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          各点は会話を表しています。クリックで詳細を表示
        </div>

        {/* Selected point details */}
        {selectedPoint && (
          <div className="mt-4 w-full bg-gray-800/50 rounded-lg p-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-cyan-300 mb-1">{selectedPoint.title}</h3>
                <p className="text-sm text-gray-400">{selectedPoint.summary}</p>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-500 hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 w-full">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{data.points.length}</div>
            <div className="text-xs text-gray-400">マッピング会話数</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-sm font-medium text-teal-400">
              {data.axisLabels.xNegative} ↔ {data.axisLabels.xPositive}
            </div>
            <div className="text-xs text-gray-400">主要な軸</div>
          </div>
        </div>
      </div>
    </div>
  )
}
