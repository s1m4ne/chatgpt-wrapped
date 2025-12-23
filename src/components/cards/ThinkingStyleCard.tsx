import type { ThinkingStyleAnalysis } from '../../types'
import { CardHeader } from './CardHeader'

interface ThinkingStyleCardProps {
  data: ThinkingStyleAnalysis
}

const AXIS_CONFIG = [
  { key: 'logicalCreative', left: '論理的', right: '創造的', color: '#00d9ff' },
  { key: 'specialistGeneralist', left: '専門型', right: '汎用型', color: '#92cc41' },
  { key: 'practicalTheoretical', left: '実践的', right: '理論的', color: '#f7931a' },
  { key: 'independentCollaborative', left: '独立型', right: '協調型', color: '#f06292' },
] as const

export function ThinkingStyleCard({ data }: ThinkingStyleCardProps) {
  return (
    <div className="pixel-box border-nes-green bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="THINKING STYLE"
        description="あなたの思考パターンを4つの軸で分析しています"
        colorClass="nes-green"
      />

      {/* Style Name */}
      <div className="text-center mb-6">
        <div className="inline-block px-4 py-2 pixel-box border-green-400 bg-green-400/20">
          <span className="text-sm sm:text-base text-green-400">{data.styleName}</span>
        </div>
      </div>

      {/* 4-Axis Display */}
      <div className="space-y-3 mb-4">
        {AXIS_CONFIG.map(({ key, left, right, color }) => {
          const score = data.scores[key as keyof typeof data.scores]
          const position = ((score + 100) / 200) * 100

          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{left}</span>
                <span className="text-gray-400">{right}</span>
              </div>
              <div className="relative h-3 bg-gray-700">
                <div
                  className="absolute top-0 h-full w-px"
                  style={{ left: '50%', backgroundColor: '#555' }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: score >= 0 ? '50%' : `${position}%`,
                    width: `${Math.abs(score) / 2}%`,
                    backgroundColor: color,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-2"
                  style={{
                    left: `calc(${position}% - 4px)`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Description */}
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-3 mb-3">
        <p className="text-gray-300 text-xs leading-relaxed">{data.description}</p>
      </div>

      {/* Strengths & Characteristics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-green-400 text-xs mb-1">&gt; 強み</p>
          <div className="space-y-1">
            {data.strengths.slice(0, 3).map((s, i) => (
              <p key={i} className="text-gray-300 text-xs">+ {s}</p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-cyan-400 text-xs mb-1">&gt; 特徴</p>
          <div className="space-y-1">
            {data.characteristics.slice(0, 3).map((c, i) => (
              <p key={i} className="text-gray-300 text-xs">* {c}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
