import type { StyleDiagnosis } from '../../types'

interface StyleDiagnosisCardProps {
  data: StyleDiagnosis
}

export function StyleDiagnosisCard({ data }: StyleDiagnosisCardProps) {
  return (
    <div className="bg-gradient-to-br from-rose-900/50 to-pink-900/50 rounded-2xl p-8 backdrop-blur-sm border border-rose-500/20">
      <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
        GPTスタイル診断
      </h2>

      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm">あなたのChatGPT活用タイプは...</p>
      </div>

      {/* Type Badge */}
      <div className="text-center mb-8">
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full">
          <span className="text-2xl font-bold text-white">{data.type}</span>
        </div>
      </div>

      {/* Compatibility Score */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">GPTとの相性</span>
          <span className="text-rose-400 font-bold">{data.compatibilityScore}%</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${data.compatibilityScore}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <p className="text-gray-300 text-sm leading-relaxed">{data.description}</p>
      </div>
    </div>
  )
}
