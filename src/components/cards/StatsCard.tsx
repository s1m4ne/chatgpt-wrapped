import { useState, type ReactNode } from 'react'
import type { BasicStats } from '../../types'
import { CardHeader } from './CardHeader'

interface StatsCardProps {
  stats: BasicStats
}

interface TooltipStatProps {
  children: ReactNode
  description: string
}

function TooltipStat({ children, description }: TooltipStatProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 pixel-box border-gray-500 bg-gray-900 text-xs text-gray-300 whitespace-nowrap">
          {description}
        </div>
      )}
    </div>
  )
}

export function StatsCard({ stats }: StatsCardProps) {
  const formatNumber = (num: number) => num.toLocaleString()
  const formatDate = (date: Date) =>
    date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })

  // 平均メッセージ数/会話
  const avgMessagesPerConv =
    stats.totalConversations > 0
      ? Math.round(stats.totalMessages / stats.totalConversations)
      : 0

  // ユーザーメッセージとアシスタントメッセージの比率を計算
  const userRatio =
    stats.totalMessages > 0
      ? Math.round((stats.userMessages / stats.totalMessages) * 100)
      : 50

  // 初回利用日からの経過日数を計算
  const daysSinceFirstUse = Math.floor(
    (Date.now() - stats.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Create pixel bar for ratio
  const totalBlocks = 20
  const userBlocks = Math.round((userRatio / 100) * totalBlocks)

  return (
    <div className="pixel-box border-nes-purple bg-gray-900/80 p-4 sm:p-6">
      {/* Header with date range */}
      <div className="mb-6">
        <CardHeader
          title="YOUR STATS"
          description="会話数やメッセージ数など、ChatGPTとのやり取りの基本統計です"
          colorClass="nes-pink"
        />
        <div className="pixel-box border-purple-500 bg-purple-900/30 py-4 px-4 mb-3 text-center">
          <p className="text-gray-400 text-xs mb-1">&gt; ChatGPTと出会って</p>
          <p className="text-2xl sm:text-3xl text-white">
            {formatNumber(daysSinceFirstUse)} <span className="text-xs nes-pink">DAYS</span>
          </p>
        </div>
        <p className="text-xs text-gray-500 text-center">
          {formatDate(stats.dateRange.start)} - {formatDate(stats.dateRange.end)}
        </p>
      </div>

      {/* Main Stats - Hero Section */}
      <div className="pixel-box border-gray-600 bg-gray-800/40 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <TooltipStat description="開始した会話の総数">
            <div className="text-center">
              <div className="text-xl sm:text-3xl text-white mb-1">
                {formatNumber(stats.totalConversations)}
              </div>
              <div className="text-xs text-gray-400">THREADS</div>
            </div>
          </TooltipStat>
          <TooltipStat description="送受信したメッセージの総数">
            <div className="text-center">
              <div className="text-xl sm:text-3xl text-white mb-1">
                {formatNumber(stats.totalMessages)}
              </div>
              <div className="text-xs text-gray-400">MESSAGES</div>
            </div>
          </TooltipStat>
        </div>

        {/* Message breakdown bar - pixel style */}
        <TooltipStat description="あなたとChatGPTのメッセージ比率">
          <div className="mt-4 pt-4 border-t-2 border-gray-700">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>YOU: {formatNumber(stats.userMessages)}</span>
              <span>GPT: {formatNumber(stats.assistantMessages)}</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: totalBlocks }, (_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 ${
                    i < userBlocks ? 'bg-nes-purple' : 'bg-nes-cyan'
                  }`}
                />
              ))}
            </div>
          </div>
        </TooltipStat>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <TooltipStat description="1会話あたりの平均メッセージ数">
          <div className="pixel-box border-gray-600 bg-gray-800/30 p-2 text-center">
            <div className="text-sm sm:text-lg nes-purple">
              {avgMessagesPerConv}
            </div>
            <div className="text-xs text-gray-400">AVG/CHAT</div>
          </div>
        </TooltipStat>
        <TooltipStat description="ChatGPTを使った日数">
          <div className="pixel-box border-gray-600 bg-gray-800/30 p-2 text-center">
            <div className="text-sm sm:text-lg nes-cyan">
              {formatNumber(stats.activeDays)}
            </div>
            <div className="text-xs text-gray-400">DAYS</div>
          </div>
        </TooltipStat>
        <TooltipStat description="連続利用の最長記録（日数）">
          <div className="pixel-box border-gray-600 bg-gray-800/30 p-2 text-center">
            <div className="text-sm sm:text-lg nes-orange">
              {stats.longestStreak}
            </div>
            <div className="text-xs text-gray-400">STREAK</div>
          </div>
        </TooltipStat>
      </div>

      {/* Token info */}
      <TooltipStat description="推定トークン数">
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">
            &gt; TOKENS: {formatNumber(stats.estimatedTokens)}
          </span>
        </div>
      </TooltipStat>
    </div>
  )
}
