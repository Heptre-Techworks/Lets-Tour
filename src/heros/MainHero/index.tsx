'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { useRouter } from 'next/navigation'

// Icon Components
const AirplaneIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ transform: 'rotate(-90deg)', ...style }}
  >
    <path d="M21.4 14.6l-8.1-6.2V3.5c0-.8-.9-1.5-1.5-1.5s-1.5.7-1.5 1.5v4.9L2.2 14.6c-.3.2-.3.5 0 .7l1.2.8 6.7-3.9v5.6l-2 1.5V21l3.5-1 3.5 1v-1.5l-2-1.5V12l6.7 3.9 1.2-.8c-.3-.2-.3-.5 0-.7z" />
  </svg>
)

const ChevronLeftIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M15 18L9 12L15 6" />
  </svg>
)

const ChevronRightIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M9 18L15 12L9 6" />
  </svg>
)

// Types
type Slide = {
  backgroundImage: Media | string
  headline?: string
  subtitle?: string
  location?: string
  id?: string
}

type Option = {
  label: string
  value: string
  id?: string
}

type MainHeroProps = {
  slides: Slide[]
  cloudImage: Media | string | null | undefined
  enableAirplaneAnimation?: boolean
  autoplayDuration?: number
  transitionDuration?: number
  destinationOptions?: Option[]
  categoryOptions?: Option[]
  buttonLabel?: string
  placeholders?: {
    destination?: string
    date?: string
    people?: string
    category?: string
  }
}

