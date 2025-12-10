interface ProgressBarProps {
  progress: number
  currentStep: string
  onRetry?: () => void
  hasError?: boolean
}

export function ProgressBar({ progress, currentStep, onRetry, hasError }: ProgressBarProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">分析進行中</span>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-2">
          {hasError ? (
            <span className="text-red-400">❌</span>
          ) : (
            <span className="animate-spin">⏳</span>
          )}
          <span className={hasError ? 'text-red-400' : 'text-gray-300'}>{currentStep}</span>
        </div>

        {/* Retry Button */}
        {hasError && onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  )
}
