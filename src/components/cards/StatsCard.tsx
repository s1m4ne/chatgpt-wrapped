import type { BasicStats } from '../../types'

interface StatsCardProps {
  stats: BasicStats
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

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-4 sm:p-8 backdrop-blur-sm border border-purple-500/20">
      {/* Header with date range */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          あなたの利用サマリー
        </h2>
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl py-4 px-6 mb-3 border border-purple-500/30">
          <p className="text-gray-400 text-xs mb-1">ChatGPTと出会って</p>
          <p className="text-3xl sm:text-4xl font-bold text-white">
            {formatNumber(daysSinceFirstUse)} <span className="text-lg text-pink-400">日</span>
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(stats.dateRange.start)} 〜 {formatDate(stats.dateRange.end)}
        </p>
      </div>

      {/* Main Stats - Hero Section */}
      <div className="bg-gray-800/40 rounded-xl p-4 sm:p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-bold text-white mb-1">
              {formatNumber(stats.totalConversations)}
            </div>
            <div className="text-sm text-gray-400">チャットスレッド</div>
            <div className="text-xs text-gray-500 mt-1">新規チャットを開いた回数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-bold text-white mb-1">
              {formatNumber(stats.totalMessages)}
            </div>
            <div className="text-sm text-gray-400">総メッセージ</div>
            <div className="text-xs text-gray-500 mt-1">やり取りしたメッセージ総数</div>
          </div>
        </div>

        {/* Message breakdown bar */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>あなた: {formatNumber(stats.userMessages)}件</span>
            <span>ChatGPT: {formatNumber(stats.assistantMessages)}件</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${userRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-purple-300">
            {avgMessagesPerConv}
          </div>
          <div className="text-xs text-gray-400">平均往復/会話</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-blue-300">
            {formatNumber(stats.activeDays)}日
          </div>
          <div className="text-xs text-gray-400">利用日数</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-orange-300">
            {stats.longestStreak}日
          </div>
          <div className="text-xs text-gray-400">最長連続</div>
        </div>
      </div>

      {/* Token info */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">
          推定トークン使用量: {formatNumber(stats.estimatedTokens)}
        </span>
      </div>
    </div>
  )
}
