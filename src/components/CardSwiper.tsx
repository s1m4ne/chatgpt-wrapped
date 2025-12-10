import { useState, useRef, type ReactNode, type TouchEvent } from 'react'

interface CardSwiperProps {
  children: ReactNode[]
}

export function CardSwiper({ children }: CardSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goToNext = () => {
    if (currentIndex < children.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (diff > threshold) {
      goToNext()
    } else if (diff < -threshold) {
      goToPrev()
    }
  }

  return (
    <div className="relative">
      {/* Navigation Dots */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-purple-500 w-4 sm:w-6'
                : 'bg-gray-600 hover:bg-gray-500 w-2'
            }`}
          />
        ))}
      </div>

      {/* Card Container */}
      <div
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, i) => (
            <div key={i} className="w-full flex-shrink-0 px-2 sm:px-4">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4 sm:mt-6 gap-4">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>←</span> <span className="hidden sm:inline">前へ</span>
        </button>
        <span className="text-gray-500 text-sm self-center">
          {currentIndex + 1} / {children.length}
        </span>
        <button
          onClick={goToNext}
          disabled={currentIndex === children.length - 1}
          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">次へ</span> <span>→</span>
        </button>
      </div>

      {/* Swipe hint for mobile */}
      <div className="text-center text-xs text-gray-500 mt-3 sm:hidden">
        ← スワイプで移動 →
      </div>
    </div>
  )
}
