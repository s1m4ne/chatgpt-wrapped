import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { TopicClassification } from '../../types'

interface TopicCardProps {
  data: TopicClassification
}

const COLORS = [
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#f43f5e',
  '#14b8a6',
]

export function TopicCard({ data }: TopicCardProps) {
  const chartData = data.topics.slice(0, 10).map((t) => ({
    name: `${t.emoji} ${t.name}`,
    value: t.percentage,
  }))

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
        話題のトピックTOP10
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2 space-y-2">
          {data.topics.slice(0, 10).map((topic, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">
                  {topic.emoji} {topic.name}
                </span>
              </div>
              <span className="text-sm text-gray-400">{topic.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
