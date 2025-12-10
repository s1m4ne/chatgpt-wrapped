import { useRef } from 'react'
import html2canvas from 'html2canvas'
import type { BasicStats, StyleDiagnosis, TopicClassification } from '../types'

interface SummaryImageProps {
  stats: BasicStats
  diagnosis?: StyleDiagnosis
  topics?: TopicClassification
}

export function SummaryImage({ stats, diagnosis, topics }: SummaryImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!containerRef.current) return

    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: '#0f0f23',
      scale: 2,
    })

    const link = document.createElement('a')
    link.download = 'chatgpt-wrapped-2024.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const topTopics = topics?.topics.slice(0, 3) || []

  return (
    <div className="space-y-4">
      {/* Preview container - 1:1 aspect ratio for SNS */}
      <div
        ref={containerRef}
        className="aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 rounded-2xl p-6 flex flex-col"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My ChatGPT 2024
          </h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBox icon="💬" value={stats.totalConversations.toLocaleString()} label="会話" />
          <StatBox icon="📝" value={stats.totalMessages.toLocaleString()} label="メッセージ" />
          <StatBox icon="📅" value={stats.activeDays.toString()} label="アクティブ日" />
          <StatBox icon="🔥" value={`${stats.longestStreak}日`} label="連続記録" />
        </div>

        {/* Diagnosis type */}
        {diagnosis && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4 text-center">
            <div className="text-sm text-gray-400 mb-1">あなたのタイプ</div>
            <div className="text-xl font-bold text-purple-300">{diagnosis.type}</div>
            <div className="text-sm text-pink-400 mt-1">{diagnosis.compatibilityScore}% マッチ</div>
          </div>
        )}

        {/* Top topics */}
        {topTopics.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 flex-1">
            <div className="text-sm text-gray-400 mb-2">Top Topics</div>
            <div className="space-y-2">
              {topTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-lg">{topic.emoji}</span>
                  <span className="text-sm text-gray-300 flex-1">{topic.name}</span>
                  <span className="text-xs text-gray-500">{topic.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 text-center">
          <div className="text-xs text-gray-500">ChatGPT Wrapped 2024</div>
        </div>
      </div>

      {/* Download button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
        >
          <span>📲</span> SNS用画像をダウンロード
        </button>
      </div>
    </div>
  )
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}
