interface ProgressBarProps {
  progress: number
  currentStep: string
  onRetry?: () => void
  hasError?: boolean
}

export function ProgressBar({ progress, currentStep, onRetry, hasError }: ProgressBarProps) {
  // Create pixel blocks for progress bar
  const totalBlocks = 20
  const filledBlocks = Math.round((progress / 100) * totalBlocks)

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="pixel-box border-gray-600 bg-gray-800/50 p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">&gt; ANALYZING</span>
            <span className="nes-cyan">{Math.round(progress)}%</span>
          </div>
          {/* Pixel-style progress bar */}
          <div className="flex gap-0.5">
            {Array.from({ length: totalBlocks }, (_, i) => (
              <div
                key={i}
                className={`h-4 flex-1 ${
                  i < filledBlocks
                    ? i < filledBlocks / 2
                      ? 'bg-nes-green'
                      : 'bg-nes-cyan'
                    : 'bg-gray-700'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-2 text-xs">
          {hasError ? (
            <span className="nes-red">[X]</span>
          ) : (
            <span className="nes-yellow pixel-bounce">&gt;</span>
          )}
          <span className={hasError ? 'nes-red' : 'text-gray-300'}>{currentStep}</span>
          {!hasError && <span className="blink">_</span>}
        </div>

        {/* Retry Button */}
        {hasError && onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full py-2 px-4 pixel-btn bg-nes-red border-red-300 text-white text-xs"
          >
            &gt; RETRY
          </button>
        )}
      </div>
    </div>
  )
}
