import type { BestQuote } from '../../types'

interface BestQuotesCardProps {
  data: BestQuote[]
}

export function BestQuotesCard({ data }: BestQuotesCardProps) {
  return (
    <div className="pixel-box border-nes-cyan bg-gray-900/80 p-4 sm:p-6">
      <h2 className="text-sm sm:text-base text-center mb-6 nes-cyan crt-glow">
        QUOTES
      </h2>

      <div className="space-y-4">
        {data.slice(0, 5).map((quote, i) => (
          <div key={i} className="pixel-box border-gray-600 bg-gray-800/50 p-4">
            {/* Quote */}
            <div className="mb-3">
              <span className="nes-cyan text-xs">"</span>
              <p className="text-xs text-gray-200 inline">{quote.quote}</p>
              <span className="nes-cyan text-xs">"</span>
            </div>

            {/* Context & Reason */}
            <div className="pt-3 border-t-2 border-gray-700 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500">&gt;</span>
                <p className="text-xs text-gray-400">{quote.context}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs nes-cyan">&gt;</span>
                <p className="text-xs text-teal-300">{quote.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
