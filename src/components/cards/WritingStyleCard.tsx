import type { WritingStyle } from '../../types'
import { CardHeader } from './CardHeader'

interface WritingStyleCardProps {
  data: WritingStyle
}

export function WritingStyleCard({ data }: WritingStyleCardProps) {
  return (
    <div className="pixel-box border-nes-purple bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="STYLE"
        description="あなたの文章の特徴、感情傾向、質問パターンを分析しています"
        colorClass="nes-purple"
      />

      <div className="space-y-4">
        {/* Characteristics */}
        <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
          <h3 className="text-xs text-indigo-400 mb-3">&gt; TRAITS</h3>
          <div className="flex flex-wrap gap-2">
            {data.characteristics.map((char, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs"
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Emotional Tendency */}
        <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
          <h3 className="text-xs text-violet-400 mb-3">&gt; EMOTION</h3>
          <div className="flex flex-wrap gap-2">
            {data.emotionalTendency.map((emotion, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Question Patterns */}
        <div className="pixel-box border-gray-600 bg-gray-800/50 p-3">
          <h3 className="text-xs text-purple-400 mb-3">&gt; Q PATTERNS</h3>
          <ul className="space-y-1">
            {data.questionPatterns.map((pattern, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-purple-400">&gt;</span>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
