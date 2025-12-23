import type { BigFiveAnalysis, BigFiveScore } from '../../types'
import { CardHeader } from './CardHeader'

interface BigFiveCardProps {
  data: BigFiveAnalysis
}

const TRAIT_LABELS: Record<keyof BigFiveScore, { name: string; color: string }> = {
  openness: { name: '開放性', color: 'nes-cyan' },
  conscientiousness: { name: '誠実性', color: 'nes-green' },
  extraversion: { name: '外向性', color: 'nes-orange' },
  agreeableness: { name: '協調性', color: 'nes-pink' },
  neuroticism: { name: '神経症傾向', color: 'nes-purple' },
}

export function BigFiveCard({ data }: BigFiveCardProps) {
  const traits = Object.entries(data.scores) as [keyof BigFiveScore, number][]
  const totalBlocks = 10

  return (
    <div className="pixel-box border-nes-purple bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="BIG FIVE (OCEAN)"
        description="心理学で最も信頼性の高い5因子モデルによる性格診断です"
        colorClass="nes-purple"
      />

      {/* Dominant Trait */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-xs">&gt; 最も顕著な特性</p>
        <div className="inline-block px-3 py-1 mt-1 pixel-box border-purple-400 bg-purple-400/20">
          <span className="text-purple-400 text-sm">
            {TRAIT_LABELS[data.dominantTrait]?.name || data.dominantTrait}
          </span>
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-3 mb-4">
        {traits.map(([trait, score]) => {
          const { name, color } = TRAIT_LABELS[trait]
          const filledBlocks = Math.round((score / 100) * totalBlocks)

          return (
            <div key={trait}>
              <div className="flex justify-between text-xs mb-1">
                <span className={color}>{name}</span>
                <span className="text-gray-400">{score}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: totalBlocks }, (_, i) => (
                  <div
                    key={i}
                    className={`h-3 flex-1 ${
                      i < filledBlocks ? `bg-${color.replace('nes-', '')}` : 'bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: i < filledBlocks ? getColorHex(color) : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
        <p className="text-gray-300 text-xs leading-relaxed">{data.summary}</p>
      </div>
    </div>
  )
}

function getColorHex(colorClass: string): string {
  const colors: Record<string, string> = {
    'nes-cyan': '#00d9ff',
    'nes-green': '#92cc41',
    'nes-orange': '#f7931a',
    'nes-pink': '#f06292',
    'nes-purple': '#9c27b0',
  }
  return colors[colorClass] || '#888888'
}
