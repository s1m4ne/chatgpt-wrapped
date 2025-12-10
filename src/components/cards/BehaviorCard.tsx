import { useState } from 'react'
import type {
  BehaviorStats,
  InsightsStats,
  CatchPhrase,
  GratitudeVariation,
  ConfusionPattern,
  PhraseUsage,
  NgramPhrase,
  MVPConversation,
  WordFrequency,
} from '../../types'

interface BehaviorCardProps {
  behavior: BehaviorStats
  insights: InsightsStats
}

export function BehaviorCard({ behavior, insights }: BehaviorCardProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* 1. ヒートマップ */}
      <HourlyHeatmapSection data={behavior.hourlyHeatmap} />
      {/* 2. 年間MVP会話 */}
      <MVPConversationsSection conversations={insights.mvpConversations} />
      {/* 3. はじめての会話 */}
      <FirstConversationsSection conversations={insights.firstConversations} />
      {/* 4. 頻出フレーズ（N-gram） */}
      <NgramPhrasesSection ngrams={behavior.ngramPhrases} />
      {/* 5. 頻出キーワード */}
      <FrequentWordsSection words={insights.frequentWords} />
      {/* 6. 口癖 */}
      <CatchPhrasesSection phrases={behavior.catchPhrases} />
      {/* 7. 感謝度 */}
      <GratitudeSection gratitude={behavior.gratitude} />
      {/* 8. 迷い度 */}
      <ConfusionSection confusion={behavior.confusion} />
      {/* 9. 質問の傾向 */}
      <QuestionStatsSection stats={insights.questionStats} />
    </div>
  )
}

