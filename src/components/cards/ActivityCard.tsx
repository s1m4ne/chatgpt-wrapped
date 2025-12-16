import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ActivityPattern, YearlyHeatmap } from '../../types'
import { useAnalysis } from '../../contexts'

interface ActivityCardProps {
  activity: ActivityPattern
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {activity.yearlyHeatmaps.map((yearData) => (
        <YearlyHeatmapSection key={yearData.year} data={yearData} />
      ))}
    </div>
  )
}

export function ActivityChartsCard({ activity }: ActivityCardProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <MonthlyChartSection data={activity.monthlyMessages} />
      <WeekdayChartSection data={activity.weekdayDistribution} />
    </div>
  )
}

interface HoveredDay {
  date: Date
  count: number
  conversationIds: string[]
  x: number
  y: number
  rowIndex: number
}

interface SelectedDay {
  date: Date
  count: number
  conversationIds: string[]
}

function YearlyHeatmapSection({ data }: { data: YearlyHeatmap }) {
  const { year, dailyCounts, dailyConversations } = data
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const [hoveredDay, setHoveredDay] = useState<HoveredDay | null>(null)
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const { state } = useAnalysis()

  // Generate all dates for the year (Jan 1 to Dec 31)
  const startDate = new Date(year, 0, 1) // Jan 1
  const endDate = new Date(year, 11, 31) // Dec 31

  // Find max value for color scaling
  const values = Object.values(dailyCounts)
  const maxValue = values.length > 0 ? Math.max(...values) : 1

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-800'
    const intensity = value / maxValue
    if (intensity < 0.25) return 'bg-emerald-900'
    if (intensity < 0.5) return 'bg-emerald-700'
    if (intensity < 0.75) return 'bg-emerald-500'
    return 'bg-emerald-400'
  }

  // Build weeks array (GitHub style: columns are weeks, rows are days of week)
  const weeks: { date: Date; count: number; conversationIds: string[]; isValid: boolean }[][] = []
  let currentWeek: { date: Date; count: number; conversationIds: string[]; isValid: boolean }[] = []

  // Pad the first week with empty cells if year doesn't start on Sunday
  const firstDayOfWeek = startDate.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), count: 0, conversationIds: [], isValid: false })
  }

  // Iterate through all days of the year
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const count = dailyCounts[dateKey] || 0
    const conversationIds = dailyConversations?.[dateKey] || []

    currentWeek.push({ date: new Date(currentDate), count, conversationIds, isValid: true })

    // If we've completed a week (Saturday), start a new week
    if (currentDate.getDay() === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Push the last partial week (don't pad - just keep actual days)
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // Month labels - find which weeks start each month
  const monthLabels: { weekIndex: number; label: string }[] = []
  const monthNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    for (const day of week) {
      if (day.isValid) {
        const month = day.date.getMonth()
        if (month !== lastMonth) {
          monthLabels.push({ weekIndex, label: monthNames[month] })
          lastMonth = month
          break
        }
      }
    }
  })

  const handleMouseEnter = (
    day: { date: Date; count: number; conversationIds: string[]; isValid: boolean },
    e: React.MouseEvent,
    rowIndex: number
  ) => {
    if (day.isValid) {
      const rect = e.currentTarget.getBoundingClientRect()
      const containerRect = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect()
      if (containerRect) {
        setHoveredDay({
          date: day.date,
          count: day.count,
          conversationIds: day.conversationIds,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
          rowIndex,
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const handleClick = (day: { date: Date; count: number; conversationIds: string[]; isValid: boolean }) => {
    if (day.isValid && day.count > 0) {
      setSelectedDay({
        date: day.date,
        count: day.count,
        conversationIds: day.conversationIds,
      })
    }
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Get conversations for selected day
  const selectedConversations = selectedDay
    ? state.conversations.filter((c) => selectedDay.conversationIds.includes(c.id))
    : []

  // Get selected conversation for detail view
  const selectedConversation = selectedConvId
    ? state.conversations.find((c) => c.id === selectedConvId)
    : null

  return (
    <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
      <h3 className="text-xs sm:text-sm mb-3 sm:mb-4 nes-cyan crt-glow">
        &gt; {year} ACTIVITY
      </h3>
      <div className="overflow-x-auto -mx-2 px-2 overflow-y-visible">
        <div className="min-w-[700px] heatmap-container relative py-12">
          {/* Tooltip - position below for top rows, above for bottom rows */}
          {hoveredDay && (
            <div
              className="absolute z-50 pixel-box border-gray-500 bg-gray-900 px-3 py-2 text-xs pointer-events-none"
              style={{
                left: Math.min(Math.max(hoveredDay.x, 60), 640),
                top: hoveredDay.rowIndex <= 2
                  ? hoveredDay.y + 16 + 48
                  : hoveredDay.y - 8 + 48,
                transform: hoveredDay.rowIndex <= 2
                  ? 'translateX(-50%)'
                  : 'translate(-50%, -100%)',
              }}
            >
              <div className="text-white">{formatDate(hoveredDay.date)}</div>
              <div className="nes-green">{hoveredDay.count} MSG</div>
              {hoveredDay.count > 0 && (
                <div className="text-gray-400 text-xs mt-1">CLICK</div>
              )}
            </div>
          )}

          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: '20px', marginTop: '-40px' }}>
            {weeks.map((_, weekIndex) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === weekIndex)
              return (
                <div
                  key={weekIndex}
                  className="text-xs text-gray-500"
                  style={{ width: '12px', fontSize: '8px' }}
                >
                  {monthLabel?.label || ''}
                </div>
              )
            })}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col" style={{ width: '20px' }}>
              {dayLabels.map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="text-xs text-gray-500 flex items-center justify-end pr-1"
                  style={{ height: '12px', fontSize: '8px' }}
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => {
              const isLastWeek = weekIndex === weeks.length - 1
              return (
                <div key={weekIndex} className="flex flex-col" style={{ width: '12px' }}>
                  {/* Render 7 rows for consistent alignment */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = week[dayIndex]
                    // For last week, don't render cells beyond actual days
                    if (!day || (isLastWeek && !day.isValid)) {
                      return <div key={dayIndex} style={{ width: '10px', height: '10px', margin: '1px' }} />
                    }
                    // For first week padding (invalid cells at beginning)
                    if (!day.isValid) {
                      return <div key={dayIndex} style={{ width: '10px', height: '10px', margin: '1px' }} />
                    }
                    return (
                      <div
                        key={dayIndex}
                        className={`cursor-pointer transition-transform hover:scale-125 ${getColor(day.count)} ${day.count > 0 ? 'hover:ring-1 hover:ring-white' : ''}`}
                        style={{ width: '10px', height: '10px', margin: '1px', imageRendering: 'pixelated' }}
                        onMouseEnter={(e) => handleMouseEnter(day, e, dayIndex)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(day)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-2 gap-1 text-xs text-gray-500">
            <span style={{ fontSize: '8px' }}>LOW</span>
            <div className="w-2.5 h-2.5 bg-gray-800" />
            <div className="w-2.5 h-2.5 bg-emerald-900" />
            <div className="w-2.5 h-2.5 bg-emerald-700" />
            <div className="w-2.5 h-2.5 bg-emerald-500" />
            <div className="w-2.5 h-2.5 bg-emerald-400" />
            <span style={{ fontSize: '8px' }}>HIGH</span>
          </div>
        </div>
      </div>

      {/* Day detail modal - conversation list */}
      {selectedDay && !selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="pixel-box border-white bg-gray-900 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
              <div>
                <h3 className="text-xs nes-cyan">{formatDate(selectedDay.date)}</h3>
                <p className="text-xs text-gray-400">
                  {selectedDay.count} MSG - {selectedConversations.length} CHATS
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                [X]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedConversations.length === 0 ? (
                <p className="text-xs text-gray-400">&gt; NO DATA</p>
              ) : (
                selectedConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="w-full text-left pixel-box border-gray-600 bg-gray-800/50 p-3 hover:border-nes-cyan transition-colors"
                  >
                    <div className="text-xs nes-cyan mb-1 truncate">{conv.title}</div>
                    <div className="text-xs text-gray-400">
                      {conv.messages.length} msgs
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t-2 border-gray-700">
              <button
                onClick={() => setSelectedDay(null)}
                className="w-full py-2 pixel-btn bg-gray-700 border-gray-500 text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation detail modal - message history */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="pixel-box border-white bg-gray-900 w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs nes-cyan truncate">{selectedConversation.title}</h3>
                <p className="text-xs text-gray-400">
                  {formatDate(selectedConversation.createTime)} - {selectedConversation.messages.length} msgs
                </p>
              </div>
              <button
                onClick={() => setSelectedConvId(null)}
                className="text-xs text-gray-400 hover:text-white ml-2"
              >
                [X]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConversation.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`pixel-box p-3 ${
                    msg.role === 'user'
                      ? 'border-nes-cyan bg-gray-800/70 ml-4'
                      : 'border-nes-green bg-gray-900/70 mr-4'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs ${msg.role === 'user' ? 'nes-cyan' : 'nes-green'}`}>
                      {msg.role === 'user' ? '&gt; YOU' : '&gt; GPT'}
                    </span>
                    {msg.createTime && (
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.createTime)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-200 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                    {msg.content.length > 1000 ? msg.content.slice(0, 1000) + '...' : msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-2 border-gray-700 flex gap-2">
              <button
                onClick={() => setSelectedConvId(null)}
                className="flex-1 py-2 pixel-btn bg-gray-700 border-gray-500 text-xs"
              >
                &lt; BACK
              </button>
              <button
                onClick={() => {
                  setSelectedConvId(null)
                  setSelectedDay(null)
                }}
                className="flex-1 py-2 pixel-btn bg-gray-700 border-gray-500 text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MonthlyChartSection({ data }: { data: { month: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5), // Just show month
  }))

  return (
    <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
      <h3 className="text-xs sm:text-sm mb-3 sm:mb-4 nes-purple crt-glow">&gt; MONTHLY</h3>
      <div className="h-36 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={8} />
            <YAxis stroke="#9ca3af" fontSize={8} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '4px solid #7e2553',
                borderRadius: '0',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
              }}
            />
            <Bar dataKey="count" fill="#7e2553" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function WeekdayChartSection({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="pixel-box border-white bg-gray-900/80 p-4 sm:p-6">
      <h3 className="text-xs sm:text-sm mb-3 sm:mb-4 nes-pink crt-glow">&gt; WEEKDAY</h3>
      <div className="h-36 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" stroke="#9ca3af" fontSize={8} />
            <YAxis dataKey="day" type="category" stroke="#9ca3af" fontSize={8} width={24} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '4px solid #ff77a8',
                borderRadius: '0',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
              }}
            />
            <Bar dataKey="count" fill="#ff77a8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
