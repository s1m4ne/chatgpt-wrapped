import type { BasicStats, ActivityPattern, BehaviorStats, InsightsStats } from '../types'

interface StatsSummaryProps {
  stats: BasicStats
  activity: ActivityPattern
  behavior: BehaviorStats
  insights: InsightsStats
}

export function StatsSummary({ stats, activity, behavior, insights }: StatsSummaryProps) {
  // ピーク時間を計算（hourlyHeatmapから）
  let peakHour = 0
  let peakHourCount = 0
  for (let hour = 0; hour < 24; hour++) {
    let hourTotal = 0
    for (let day = 0; day < 7; day++) {
      hourTotal += behavior.hourlyHeatmap.matrix[day]?.[hour] || 0
    }
    if (hourTotal > peakHourCount) {
      peakHourCount = hourTotal
      peakHour = hour
    }
  }

  // ピーク曜日を計算
  const peakDay = activity.weekdayDistribution.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    activity.weekdayDistribution[0]
  )

  return (
    <div className="pixel-box border-gray-600 bg-gray-800/50 p-4 space-y-4">
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">&gt; BASIC STATS</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg sm:text-xl text-white">{stats.totalConversations.toLocaleString()}</div>
          <div className="text-xs text-gray-500">会話</div>
        </div>
        <div>
          <div className="text-lg sm:text-xl text-white">{stats.totalMessages.toLocaleString()}</div>
          <div className="text-xs text-gray-500">メッセージ</div>
        </div>
        <div>
          <div className="text-lg sm:text-xl text-white">{stats.activeDays}</div>
          <div className="text-xs text-gray-500">日</div>
        </div>
        <div>
          <div className="text-lg sm:text-xl text-nes-orange">{stats.longestStreak}</div>
          <div className="text-xs text-gray-500">連続日数</div>
        </div>
      </div>

      {/* Activity Patterns */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="pixel-box border-gray-700 bg-gray-900/50 p-2">
          <span className="text-gray-500">ピーク時間: </span>
          <span className="text-nes-cyan">{peakHour}時台</span>
        </div>
        <div className="pixel-box border-gray-700 bg-gray-900/50 p-2">
          <span className="text-gray-500">ピーク曜日: </span>
          <span className="text-nes-cyan">{peakDay?.day || '-'}</span>
        </div>
      </div>

      {/* Behavior Highlights */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <div className="text-nes-green">{behavior.gratitude.thanksRate.toFixed(0)}%</div>
          <div className="text-gray-600">感謝度</div>
        </div>
        <div>
          <div className="text-nes-purple">{insights.questionStats.questionRate.toFixed(0)}%</div>
          <div className="text-gray-600">質問率</div>
        </div>
        <div>
          <div className="text-nes-pink">{behavior.confusion.confusionRate.toFixed(0)}%</div>
          <div className="text-gray-600">迷い度</div>
        </div>
      </div>

      {/* Top Keywords */}
      {insights.frequentWords.length > 0 && (
        <div className="text-xs">
          <span className="text-gray-500">よく使う言葉: </span>
          <span className="text-gray-300">
            {insights.frequentWords.slice(0, 5).map(w => w.word).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
