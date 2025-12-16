import type { StyleDiagnosis } from '../../types'

interface StyleDiagnosisCardProps {
  data: StyleDiagnosis
}

export function StyleDiagnosisCard({ data }: StyleDiagnosisCardProps) {
  // Create pixel bar for score
  const totalBlocks = 20
  const filledBlocks = Math.round((data.compatibilityScore / 100) * totalBlocks)

  return (
    <div className="pixel-box border-nes-pink bg-gray-900/80 p-4 sm:p-6">
      <h2 className="text-sm sm:text-base text-center mb-4 nes-pink crt-glow">
        GPT STYLE
      </h2>

      <div className="text-center mb-6">
        <p className="text-gray-400 text-xs">&gt; あなたのタイプは...</p>
      </div>

      {/* Type Badge */}
      <div className="text-center mb-6">
        <div className="inline-block px-4 py-2 pixel-box border-pink-400 bg-nes-pink">
          <span className="text-sm sm:text-base text-white">{data.type}</span>
        </div>
      </div>

      {/* Compatibility Score - Pixel Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400">&gt; GPT SYNC</span>
          <span className="nes-pink">{data.compatibilityScore}%</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: totalBlocks }, (_, i) => (
            <div
              key={i}
              className={`h-4 flex-1 ${
                i < filledBlocks ? 'bg-nes-pink' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
        <p className="text-gray-300 text-xs leading-relaxed">{data.description}</p>
      </div>
    </div>
  )
}
