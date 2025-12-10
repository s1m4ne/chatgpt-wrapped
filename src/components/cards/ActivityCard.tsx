import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ActivityPattern, YearlyHeatmap } from '../../types'

interface ActivityCardProps {
  activity: ActivityPattern
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      {activity.yearlyHeatmaps.map((yearData) => (
        <YearlyHeatmapSection key={yearData.year} data={yearData} />
      ))}
    </div>
  )
}

export function ActivityChartsCard({ activity }: ActivityCardProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      <MonthlyChartSection data={activity.monthlyMessages} />
      <WeekdayChartSection data={activity.weekdayDistribution} />
    </div>
  )
}

interface HoveredDay {
  date: Date
  count: number
  x: number
  y: number
}

function YearlyHeatmapSection({ data }: { data: YearlyHeatmap }) {
  const { year, dailyCounts } = data
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土']
  const [hoveredDay, setHoveredDay] = useState<HoveredDay | null>(null)

  // Generate all dates for the year (Jan 1 to Dec 31)
  const startDate = new Date(year, 0, 1) // Jan 1
  const endDate = new Date(year, 11, 31) // Dec 31

  // Find max value for color scaling
  const values = Object.values(dailyCounts)
  const maxValue = values.length > 0 ? Math.max(...values) : 1

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-800'
    const intensity = value / maxValue
    if (intensity < 0.25) return 'bg-purple-900'
    if (intensity < 0.5) return 'bg-purple-700'
    if (intensity < 0.75) return 'bg-purple-500'
    return 'bg-purple-400'
  }

  // Build weeks array (GitHub style: columns are weeks, rows are days of week)
  const weeks: { date: Date; count: number; isValid: boolean }[][] = []
  let currentWeek: { date: Date; count: number; isValid: boolean }[] = []

  // Pad the first week with empty cells if year doesn't start on Sunday
  const firstDayOfWeek = startDate.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), count: 0, isValid: false })
  }

  // Iterate through all days of the year
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const count = dailyCounts[dateKey] || 0

    currentWeek.push({ date: new Date(currentDate), count, isValid: true })

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
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
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

  const handleMouseEnter = (day: { date: Date; count: number; isValid: boolean }, e: React.MouseEvent) => {
    if (day.isValid) {
      const rect = e.currentTarget.getBoundingClientRect()
      const containerRect = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect()
      if (containerRect) {
        setHoveredDay({
          date: day.date,
          count: day.count,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const formatDate = (date: Date) => {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${dayNames[date.getDay()]})`
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
        {year}年 利用カレンダー
      </h3>
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[700px] heatmap-container relative">
          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-lg pointer-events-none"
              style={{
                left: hoveredDay.x,
                top: hoveredDay.y - 8,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-white font-medium">{formatDate(hoveredDay.date)}</div>
              <div className="text-purple-300">{hoveredDay.count}件のメッセージ</div>
            </div>
          )}

          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: '24px' }}>
            {weeks.map((_, weekIndex) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === weekIndex)
              return (
                <div
                  key={weekIndex}
                  className="text-[10px] text-gray-500"
                  style={{ width: '14px' }}
                >
                  {monthLabel?.label || ''}
                </div>
              )
            })}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col" style={{ width: '24px' }}>
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className="text-[10px] text-gray-500 flex items-center justify-end pr-1"
                  style={{ height: '14px' }}
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => {
              const isLastWeek = weekIndex === weeks.length - 1
              return (
                <div key={weekIndex} className="flex flex-col" style={{ width: '14px' }}>
                  {/* Render 7 rows for consistent alignment */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = week[dayIndex]
                    // For last week, don't render cells beyond actual days
                    if (!day || (isLastWeek && !day.isValid)) {
                      return <div key={dayIndex} style={{ width: '12px', height: '12px', margin: '1px' }} />
                    }
                    // For first week padding (invalid cells at beginning)
                    if (!day.isValid) {
                      return <div key={dayIndex} style={{ width: '12px', height: '12px', margin: '1px' }} />
                    }
                    return (
                      <div
                        key={dayIndex}
                        className={`rounded-sm cursor-pointer transition-transform hover:scale-125 ${getColor(day.count)}`}
                        style={{ width: '12px', height: '12px', margin: '1px' }}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-2 gap-1 text-[10px] text-gray-500">
            <span>少</span>
            <div className="w-3 h-3 rounded-sm bg-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-purple-900" />
            <div className="w-3 h-3 rounded-sm bg-purple-700" />
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
            <div className="w-3 h-3 rounded-sm bg-purple-400" />
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MonthlyChartSection({ data }: { data: { month: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5), // Just show month
  }))

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">月別メッセージ数</h3>
      <div className="h-36 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} />
            <YAxis stroke="#9ca3af" fontSize={10} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function WeekdayChartSection({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">曜日別利用傾向</h3>
      <div className="h-36 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" stroke="#9ca3af" fontSize={10} />
            <YAxis dataKey="day" type="category" stroke="#9ca3af" fontSize={10} width={24} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
