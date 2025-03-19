import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const ModelSlider = ({ models }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef(null)

  const handleNextSlide = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === models.length - 1 ? 0 : prevIndex + 1
    )
  }

  const handlePrevSlide = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? models.length - 1 : prevIndex - 1
    )
  }

  const handleGoToSlide = (index) => {
    setCurrentIndex(index)
  }

  // Auto-slide functionality
  useEffect(() => {
    if (!models.length) return

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === models.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000)
    }

    startTimer()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [models.length])

  if (!models.length) return null

  return (
    <div className="relative w-full h-[300px] mb-12 rounded-3xl overflow-hidden group">
      {/* Navigation Buttons */}
      <button 
        onClick={handlePrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous model"
      >
        <FiChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      
      <button 
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next model"
      >
        <FiChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Slide Content */}
      <div className="relative h-full overflow-hidden">
        {models.map((model, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 z-10 scale-100 blur-0' 
                : 'opacity-0 z-0 scale-110 blur-sm'
            }`}
            style={{ backgroundImage: `url(${model.imageUrl})` }}
          >
            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <div 
                className={`absolute bottom-0 left-0 p-8 text-white transition-all duration-1000 ease-out ${
                  index === currentIndex 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <h2 className="text-3xl font-bold mr-3">{model.name}</h2>
                  {model.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-white/90 max-w-2xl text-sm md:text-base line-clamp-3 overflow-hidden">
                  {model.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
        {models.map((_, index) => (
          <button
            key={index}
            onClick={() => handleGoToSlide(index)}
            className={`rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? 'bg-white w-8 h-2.5' 
                : 'bg-white/40 hover:bg-white/60 w-2.5 h-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ModelSlider