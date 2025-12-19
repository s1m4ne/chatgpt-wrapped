import { useState } from 'react'

interface CardHeaderProps {
  title: string
  description: string
  colorClass?: string
}

export function CardHeader({ title, description, colorClass = 'nes-cyan' }: CardHeaderProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="text-center mb-6 relative">
      <div className="flex items-center justify-center gap-2">
        <h2 className={`text-sm sm:text-base ${colorClass} crt-glow`}>
          {title}
        </h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
          aria-label="説明を表示"
        >
          ⓘ
        </button>
      </div>

      {showInfo && (
        <div className="mt-2 p-2 pixel-box border-gray-600 bg-gray-800/90 text-xs text-gray-300">
          {description}
        </div>
      )}
    </div>
  )
}
