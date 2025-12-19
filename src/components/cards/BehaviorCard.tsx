import { useState, type ReactNode } from 'react'
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
import { CardHeader } from './CardHeader'

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

interface BehaviorCardProps {
  behavior: BehaviorStats
  insights: InsightsStats
}

export function BehaviorCard({ behavior, insights }: BehaviorCardProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
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
  const barHeight = 80

  const getBarColor = (h: number) => {
    if (h >= 0 && h < 6) return 'bg-indigo-500'
    if (h >= 6 && h < 12) return 'bg-yellow-500'
    if (h >= 12 && h < 18) return 'bg-orange-500'
    return 'bg-purple-500'
  }

  return (
    <div className="mb-4">
      <div className="text-xs text-gray-400 mb-2">&gt; HOURLY</div>
      <div
        className="flex items-end gap-[1px] px-1 relative"
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
                className={`w-full transition-all ${getBarColor(hour)} ${isHovered ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                style={{ height: `${heightPx}px` }}
              />
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pixel-box border-gray-500 bg-gray-900 px-2 py-1 text-xs whitespace-nowrap z-20">
                  <div className="nes-cyan">{hour}:00</div>
                  <div className="nes-pink">{count}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  )
}

function HourlyHeatmapSection({ data }: { data: BehaviorStats['hourlyHeatmap'] }) {
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const dayFullNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  const maxValue = Math.max(...data.matrix.flat(), 1)

  const hourlyTotals = Array.from({ length: 24 }, (_, hour) =>
    data.matrix.reduce((sum, dayRow) => sum + dayRow[hour], 0)
  )

  const dailyTotals = data.matrix.map((dayRow) => dayRow.reduce((sum, val) => sum + val, 0))

  const timeCategoryTotals = {
    深夜: hourlyTotals.slice(0, 6).reduce((a, b) => a + b, 0),
    午前: hourlyTotals.slice(6, 12).reduce((a, b) => a + b, 0),
    午後: hourlyTotals.slice(12, 18).reduce((a, b) => a + b, 0),
    夜: hourlyTotals.slice(18, 24).reduce((a, b) => a + b, 0),
  }

  const morningActivity = timeCategoryTotals.午前
  const nightActivity = timeCategoryTotals.夜 + timeCategoryTotals.深夜
  const chronotype =
    morningActivity > nightActivity * 1.5
      ? { label: 'MORNING', color: 'nes-yellow' }
      : nightActivity > morningActivity * 1.5
        ? { label: 'NIGHT', color: 'nes-purple' }
        : { label: 'BALANCED', color: 'nes-green' }

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
    <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="RHYTHM"
        description="時間帯・曜日別のChatGPT利用パターンを分析"
        colorClass="nes-cyan"
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <TooltipStat description="朝型・夜型などの利用タイプ">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className={`text-xs ${chronotype.color}`}>{chronotype.label}</div>
            <div className="text-xs text-gray-500">TYPE</div>
          </div>
        </TooltipStat>
        <TooltipStat description="最も利用が多い時間帯">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-xs nes-cyan">{data.peakHour}:00</div>
            <div className="text-xs text-gray-500">PEAK</div>
          </div>
        </TooltipStat>
        <TooltipStat description="最も利用が多い曜日">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-xs nes-purple">{dayNames[maxDayIndex]}</div>
            <div className="text-xs text-gray-500">BEST</div>
          </div>
        </TooltipStat>
      </div>

      <HourlyBarChart hourlyTotals={hourlyTotals} peakHour={data.peakHour} />

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="text-xs text-gray-400 mb-2">&gt; HEATMAP</div>
        <div className="min-w-[400px]">
          <div className="flex mb-1" style={{ marginLeft: '24px' }}>
            {[0, 6, 12, 18].map((hour) => (
              <div key={hour} className="text-xs text-gray-500" style={{ width: '96px' }}>
                {hour}
              </div>
            ))}
          </div>

          {dayNames.map((day, dayIndex) => (
            <div key={`${day}-${dayIndex}`} className="flex items-center mb-0.5">
              <div className="text-xs text-gray-400 text-right pr-2" style={{ width: '24px' }}>
                {day}
              </div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={`${getColor(data.matrix[dayIndex][hour])} cursor-default transition-transform hover:scale-125`}
                  style={{ width: '14px', height: '14px', margin: '1px' }}
                  title={`${dayFullNames[dayIndex]} ${hour}:00 - ${data.matrix[dayIndex][hour]}`}
                />
              ))}
            </div>
          ))}

          <div className="flex items-center justify-end mt-2 gap-1 text-xs text-gray-500">
            <span>LOW</span>
            <div className="w-2.5 h-2.5 bg-gray-800" />
            <div className="w-2.5 h-2.5 bg-blue-900" />
            <div className="w-2.5 h-2.5 bg-blue-700" />
            <div className="w-2.5 h-2.5 bg-blue-500" />
            <div className="w-2.5 h-2.5 bg-blue-400" />
            <span>HIGH</span>
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
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="PHRASES"
          description="よく使う口癖やフレーズ"
          colorClass="nes-orange"
        />
        <p className="text-xs text-gray-400">&gt; NO DATA</p>
      </div>
    )
  }

  const maxCount = phrases[0]?.count || 1

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="PHRASES"
          description="よく使う口癖やフレーズ"
          colorClass="nes-orange"
        />
        <div className="space-y-2">
          {phrases.map((phrase, index) => {
            const totalBlocks = 10
            const filledBlocks = Math.round((phrase.count / maxCount) * totalBlocks)
            return (
              <button
                key={index}
                onClick={() => setSelectedPhrase(phrase)}
                className="w-full text-left pixel-box border-gray-600 bg-gray-800/50 p-2 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-orange-300 truncate">"{phrase.phrase}"</span>
                  <span className="text-xs nes-orange">{phrase.count}</span>
                </div>
                <div className="flex gap-px">
                  {Array.from({ length: totalBlocks }, (_, i) => (
                    <div key={i} className={`h-1 flex-1 ${i < filledBlocks ? 'bg-nes-orange' : 'bg-gray-700'}`} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedPhrase && (
        <PhraseUsageModal
          title={`"${selectedPhrase.phrase}"`}
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
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="N-GRAMS"
          description="単語の組み合わせパターン（1〜3語）"
          colorClass="nes-cyan"
        />
        <p className="text-xs text-gray-400">&gt; NO DATA</p>
      </div>
    )
  }

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="N-GRAMS"
          description="単語の組み合わせパターン（1〜3語）"
          colorClass="nes-cyan"
        />

        {hasUnigrams && (
          <div className="mb-3">
            <h4 className="text-xs text-gray-400 mb-2">&gt; 1-WORD</h4>
            <div className="flex flex-wrap gap-1">
              {ngrams.unigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-xs px-2 py-1 pixel-box border-cyan-600 bg-cyan-500/20 text-cyan-200 hover:border-cyan-400"
                >
                  {phrase.phrase} ({phrase.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {hasBigrams && (
          <div className="mb-3">
            <h4 className="text-xs text-gray-400 mb-2">&gt; 2-WORD</h4>
            <div className="flex flex-wrap gap-1">
              {ngrams.bigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-xs px-2 py-1 pixel-box border-teal-600 bg-teal-500/20 text-teal-200 hover:border-teal-400"
                >
                  {phrase.phrase} ({phrase.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {hasTrigrams && (
          <div>
            <h4 className="text-xs text-gray-400 mb-2">&gt; 3-WORD</h4>
            <div className="flex flex-wrap gap-1">
              {ngrams.trigrams.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhrase(phrase)}
                  className="text-xs px-2 py-1 pixel-box border-emerald-600 bg-emerald-500/20 text-emerald-200 hover:border-emerald-400"
                >
                  {phrase.phrase} ({phrase.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPhrase && (
        <PhraseUsageModal
          title={`"${selectedPhrase.phrase}"`}
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
    if (rate >= 20) return { label: 'SUPER', color: 'nes-green' }
    if (rate >= 10) return { label: 'HIGH', color: 'nes-green' }
    if (rate >= 5) return { label: 'NORMAL', color: 'nes-yellow' }
    return { label: 'COOL', color: 'text-gray-400' }
  }

  const level = getGratitudeLevel(gratitude.thanksRate)

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="THANKS"
          description="ChatGPTへの感謝の頻度とバリエーション"
          colorClass="nes-green"
        />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <TooltipStat description="感謝の頻度に基づくレベル">
            <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
              <div className={`text-sm ${level.color}`}>{level.label}</div>
              <div className="text-xs text-gray-500">LEVEL</div>
            </div>
          </TooltipStat>
          <TooltipStat description="感謝を伝えた回数">
            <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
              <div className="text-sm nes-green">{gratitude.totalThanks}</div>
              <div className="text-xs text-gray-500">COUNT</div>
            </div>
          </TooltipStat>
        </div>

        <div className="pixel-box border-gray-600 bg-gray-800/50 p-2">
          <div className="text-xs text-gray-400 mb-1">&gt; TOP</div>
          <div className="space-y-1">
            {gratitude.variations.slice(0, 3).map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariation(v)}
                className="w-full text-xs text-green-300 flex justify-between hover:bg-green-500/20 px-1 py-0.5"
              >
                <span>{v.phrase}</span>
                <span>{v.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedVariation && (
        <PhraseUsageModal
          title={`"${selectedVariation.phrase}"`}
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
    if (rate >= 30) return { label: 'LOST', color: 'nes-red' }
    if (rate >= 20) return { label: 'SEEKER', color: 'nes-yellow' }
    if (rate >= 10) return { label: 'LEARNER', color: 'nes-cyan' }
    return { label: 'SURE', color: 'nes-green' }
  }

  const level = getConfusionLevel(confusion.confusionRate)

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="CONFUSION"
          description="迷いや困惑を示す表現の傾向"
          colorClass="nes-red"
        />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <TooltipStat description="迷いの頻度に基づくレベル">
            <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
              <div className={`text-sm ${level.color}`}>{level.label}</div>
              <div className="text-xs text-gray-500">LEVEL</div>
            </div>
          </TooltipStat>
          <TooltipStat description="迷いを示す表現の割合">
            <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
              <div className="text-sm nes-red">{confusion.confusionRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">RATE</div>
            </div>
          </TooltipStat>
        </div>

        {confusion.patterns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {confusion.patterns.slice(0, 6).map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPattern(p)}
                className="text-xs px-2 py-1 pixel-box border-red-600 bg-red-500/20 text-red-300 hover:border-red-400"
              >
                {p.pattern} ({p.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPattern && (
        <PhraseUsageModal
          title={`"${selectedPattern.pattern}"`}
          count={selectedPattern.count}
          usages={selectedPattern.usages}
          color="red"
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </>
  )
}

function PhraseUsageModal({
  title,
  count,
  usages,
  onClose,
}: {
  title: string
  count: number
  usages: PhraseUsage[]
  color: 'orange' | 'green' | 'red' | 'cyan'
  onClose: () => void
}) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="pixel-box border-white bg-gray-900 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
          <div>
            <h3 className="text-xs nes-cyan">{title}</h3>
            <p className="text-xs text-gray-400">{count}x - {usages.length} chats</p>
          </div>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">[X]</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usages.map((usage, index) => (
            <div key={index} className="pixel-box border-gray-600 bg-gray-800/50 p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs nes-cyan truncate flex-1">{usage.conversationTitle}</div>
                <div className="text-xs text-gray-500 ml-2">{usage.createTime.toLocaleDateString('ja-JP')}</div>
              </div>
              <div className="text-xs text-gray-300">{truncateText(usage.messageContent, 200)}</div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t-2 border-gray-700">
          <button onClick={onClose} className="w-full py-2 pixel-btn bg-gray-700 border-gray-500 text-xs">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

function FrequentWordsSection({ words }: { words: InsightsStats['frequentWords'] }) {
  const [selectedWord, setSelectedWord] = useState<WordFrequency | null>(null)

  if (words.length === 0) return null

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="WORDS"
          description="頻出キーワードTOP20"
          colorClass="nes-purple"
        />
        <div className="flex flex-wrap gap-1">
          {words.slice(0, 20).map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedWord(item)}
              className="text-xs px-2 py-1 pixel-box border-purple-600 bg-purple-500/20 text-purple-200 hover:border-purple-400"
            >
              {item.word} ({item.count})
            </button>
          ))}
        </div>
      </div>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="pixel-box border-white bg-gray-900 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
          <div>
            <h3 className="text-xs nes-purple">"{word.word}"</h3>
            <p className="text-xs text-gray-400">{word.count}x - {word.usages.length} chats</p>
          </div>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">[X]</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {word.usages.map((usage, index) => (
            <div key={index} className="pixel-box border-gray-600 bg-gray-800/50 p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs nes-purple truncate flex-1">{usage.conversationTitle}</div>
                <div className="text-xs text-gray-500 ml-2">{usage.createTime.toLocaleDateString('ja-JP')}</div>
              </div>
              <div className="text-xs text-gray-300">{truncateText(usage.messageContent, 200)}</div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t-2 border-gray-700">
          <button onClick={onClose} className="w-full py-2 pixel-btn bg-gray-700 border-gray-500 text-xs">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionStatsSection({ stats }: { stats: InsightsStats['questionStats'] }) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)

  return (
    <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
      <CardHeader
        title="QUESTIONS"
        description="質問の頻度とパターン分析"
        colorClass="nes-pink"
      />

      <div className="grid grid-cols-2 gap-2 mb-3">
        <TooltipStat description="質問の総数">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-sm nes-pink">{stats.totalQuestions}</div>
            <div className="text-xs text-gray-500">TOTAL</div>
          </div>
        </TooltipStat>
        <TooltipStat description="メッセージ中の質問の割合">
          <div className="pixel-box border-gray-600 bg-gray-800/50 p-2 text-center">
            <div className="text-sm nes-pink">{stats.questionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">RATE</div>
          </div>
        </TooltipStat>
      </div>

      <div className="space-y-1">
        {stats.patterns.map((pattern) => (
          <div key={pattern.pattern} className="pixel-box border-gray-600 bg-gray-800/30 overflow-hidden">
            <button
              onClick={() => setExpandedPattern(expandedPattern === pattern.pattern ? null : pattern.pattern)}
              className="w-full px-2 py-1 flex items-center justify-between hover:bg-gray-700/30 text-xs"
            >
              <span className="text-gray-200">{pattern.pattern}</span>
              <span className="nes-pink">{pattern.count}</span>
            </button>
            {expandedPattern === pattern.pattern && pattern.examples.length > 0 && (
              <div className="px-2 pb-2 space-y-1">
                {pattern.examples.map((example, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1">
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
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="MVP CHATS"
          description="最もメッセージ数の多かった会話TOP5"
          colorClass="nes-purple"
        />

        <div className="space-y-2">
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full pixel-box border-gray-600 bg-gray-800/50 p-2 hover:border-purple-500 text-left"
            >
              <div className="flex items-start gap-2">
                <div className="text-xs nes-purple">#{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{conv.title}</div>
                  <div className="text-xs text-gray-500">
                    {conv.messageCount} msgs - {(conv.totalChars / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedConversation && (
        <ConversationModal conversation={selectedConversation} onClose={() => setSelectedConversation(null)} />
      )}
    </>
  )
}

function ConversationModal({ conversation, onClose }: { conversation: MVPConversation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="pixel-box border-white bg-gray-900 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
          <div>
            <h3 className="text-xs nes-purple">{conversation.title}</h3>
            <p className="text-xs text-gray-400">{conversation.messageCount} msgs</p>
          </div>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">[X]</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversation.messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] pixel-box p-2 ${
                    message.role === 'user'
                      ? 'border-purple-500 bg-purple-900/50'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {message.role === 'user' ? 'YOU' : 'GPT'}
                  </div>
                  <div className="text-xs text-gray-300">
                    {message.content.length > 500 ? message.content.slice(0, 500) + '...' : message.content}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="p-4 border-t-2 border-gray-700">
          <button onClick={onClose} className="w-full py-2 pixel-btn bg-gray-700 border-gray-500 text-xs">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

function FirstConversationsSection({ conversations }: { conversations: MVPConversation[] }) {
  const [selectedConversation, setSelectedConversation] = useState<MVPConversation | null>(null)

  if (!conversations || conversations.length === 0) return null

  return (
    <>
      <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
        <CardHeader
          title="FIRST CHATS"
          description="ChatGPTとの最初の会話たち"
          colorClass="nes-orange"
        />

        <div className="space-y-2">
          {conversations.slice(0, 5).map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full pixel-box border-gray-600 bg-gray-800/50 p-2 hover:border-orange-500 text-left"
            >
              <div className="flex items-start gap-2">
                <div className="text-xs nes-orange">#{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{conv.title}</div>
                  <div className="text-xs text-gray-500">
                    {conv.createTime.toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedConversation && (
        <ConversationModal conversation={selectedConversation} onClose={() => setSelectedConversation(null)} />
      )}
    </>
  )
}
