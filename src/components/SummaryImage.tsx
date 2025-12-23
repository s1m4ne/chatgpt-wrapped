import { useRef } from 'react'
import html2canvas from 'html2canvas'
import type { BasicStats } from '../types'

interface SummaryDiagnosis {
  type: string
  compatibilityScore: number
  description: string
}

interface SummaryImageProps {
  stats: BasicStats
  diagnosis?: SummaryDiagnosis
  topics?: undefined
}

export function SummaryImage({ stats, diagnosis }: SummaryImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!containerRef.current) return

    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: '#111827',
      scale: 2,
    })

    const link = document.createElement('a')
    link.download = 'chatgpt-wrapped-personality.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Preview container - 1:1 aspect ratio for SNS */}
      <div
        ref={containerRef}
        className="aspect-square max-w-md mx-auto pixel-box border-nes-purple bg-gray-900 p-4 flex flex-col"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-base nes-pink crt-glow">
            ChatGPT Wrapped
          </h1>
          <p className="text-xs text-gray-500 mt-1">PERSONALITY ANALYSIS</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatBox value={stats.totalConversations.toLocaleString()} label="CHATS" />
          <StatBox value={stats.totalMessages.toLocaleString()} label="MSGS" />
          <StatBox value={stats.activeDays.toString()} label="DAYS" />
          <StatBox value={`${stats.longestStreak}`} label="STREAK" />
        </div>

        {/* Personality type */}
        {diagnosis && (
          <div className="pixel-box border-yellow-400 bg-yellow-400/10 p-3 mb-3 text-center flex-1">
            <div className="text-xs text-gray-400 mb-2">&gt; YOUR TYPE</div>
            <div className="text-sm text-yellow-400 mb-2">{diagnosis.type}</div>
            <div className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {diagnosis.description}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 text-center">
          <div className="text-xs text-gray-600">chatgpt-wrapped.vercel.app</div>
        </div>
      </div>

      {/* Download button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="px-4 py-2 pixel-btn bg-nes-purple border-purple-300 text-white text-xs"
        >
          &gt; DOWNLOAD PNG
        </button>
      </div>
    </div>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
      <div className="text-sm text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}