export const MainHero: React.FC<MainHeroProps> = ({
  slides = [],
  cloudImage,
  enableAirplaneAnimation = true,
  autoplayDuration = 8000,
  transitionDuration = 1000,
  destinationOptions = [],
  categoryOptions = [],
  buttonLabel = 'Apply',
  placeholders = {},
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isChanging, setIsChanging] = useState(false)
  const [slideDirection, setSlideDirection] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    people: '',
    category: '',
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const setSlide = useCallback(
    (index: number, direction: number) => {
      if (isChanging || index === currentSlide) return
      setIsChanging(true)
      setSlideDirection(direction)
      setTimeout(() => {
        setCurrentSlide(index)
        setIsChanging(false)
      }, transitionDuration / 2)
    },
    [isChanging, transitionDuration, currentSlide],
  )

  useEffect(() => {
    if (slides.length === 0) return
    if (currentSlide >= slides.length) setCurrentSlide(0)
  }, [slides.length, currentSlide])

  useEffect(() => {
    if (slides.length <= 1) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const nextSlide = (currentSlide + 1) % slides.length
      setSlide(nextSlide, 1)
    }, autoplayDuration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentSlide, slides.length, autoplayDuration, setSlide])

  const goToPrev = () => {
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length
    setSlide(prevSlide, -1)
  }

  const goToNext = () => {
    const nextSlide = (currentSlide + 1) % slides.length
    setSlide(nextSlide, 1)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Build query params from form data
    const params = new URLSearchParams()
    
    if (formData.destination) params.append('destination', formData.destination)
    if (formData.date) params.append('date', formData.date)
    if (formData.people) params.append('people', formData.people)
    if (formData.category) params.append('category', formData.category)

    // Redirect to search/packages page with query params
    const queryString = params.toString()
     router.push(`/destinations/${formData.destination}`)
  }

  if (!slides || slides.length === 0) return null

  const activeSlide = slides[currentSlide]

  const textAnimation = {
    opacity: isChanging ? 0 : 1,
    transform: `translateX(${isChanging ? slideDirection * -50 : 0}px)`,
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
  }

  const animationStyle = {
    animationDuration: `${autoplayDuration / 1000}s`,
    animationTimingFunction: 'linear' as const,
    animationFillMode: 'forwards' as const,
  }

  return (
    <>
      {/* Inline Styles for Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:wght@300;400;500&display=swap');

        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }

        @keyframes plane-fly {
          from {
            left: 100%;
          }
          to {
            left: 0;
          }
        }

        .animate-plane-fly {
          animation-name: plane-fly;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }

        @keyframes draw-dashed-line {
          from {
            clip-path: inset(0 0 0 100%);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        .animate-draw-dashed-line {
          animation-name: draw-dashed-line;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }

        @keyframes plane-fly-right {
          from {
            left: 0;
          }
          to {
            left: 100%;
          }
        }

        .animate-plane-fly-right {
          animation-name: plane-fly-right;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }

        @keyframes draw-dashed-line-right {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        .animate-draw-dashed-line-right {
          animation-name: draw-dashed-line-right;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }

        @keyframes fade-out-at-80 {
          0%,
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      <section
        className="relative -mt-[10.4rem] w-full h-[170vh] overflow-hidden font-roboto text-white"
        data-theme="dark"
      >
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div key={slide.id || index} className="absolute inset-0">
              <MediaComponent
                fill
                imgClassName={`object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0}
                resource={slide.backgroundImage}
              />
            </div>
          ))}
        </div>

        {/* Enhanced gradient fade for the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-white via-white/80 to-transparent z-[5] pointer-events-none"></div>

        <div className="relative z-10 w-full h-full bg-black/20 flex flex-col">
          {/* Top Section */}
          <div className="relative pt-32">
            {/* Top Airplane Path Animation */}
            {enableAirplaneAnimation && (
              <div className="absolute top-0 left-0 w-full pointer-events-none mt-40">
                <div className="relative w-full">
                  <div
                    key={`top-animation-${currentSlide}`}
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-full px-8 sm:px-16"
                    style={{
                      ...animationStyle,
                      animationName: 'fade-out-at-80',
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5" style={{ zIndex: 2 }}>
                      <svg className="w-full h-full overflow-visible">
                        <line
                          x1="0"
                          y1="50%"
                          x2="100%"
                          y2="50%"
                          stroke="rgba(255, 255, 255, 0.6)"
                          strokeWidth="2"
                          strokeDasharray="6 5"
                          className="animate-draw-dashed-line"
                          style={animationStyle}
                        />
                      </svg>
                    </div>

                    <AirplaneIcon
                      className="absolute text-white text-4xl animate-plane-fly"
                      style={{
                        top: '0',
                        transform: 'translateX(-50%) translateY(-50%) rotate(-90deg)',
                        ...animationStyle,
                        zIndex: 3,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle Content */}
          <div className="relative z-10 flex-grow flex flex-col justify-center items-center space-y-20 ">
            {/* Main Title */}
            <div className="text-center w-full max-w-[50%]">
              <h1 className="font-playfair italic text-6xl md:text-8xl font-bold drop-shadow-lg pb-10">
                {activeSlide.headline || 'To travel is to live!'}
              </h1>
            </div>

            {/* Location Info & Progress */}
            <div className="w-full max-w-6xl h-8 relative ">
              {/* Left Aligned Text */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 text-left"
                style={textAnimation}
              >
                <p className="text-md font-light">{activeSlide.subtitle}</p>
                <h2 className="text-4xl font-light">{activeSlide.location}</h2>
              </div>

              {/* Centered Progress Bar */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 h-full w-28">
                {/* Static SVG dashed line on the left */}
                <div className="absolute top-1/2 right-full -translate-y-1/2 w-48 h-0.5 mr-4">
                  <svg className="w-full h-full">
                    <line
                      x1="0"
                      y1="50%"
                      x2="100%"
                      y2="50%"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="2"
                      strokeDasharray="6 5"
                    />
                  </svg>
                </div>

                {/* 3-Dot Animated Carousel */}
                <div className="w-full h-full relative flex items-center justify-center">
                  {slides.map((_, index) => {
                    const slideCount = slides.length
                    let distance = index - currentSlide

                    if (Math.abs(distance) > slideCount / 2) {
                      distance = distance > 0 ? distance - slideCount : distance + slideCount
                    }

                    const style: React.CSSProperties = {
                      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                      position: 'absolute',
                      opacity: 1,
                    }
                    let dotClass = 'w-3 h-3 rounded-full'

                    if (distance === 0) {
                      // Center dot
                      style.transform = 'translateX(0) scale(1.6)'
                      dotClass += ' bg-white'
                    } else if (distance === -1) {
                      // Left dot
                      style.transform = 'translateX(-40px) scale(1)'
                      dotClass += ' bg-white/40'
                    } else if (distance === 1) {
                      // Right dot
                      style.transform = 'translateX(40px) scale(1)'
                      dotClass += ' bg-white/40'
                    } else {
                      // Hidden dots
                      style.transform = `translateX(${Math.sign(distance) * 88}px) scale(0)`
                      style.opacity = 0
                      dotClass += ' bg-white/40'
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => setSlide(index, index > currentSlide ? 1 : -1)}
                        className={dotClass}
                        style={style}
                        aria-label={`Go to slide ${index + 1}`}
                      ></button>
                    )
                  })}
                </div>

                {/* Animated plane and line on the right */}
                <div
                  key={`bottom-animation-${currentSlide}`}
                  className="absolute top-1/2 left-full -translate-y-1/2 w-[50vw] h-4 ml-4"
                  style={{
                    ...animationStyle,
                    animationName: 'fade-out-at-80',
                  }}
                >
                  <div
                    className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2"
                    style={{ zIndex: 2 }}
                  >
                    <svg className="w-full h-full overflow-visible">
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="rgba(255, 255, 255, 0.6)"
                        strokeWidth="2"
                        strokeDasharray="6 5"
                        className="animate-draw-dashed-line-right"
                        style={animationStyle}
                      />
                    </svg>
                  </div>
                  <AirplaneIcon
                    className="absolute text-white text-2xl animate-plane-fly-right"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%) translateX(-50%) rotate(90deg)',
                      ...animationStyle,
                      zIndex: 3,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="relative w-full h-48">
            {cloudImage && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <MediaComponent
                  resource={cloudImage}
                  imgClassName="absolute top-0 left-0 w-full h-full object-cover opacity-90 object-top"
                />
                {/* Gradient for cloud image fade */}
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white via-white/60 to-transparent"></div>
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* Search Form */}
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-6xl relative px-4 pointer-events-auto h-50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f0b95a] rounded-lg shadow-2xl overflow-hidden text-black/70">
              <select
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="p-4 bg-transparent border-b sm:border-b-0 sm:border-r border-black/10 focus:outline-none placeholder:text-black/70"
                aria-label="Destination"
              >
                <option value="" disabled>
                  {placeholders?.destination || 'Destination'}
                </option>
                {destinationOptions.map((option) => (
                  <option key={option.value || option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>


                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder={placeholders?.date || 'Date'}
                    className="p-4 bg-transparent border-b sm:border-b-0 lg:border-r border-black/10 focus:outline-none placeholder:text-black/70"
                    aria-label="Date"
                  />

                  <input
                    type="number"
                    name="people"
                    value={formData.people}
                    onChange={handleInputChange}
                    min="1"
                    placeholder={placeholders?.people || 'No of people'}
                    className="p-4 bg-transparent border-b sm:border-b-0 sm:border-r border-black/10 focus:outline-none placeholder:text-black/70"
                    aria-label="People"
                  />

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="p-4 bg-transparent focus:outline-none placeholder:text-black/70"
                    aria-label="Category"
                  >
                    <option value="" disabled>
                      {placeholders?.category || 'Category'}
                    </option>
                    {categoryOptions.map((option) => (
                      <option key={option.value || option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center mt-8">
                  <button
                    type="submit"
                    className="px-10 py-3 bg-white text-black font-medium rounded-full shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Standalone Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors z-20"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors z-20"
                aria-label="Next slide"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}
        </div>
      </section>
    </>
  )
}
