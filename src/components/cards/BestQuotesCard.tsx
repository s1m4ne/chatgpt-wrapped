import type { BestQuote } from '../../types'

interface BestQuotesCardProps {
  data: BestQuote[]
}

export function BestQuotesCard({ data }: BestQuotesCardProps) {
  return (
    <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 rounded-2xl p-8 backdrop-blur-sm border border-teal-500/20">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
        今年の名言集
      </h2>

      <div className="space-y-6">
        {data.slice(0, 5).map((quote, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-6">
            {/* Quote */}
            <blockquote className="relative">
              <span className="absolute -top-2 -left-2 text-4xl text-teal-500/30">"</span>
              <p className="text-lg text-gray-200 italic pl-6 pr-4">{quote.quote}</p>
              <span className="absolute -bottom-4 -right-2 text-4xl text-teal-500/30">"</span>
            </blockquote>

            {/* Context & Reason */}
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-cyan-400 text-sm">📝</span>
                <p className="text-sm text-gray-400">{quote.context}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 text-sm">💡</span>
                <p className="text-sm text-teal-300">{quote.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
