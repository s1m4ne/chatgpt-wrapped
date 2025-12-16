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
      {/* Navigation Dots - Pixel Style */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-4 sm:mb-6 flex-wrap">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 transition-all ${
              i === currentIndex
                ? 'bg-nes-cyan w-4 sm:w-6'
                : 'bg-gray-700 hover:bg-gray-600 w-2'
            }`}
            style={{ imageRendering: 'pixelated' }}
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
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, i) => (
            <div key={i} className="w-full flex-shrink-0 px-2 sm:px-4">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Pixel Style */}
      <div className="flex justify-between mt-4 sm:mt-6 gap-2 sm:gap-4">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 pixel-btn bg-gray-800 border-gray-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lt; <span className="hidden sm:inline">PREV</span>
        </button>
        <span className="text-gray-500 text-xs self-center">
          [{currentIndex + 1}/{children.length}]
        </span>
        <button
          onClick={goToNext}
          disabled={currentIndex === children.length - 1}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 pixel-btn bg-nes-purple border-purple-300 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">NEXT</span> &gt;
        </button>
      </div>

      {/* Swipe hint for mobile */}
      <div className="text-center text-xs text-gray-600 mt-3 sm:hidden">
        &lt; SWIPE &gt;
      </div>
    </div>
  )
}