function HourlyBarChart({
  hourlyTotals,
}: {
  hourlyTotals: number[]
  peakHour: number
}) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  const maxHourly = Math.max(...hourlyTotals, 1)
  const barHeight = 80 // px

  // 時間帯による色分け
  const getBarColor = (h: number) => {
    if (h >= 0 && h < 6) return 'bg-indigo-500' // 深夜
    if (h >= 6 && h < 12) return 'bg-yellow-500' // 午前
    if (h >= 12 && h < 18) return 'bg-orange-500' // 午後
    return 'bg-purple-500' // 夜
  }

  return (
    <div className="mb-6">
      <div className="text-xs text-gray-400 mb-2">1時間ごとの利用分布</div>
      <div
        className="flex items-end gap-[2px] px-1 relative"
        style={{ height: `${barHeight}px` }}
        onMouseLeave={() => setHoveredHour(null)}
      >
        {hourlyTotals.map((count, hour) => {
          const heightPx = count > 0 ? Math.max((count / maxHourly) * barHeight, 4) : 0
          const isHovered = hour === hoveredHour

          return (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer relative"
              onMouseEnter={() => setHoveredHour(hour)}
            >
              <div
                className={`w-full rounded-t-sm transition-all ${getBarColor(hour)} ${isHovered ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                style={{ height: `${heightPx}px` }}
              />
              {/* ポップアップ */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-600 rounded-lg px-2 py-1 text-xs whitespace-nowrap z-20 shadow-lg">
                  <div className="text-blue-300 font-medium">{hour}:00-{hour + 1}:00</div>
                  <div className="text-pink-400">{count}件</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-600" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* 時間ラベル */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
      {/* 凡例 */}
      <div className="flex justify-center gap-3 mt-2 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-indigo-500" />深夜
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-yellow-500" />午前
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-orange-500" />午後
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-purple-500" />夜
        </span>
      </div>
    </div>
  )
}

function HourlyHeatmapSection({ data }: { data: BehaviorStats['hourlyHeatmap'] }) {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const dayFullNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  const maxValue = Math.max(...data.matrix.flat(), 1)

  // 時間帯ごとの合計を計算
  const hourlyTotals = Array.from({ length: 24 }, (_, hour) =>
    data.matrix.reduce((sum, dayRow) => sum + dayRow[hour], 0)
  )

  // 曜日ごとの合計を計算
  const dailyTotals = data.matrix.map((dayRow) => dayRow.reduce((sum, val) => sum + val, 0))

  // 時間帯の分類
  const getTimeCategory = (hour: number) => {
    if (hour >= 0 && hour < 6) return '深夜'
    if (hour >= 6 && hour < 12) return '午前'
    if (hour >= 12 && hour < 18) return '午後'
    return '夜'
  }

  // 時間帯別の合計
  const timeCategoryTotals = {
    深夜: hourlyTotals.slice(0, 6).reduce((a, b) => a + b, 0),
    午前: hourlyTotals.slice(6, 12).reduce((a, b) => a + b, 0),
    午後: hourlyTotals.slice(12, 18).reduce((a, b) => a + b, 0),
    夜: hourlyTotals.slice(18, 24).reduce((a, b) => a + b, 0),
  }

  // 朝型/夜型判定
  const morningActivity = timeCategoryTotals.午前
  const nightActivity = timeCategoryTotals.夜 + timeCategoryTotals.深夜
  const chronotype =
    morningActivity > nightActivity * 1.5
      ? { label: '朝型', emoji: '🌅', color: 'text-yellow-400' }
      : nightActivity > morningActivity * 1.5
        ? { label: '夜型', emoji: '🌙', color: 'text-indigo-400' }
        : { label: 'バランス型', emoji: '⚖️', color: 'text-green-400' }

  // 最もアクティブな曜日
  const maxDayIndex = dailyTotals.indexOf(Math.max(...dailyTotals))

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-800'
    const intensity = value / maxValue
    if (intensity < 0.25) return 'bg-blue-900'
    if (intensity < 0.5) return 'bg-blue-700'
    if (intensity < 0.75) return 'bg-blue-500'
    return 'bg-blue-400'
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4 text-blue-300">
        あなたの利用リズム
      </h3>

      {/* Chronotype and Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">{chronotype.emoji}</div>
          <div className={`font-bold ${chronotype.color}`}>{chronotype.label}</div>
          <div className="text-xs text-gray-500">あなたのタイプ</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-xl font-bold text-blue-300">
            {data.peakHour}:00
          </div>
          <div className="text-xs text-gray-400">ピーク時間</div>
          <div className="text-xs text-gray-500">{getTimeCategory(data.peakHour)}帯</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-lg sm:text-xl font-bold text-purple-300">
            {dayFullNames[maxDayIndex]}
          </div>
          <div className="text-xs text-gray-400">最も活発な曜日</div>
          <div className="text-xs text-gray-500">{dailyTotals[maxDayIndex]}件</div>
        </div>
      </div>

      {/* Hourly Bar Chart - 24時間の利用分布 */}
      <HourlyBarChart hourlyTotals={hourlyTotals} peakHour={data.peakHour} />

      {/* Detailed Heatmap */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="text-xs text-gray-400 mb-2">詳細ヒートマップ（クリックでメッセージ数を確認）</div>
        <div className="min-w-[400px]">
          {/* Hour labels */}
          <div className="flex mb-1" style={{ marginLeft: '28px' }}>
            {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => (
              <div
                key={hour}
                className="text-[10px] text-gray-500"
                style={{ width: '48px' }}
              >
                {hour}時
              </div>
            ))}
          </div>

          {/* Grid */}
          {dayNames.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-0.5">
              <div
                className="text-[11px] text-gray-400 text-right pr-2"
                style={{ width: '28px' }}
              >
                {day}
              </div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={`rounded-sm ${getColor(data.matrix[dayIndex][hour])} cursor-default transition-transform hover:scale-125 hover:z-10`}
                  style={{ width: '14px', height: '14px', margin: '1px' }}
                  title={`${dayFullNames[dayIndex]} ${hour}時台: ${data.matrix[dayIndex][hour]}件`}
                />
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end mt-3 gap-1 text-[10px] text-gray-500">
            <span>少</span>
            <div className="w-3 h-3 rounded-sm bg-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-blue-900" />
            <div className="w-3 h-3 rounded-sm bg-blue-700" />
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <div className="w-3 h-3 rounded-sm bg-blue-400" />
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CatchPhrasesSection({ phrases }: { phrases: BehaviorStats['catchPhrases'] }) {
  const [selectedPhrase, setSelectedPhrase] = useState<CatchPhrase | null>(null)

  if (phrases.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 text-orange-300">
          あなたの口癖
        </h3>
        <p className="text-sm text-gray-400">口癖は検出されませんでした</p>
      </div>
    )
  }

  const maxCount = phrases[0]?.count || 1

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-orange-300">
          あなたの口癖
        </h3>
        <p className="text-xs text-gray-400 mb-3">クリックして使用した会話を確認</p>
        <div className="space-y-2">
          {phrases.map((phrase, index) => {
            const percentage = (phrase.count / maxCount) * 100
            return (
              <button
                key={index}
                onClick={() => setSelectedPhrase(phrase)}
                className="relative w-full text-left hover:scale-[1.02] transition-transform"
              >
                <div
                  className="absolute inset-0 bg-orange-500/20 rounded"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-orange-100">「{phrase.phrase}」</span>
                  <span className="text-sm font-semibold text-orange-400">{phrase.count}回</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedPhrase && (
        <PhraseUsageModal
          title={`「${selectedPhrase.phrase}」の使用例`}
          count={selectedPhrase.count}
          usages={selectedPhrase.usages}
          color="orange"
          onClose={() => setSelectedPhrase(null)}
        />
      )}
    </>
  )
}

function NgramPhrasesSection({ ngrams }: { ngrams: BehaviorStats['ngramPhrases'] }) {
  const [selectedPhrase, setSelectedPhrase] = useState<NgramPhrase | null>(null)

  const hasUnigrams = ngrams.unigrams.length > 0
  const hasBigrams = ngrams.bigrams.length > 0
  const hasTrigrams = ngrams.trigrams.length > 0

  if (!hasUnigrams && !hasBigrams && !hasTrigrams) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 text-cyan-300">
          あなたの定番フレーズ
        </h3>
        <p className="text-sm text-gray-400">定番フレーズは検出されませんでした</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-cyan-300">
          あなたの定番フレーズ
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          よく使う単語・フレーズを自動検出
        </p>

        {/* Unigrams (1単語) */}
        {hasUnigrams && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-cyan-200 mb-2">頻出単語</h4>
            <div className="flex flex-wrap gap-2">
              {ngrams.unigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-sm bg-sky-500/20 text-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-500/30 transition-colors"
                >
                  {phrase.phrase}
                  <span className="text-xs ml-1.5 text-sky-400">({phrase.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bigrams (2単語) */}
        {hasBigrams && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-cyan-200 mb-2">2単語の組み合わせ</h4>
            <div className="flex flex-wrap gap-2">
              {ngrams.bigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-sm bg-cyan-500/20 text-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  {phrase.phrase}
                  <span className="text-xs ml-1.5 text-cyan-400">({phrase.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trigrams (3単語) */}
        {hasTrigrams && (
          <div>
            <h4 className="text-sm font-medium text-cyan-200 mb-2">3単語の組み合わせ</h4>
            <div className="flex flex-wrap gap-2">
              {ngrams.trigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-sm bg-teal-500/20 text-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-500/30 transition-colors"
                >
                  {phrase.phrase}
                  <span className="text-xs ml-1.5 text-teal-400">({phrase.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPhrase && (
        <PhraseUsageModal
          title={`「${selectedPhrase.phrase}」の使用例`}
          count={selectedPhrase.count}
          usages={selectedPhrase.usages}
          color="cyan"
          onClose={() => setSelectedPhrase(null)}
        />
      )}
    </>
  )
}

function GratitudeSection({ gratitude }: { gratitude: BehaviorStats['gratitude'] }) {
  const [selectedVariation, setSelectedVariation] = useState<GratitudeVariation | null>(null)

  const getGratitudeLevel = (rate: number) => {
    if (rate >= 20) return { emoji: '🙏', label: '超感謝派', color: 'text-green-400' }
    if (rate >= 10) return { emoji: '😊', label: '感謝派', color: 'text-green-300' }
    if (rate >= 5) return { emoji: '👍', label: '普通', color: 'text-yellow-400' }
    return { emoji: '😐', label: 'クール派', color: 'text-gray-400' }
  }

  const level = getGratitudeLevel(gratitude.thanksRate)

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-300">
          あなたの感謝スタイル
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{level.emoji}</div>
          <div>
            <div className={`text-xl font-bold ${level.color}`}>{level.label}</div>
            <div className="text-sm text-gray-400">
              メッセージの{gratitude.thanksRate.toFixed(1)}%に感謝の言葉
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {gratitude.totalThanks.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">感謝の回数</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">よく使う表現（クリックで詳細）</div>
            <div className="space-y-1">
              {gratitude.variations.slice(0, 3).map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariation(v)}
                  className="w-full text-xs text-green-300 flex justify-between hover:bg-green-500/20 rounded px-1 py-0.5 transition-colors"
                >
                  <span>{v.phrase}</span>
                  <span>{v.count}回</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedVariation && (
        <PhraseUsageModal
          title={`「${selectedVariation.phrase}」の使用例`}
          count={selectedVariation.count}
          usages={selectedVariation.usages}
          color="green"
          onClose={() => setSelectedVariation(null)}
        />
      )}
    </>
  )
}

function ConfusionSection({ confusion }: { confusion: BehaviorStats['confusion'] }) {
  const [selectedPattern, setSelectedPattern] = useState<ConfusionPattern | null>(null)

  const getConfusionLevel = (rate: number) => {
    if (rate >= 30) return { emoji: '😵', label: '迷子気味', color: 'text-red-400' }
    if (rate >= 20) return { emoji: '🤔', label: '探求者', color: 'text-yellow-400' }
    if (rate >= 10) return { emoji: '🧐', label: '学習者', color: 'text-blue-400' }
    return { emoji: '😎', label: '自信家', color: 'text-green-400' }
  }

  const level = getConfusionLevel(confusion.confusionRate)

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-300">
          あなたの迷いポイント
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{level.emoji}</div>
          <div>
            <div className={`text-xl font-bold ${level.color}`}>{level.label}</div>
            <div className="text-sm text-gray-400">
              メッセージの{confusion.confusionRate.toFixed(1)}%に困惑表現
            </div>
          </div>
        </div>

        {confusion.patterns.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">困った時のパターン（クリックで詳細）</div>
            <div className="flex flex-wrap gap-2">
              {confusion.patterns.slice(0, 6).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPattern(p)}
                  className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full hover:bg-red-500/40 transition-colors"
                >
                  {p.pattern} ({p.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPattern && (
        <PhraseUsageModal
          title={`「${selectedPattern.pattern}」の使用例`}
          count={selectedPattern.count}
          usages={selectedPattern.usages}
          color="red"
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </>
  )
}

// Shared modal component for phrase usage
function PhraseUsageModal({
  title,
  count,
  usages,
  color,
  onClose,
}: {
  title: string
  count: number
  usages: PhraseUsage[]
  color: 'orange' | 'green' | 'red' | 'cyan'
  onClose: () => void
}) {
  const colorClasses = {
    orange: {
      header: 'text-orange-300',
      title: 'text-orange-300',
    },
    green: {
      header: 'text-green-300',
      title: 'text-green-300',
    },
    red: {
      header: 'text-red-300',
      title: 'text-red-300',
    },
    cyan: {
      header: 'text-cyan-300',
      title: 'text-cyan-300',
    },
  }

  const colors = colorClasses[color]

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className={`font-semibold ${colors.header}`}>{title}</h3>
            <p className="text-xs text-gray-400">
              {count}回使用 • {usages.length}件の会話
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Usage List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {usages.map((usage, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className={`font-medium ${colors.title} text-sm truncate flex-1`}>
                  {usage.conversationTitle}
                </div>
                <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {usage.createTime.toLocaleDateString('ja-JP')}
                </div>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {truncateText(usage.messageContent, 200)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// InsightsCard sections moved here for unified ordering
// =====================================================

function FrequentWordsSection({ words }: { words: InsightsStats['frequentWords'] }) {
  const [selectedWord, setSelectedWord] = useState<WordFrequency | null>(null)

  if (words.length === 0) return null

  const maxCount = words[0]?.count || 1

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
          あなたの頻出ワード
        </h3>
        <p className="text-xs text-gray-400 mb-3">会話によく登場するワード（クリックで詳細）</p>
        <div className="flex flex-wrap gap-2">
          {words.slice(0, 20).map((item, index) => {
            const intensity = item.count / maxCount
            const sizeClass =
              intensity > 0.7
                ? 'text-lg sm:text-xl'
                : intensity > 0.4
                  ? 'text-base sm:text-lg'
                  : 'text-sm sm:text-base'
            const bgClass =
              intensity > 0.7
                ? 'bg-purple-600/60 hover:bg-purple-500/60'
                : intensity > 0.4
                  ? 'bg-purple-700/50 hover:bg-purple-600/50'
                  : 'bg-purple-800/40 hover:bg-purple-700/40'

            return (
              <button
                key={index}
                onClick={() => setSelectedWord(item)}
                className={`${sizeClass} ${bgClass} px-2 sm:px-3 py-1 rounded-full text-purple-100 transition-all hover:scale-105 cursor-pointer`}
              >
                {item.word}
                <span className="text-xs ml-1 text-purple-300">({item.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Word Usage Modal */}
      {selectedWord && (
        <WordUsageModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </>
  )
}

function WordUsageModal({ word, onClose }: { word: WordFrequency; onClose: () => void }) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="font-semibold text-white">「{word.word}」の使用例</h3>
            <p className="text-xs text-gray-400">
              {word.count}回使用 • {word.usages.length}件の会話
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Usage List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {word.usages.map((usage, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-purple-300 text-sm truncate flex-1">
                  {usage.conversationTitle}
                </div>
                <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {usage.createTime.toLocaleDateString('ja-JP')}
                </div>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {truncateText(usage.messageContent, 200)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionStatsSection({ stats }: { stats: InsightsStats['questionStats'] }) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
        あなたの質問スタイル
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {stats.totalQuestions.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">質問の総数</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {stats.questionRate.toFixed(1)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-400">質問率</div>
        </div>
      </div>

      <div className="space-y-2">
        {stats.patterns.map((pattern) => (
          <div key={pattern.pattern} className="bg-gray-900/30 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                setExpandedPattern(expandedPattern === pattern.pattern ? null : pattern.pattern)
              }
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-sm text-gray-200">{pattern.pattern}</span>
              <span className="text-sm font-semibold text-pink-400">
                {pattern.count.toLocaleString()}回
              </span>
            </button>
            {expandedPattern === pattern.pattern && pattern.examples.length > 0 && (
              <div className="px-3 pb-3 space-y-1">
                <div className="text-xs text-gray-500 mb-1">例:</div>
                {pattern.examples.map((example, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-gray-800/50 rounded px-2 py-1">
                    "{example}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MVPConversationsSection({ conversations }: { conversations: MVPConversation[] }) {
  const [selectedConversation, setSelectedConversation] = useState<MVPConversation | null>(null)

  if (conversations.length === 0) return null

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
          最も盛り上がった会話
        </h3>
        <p className="text-xs text-gray-400 mb-3">やり取りが多かった会話TOP3</p>

        <div className="space-y-2">
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full bg-gray-900/30 rounded-lg p-3 hover:bg-gray-700/30 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center text-lg font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{conv.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {conv.messageCount}メッセージ • {(conv.totalChars / 1000).toFixed(1)}k文字
                  </div>
                  <div className="text-xs text-gray-500">
                    {conv.createTime.toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="text-purple-400 text-sm">詳細 →</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  )
}

function ConversationModal({
  conversation,
  onClose,
}: {
  conversation: MVPConversation
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="font-semibold text-white">{conversation.title}</h3>
            <p className="text-xs text-gray-400">
              {conversation.messageCount}メッセージ •{' '}
              {conversation.createTime.toLocaleDateString('ja-JP')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="text-xs mb-1 opacity-60">
                    {message.role === 'user' ? 'あなた' : 'ChatGPT'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content.length > 500
                      ? message.content.slice(0, 500) + '...'
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

function FirstConversationsSection({ conversations }: { conversations: MVPConversation[] }) {
  const [selectedConversation, setSelectedConversation] = useState<MVPConversation | null>(null)

  if (!conversations || conversations.length === 0) return null

  const formatRelativeDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 30) return `${diffDays}日前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-4 sm:p-6 border border-amber-500/20">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-amber-300">
          はじめての会話
        </h3>
        <p className="text-xs text-gray-400 mb-4">ChatGPTとの出会いを振り返ろう</p>

        {/* Timeline style list */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 to-orange-500/20" />

          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv, index) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full relative pl-10 pr-3 py-3 bg-gray-900/40 rounded-lg hover:bg-gray-800/60 transition-all text-left group"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${
                  index === 0
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                    : 'bg-gray-700 border-2 border-amber-500/30'
                }`}>
                  {index === 0 && <span className="text-[10px]">✨</span>}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate group-hover:text-amber-200 transition-colors">
                      {conv.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {conv.createTime.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      <span className="mx-1">•</span>
                      <span className="text-amber-400/70">{formatRelativeDate(conv.createTime)}</span>
                    </div>
                  </div>
                  <div className="text-amber-400/60 text-xs group-hover:text-amber-300 transition-colors">
                    見る →
                  </div>
                </div>

                {/* First message preview for the first conversation */}
                {index === 0 && conv.messages.length > 0 && (
                  <div className="mt-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 mb-1">最初のメッセージ</div>
                    <div className="text-xs text-gray-300 line-clamp-2">
                      "{conv.messages.find(m => m.role === 'user')?.content.slice(0, 100) || '...'}
                      {(conv.messages.find(m => m.role === 'user')?.content.length || 0) > 100 ? '...' : ''}"
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reuse the same modal */}
      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  )
}
