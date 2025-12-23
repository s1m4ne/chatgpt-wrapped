import type { CommunicationAnalysis } from '../../types'
import { CardHeader } from './CardHeader'

interface CommunicationCardProps {
  data: CommunicationAnalysis
}

const PATTERN_LABELS = {
  questionStyle: { label: '質問スタイル', icon: '?' },
  expectedResponseFormat: { label: '期待する回答', icon: '>' },
  feedbackTendency: { label: 'フィードバック', icon: '<' },
  informationProcessing: { label: '情報処理', icon: '#' },
} as const

const PATTERN_DISPLAY = {
  direct: '直接的',
  gradual: '段階的',
  exploratory: '探索的',
  concise: '簡潔',
  detailed: '詳細',
  interactive: '対話的',
  immediate: '即座',
  delayed: '遅延',
  minimal: '最小限',
  structured: '構造的',
  freeform: '自由形式',
} as const

export function CommunicationCard({ data }: CommunicationCardProps) {
  return (
    <div className="pixel-box border-nes-orange bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="COMMUNICATION"
        description="AIとのコミュニケーションパターンを分析しています"
        colorClass="nes-orange"
      />

      {/* Patterns Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.entries(data.patterns) as [keyof typeof PATTERN_LABELS, string][]).map(
          ([key, value]) => {
            const { label, icon } = PATTERN_LABELS[key]
            const displayValue = PATTERN_DISPLAY[value as keyof typeof PATTERN_DISPLAY] || value

            return (
              <div key={key} className="pixel-box border-gray-600 bg-gray-800/50 p-2">
                <p className="text-orange-400 text-xs mb-1">
                  {icon} {label}
                </p>
                <p className="text-gray-200 text-sm">{displayValue}</p>
              </div>
            )
          }
        )}
      </div>

      {/* Descriptions */}
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-3 mb-3 space-y-2">
        {(Object.entries(data.descriptions) as [keyof typeof PATTERN_LABELS, string][]).map(
          ([key, desc]) => (
            <p key={key} className="text-gray-300 text-xs">
              <span className="text-orange-400">{PATTERN_LABELS[key].label}:</span> {desc}
            </p>
          )
        )}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-green-400 text-xs mb-1">&gt; 強み</p>
          <div className="space-y-1">
            {data.strengths.slice(0, 2).map((s, i) => (
              <p key={i} className="text-gray-300 text-xs">+ {s}</p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-yellow-400 text-xs mb-1">&gt; 改善点</p>
          <div className="space-y-1">
            {data.improvements.slice(0, 2).map((s, i) => (
              <p key={i} className="text-gray-300 text-xs">* {s}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <p className="text-cyan-400 text-xs mb-1">&gt; BEST PRACTICES</p>
        <div className="space-y-1">
          {data.bestPractices.slice(0, 3).map((bp, i) => (
            <p key={i} className="text-gray-300 text-xs">
              {i + 1}. {bp}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
