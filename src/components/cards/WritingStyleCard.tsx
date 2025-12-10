import type { WritingStyle } from '../../types'

interface WritingStyleCardProps {
  data: WritingStyle
}

export function WritingStyleCard({ data }: WritingStyleCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 rounded-2xl p-8 backdrop-blur-sm border border-indigo-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
        あなたの文章スタイル
      </h2>

      <div className="grid gap-6">
        {/* Characteristics */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-indigo-400 font-medium mb-3 flex items-center gap-2">
            <span>✍️</span> 文章の特徴
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.characteristics.map((char, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm"
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Emotional Tendency */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-violet-400 font-medium mb-3 flex items-center gap-2">
            <span>💭</span> 感情傾向
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.emotionalTendency.map((emotion, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Question Patterns */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-purple-400 font-medium mb-3 flex items-center gap-2">
            <span>❓</span> 質問パターン
          </h3>
          <ul className="space-y-2">
            {data.questionPatterns.map((pattern, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-purple-400 mt-1">•</span>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
