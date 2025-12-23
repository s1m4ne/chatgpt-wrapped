import type { MBTIAnalysis } from '../../types'
import { CardHeader } from './CardHeader'

interface MBTICardProps {
  data: MBTIAnalysis
}

const AXIS_CONFIG = [
  { key: 'ei', left: 'I (内向)', right: 'E (外向)', color: '#f06292' },
  { key: 'sn', left: 'S (感覚)', right: 'N (直感)', color: '#00d9ff' },
  { key: 'tf', left: 'T (思考)', right: 'F (感情)', color: '#92cc41' },
  { key: 'jp', left: 'J (判断)', right: 'P (知覚)', color: '#f7931a' },
] as const

export function MBTICard({ data }: MBTICardProps) {
  return (
    <div className="pixel-box border-nes-cyan bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="MBTI TYPE"
        description="4つの軸から導き出されたあなたの性格タイプです"
        colorClass="nes-cyan"
      />

      {/* Type Badge */}
      <div className="text-center mb-6">
        <div className="inline-block px-6 py-3 pixel-box border-cyan-400 bg-cyan-400/20">
          <span className="text-2xl sm:text-3xl text-cyan-400 font-bold tracking-wider">
            {data.type}
          </span>
        </div>
        <p className="text-gray-300 text-sm mt-2">{data.typeTitle}</p>
      </div>

      {/* Axis Sliders */}
      <div className="space-y-4 mb-4">
        {AXIS_CONFIG.map(({ key, left, right, color }) => {
          const score = data.axisScores[key]
          const position = ((score + 100) / 200) * 100

          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{left}</span>
                <span className="text-gray-400">{right}</span>
              </div>
              <div className="relative h-4 bg-gray-700 pixel-box border-gray-600">
                <div
                  className="absolute top-0 h-full w-1"
                  style={{
                    left: '50%',
                    backgroundColor: '#444',
                  }}
                />
                <div
                  className="absolute top-0 h-full w-3 pixel-box"
                  style={{
                    left: `calc(${position}% - 6px)`,
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

      {/* ChatGPT Style */}
      <div className="pixel-box border-cyan-400/50 bg-cyan-400/10 p-3">
        <p className="text-cyan-400 text-xs mb-1">&gt; AI活用スタイル</p>
        <p className="text-gray-300 text-xs leading-relaxed">{data.chatgptStyle}</p>
      </div>
    </div>
  )
}
