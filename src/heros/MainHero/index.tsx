'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePageTransition } from '@/providers/PageTransitionContext'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import type { Media as PayloadMedia } from '@/payload-types'
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
  backgroundImage: PayloadMedia | string
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
  cloudImage: PayloadMedia | string | null | undefined
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

// Font utils (Kaushan Script + Neuton)
const fontsStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Neuton:wght@400;700&family=Roboto:wght@300;400;500&display=swap');
  .font-kaushan { font-family: 'Kaushan Script', cursive; }
  .font-neuton { font-family: 'Neuton', serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
`

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



  // Content Loading Logic
  const { setContentLoading } = usePageTransition()
  
  useEffect(() => {
    // Start loading on mount
    setContentLoading(true)
    
    // Failsafe: If image doesn't load in 3s, remove loader anyway
    const timer = setTimeout(() => {
      setContentLoading(false)
    }, 5000)
    
    return () => {
      clearTimeout(timer)
      setContentLoading(false)
    }
  }, [setContentLoading])

  const handleImageLoad = () => {
    setContentLoading(false)
  }

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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (formData.destination) params.append('destination', formData.destination)
    if (formData.date) params.append('date', formData.date)
    if (formData.people) params.append('people', formData.people)
    if (formData.category) params.append('category', formData.category)
    const queryString = params.toString()
    router.push(`/destinations/${formData.destination}`)
  }

  if (!slides || slides.length === 0) {
      if (typeof window !== 'undefined') setContentLoading(false)
      return null
  }

  const activeSlide = slides[currentSlide]

  const textAnimation: React.CSSProperties = {
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
      {/* Fonts + animations */}
      <style>{`
        ${fontsStyle}
        @keyframes plane-fly { from { left: 100%; } to { left: 0; } }
        .animate-plane-fly { animation-name: plane-fly; animation-timing-function: linear; animation-iteration-count: 1; }
        @keyframes draw-dashed-line { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
        .animate-draw-dashed-line { animation-name: draw-dashed-line; animation-timing-function: linear; animation-iteration-count: 1; }
        @keyframes plane-fly-right { from { left: 0; } to { left: 100%; } }
        .animate-plane-fly-right { animation-name: plane-fly-right; animation-timing-function: linear; animation-iteration-count: 1; }
        @keyframes draw-dashed-line-right { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        .animate-draw-dashed-line-right { animation-name: draw-dashed-line-right; animation-timing-function: linear; animation-iteration-count: 1; }
        @keyframes fade-out-at-80 { 0%, 80% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      <section className="relative w-full h-[100dvh] overflow-hidden font-roboto text-white">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div key={slide.id || index} className="absolute inset-0">
              <MediaComponent
                fill
                imgClassName={`object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0}
                onLoad={index === 0 ? handleImageLoad : undefined}
                resource={slide.backgroundImage}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-black/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[2] pointer-events-none" />

        {/* Cloud Image - Fixed Background Layer */}
        {cloudImage && (
            <div className="absolute bottom-0 left-0 w-full z-[5] pointer-events-none mix-blend-screen opacity-90">
               <div className="relative w-full h-[50vh] translate-y-[20%] sm:h-[60vh] sm:translate-y-[25%] md:h-auto md:aspect-[2/1] md:translate-y-[35%] lg:h-[600px] lg:aspect-auto lg:translate-y-[40%] xl:translate-y-[45%] 2xl:translate-y-[50%] min-[1800px]:translate-y-[65%]">
                 <MediaComponent
                   resource={cloudImage}
                   fill
                   imgClassName="object-cover object-bottom lg:object-center w-full h-full"
                 />
              </div>
            </div>
        )}

        {/* Main Content Container */}
        <div className="absolute inset-0 z-[10] flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 pointer-events-none">
            
            {/* 1. Top Flight Animation */}
            {enableAirplaneAnimation && (
              <div className="relative w-full h-12 sm:h-16 mb-2 opacity-80 pointer-events-auto overflow-hidden shrink-0">
                  <div
                    key={`plane-top-${currentSlide}`}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ ...animationStyle, animationName: 'fade-out-at-80' }}
                  >
                     {/* Dashed line */}
                     <div className="absolute top-1/2 left-0 w-full h-0.5 px-4 sm:px-10">
                        <svg className="w-full h-full overflow-visible">
                          <line
                            x1="0"
                            y1="50%"
                            x2="100%"
                            y2="50%"
                            stroke="rgba(255, 255, 255, 0.5)"
                            strokeWidth="2"
                            strokeDasharray="8 6"
                            className="animate-draw-dashed-line"
                            style={animationStyle}
                          />
                        </svg>
                     </div>
                     {/* Plane */}
                     <AirplaneIcon
                        className="absolute text-white text-xl sm:text-2xl animate-plane-fly"
                        style={{
                          top: '50%',
                          marginTop: '-10px',
                          transform: 'translateX(-50%) translateY(-50%) rotate(-90deg)',
                          ...animationStyle,
                        }}
                      />
                  </div>
              </div>
            )}

            {/* 2. Center Text Section */}
            <div className="text-center w-full px-4 mb-4 sm:mb-6 pointer-events-auto z-20 shrink-0">
               {/* Main Title */}
               <h1 className="font-kaushan text-[36px] sm:text-[56px] md:text-[72px] lg:text-[80px] leading-[1.1] font-normal drop-shadow-2xl text-white mb-3">
                 {activeSlide.headline || 'To travel is to live!'}
               </h1>
               
               {/* Progress Dots */}
               <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                   {slides.map((_, index) => {
                      return (
                        <button
                          key={index}
                          onClick={() => setSlide(index, index > currentSlide ? 1 : -1)}
                          className={`rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? 'w-2 sm:w-3 h-2 sm:h-3 bg-white scale-125' 
                              : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      )
                   })}
               </div>

               {/* Location Text */}
               <div className="overflow-hidden h-16 sm:h-20 relative flex flex-col items-center justify-center">
                 <div style={textAnimation} className="mt-[-0.5rem] sm:mt-[-1rem]">
                    <p className="font-neuton text-[16px] sm:text-[20px] text-white/90">
                       {activeSlide.subtitle}
                    </p>
                    <h2 className="font-neuton text-[28px] sm:text-[42px] leading-tight text-white drop-shadow-md">
                       {activeSlide.location}
                    </h2>
                 </div>
               </div>
            </div>

            {/* 3. Bottom Flight Animation */}
            {enableAirplaneAnimation && (
               <div className="relative w-full h-12 sm:h-16 mt-0 sm:mt-2 opacity-80 pointer-events-auto overflow-hidden shrink-0">
                 <div
                   key={`plane-bottom-${currentSlide}`}
                   className="absolute top-0 left-0 w-full h-full"
                   style={{ ...animationStyle, animationName: 'fade-out-at-80' }}
                 > 
                   {/* Dashed line */}
                   <div className="absolute top-1/2 left-0 w-full h-0.5 px-4 sm:px-10">
                        <svg className="w-full h-full overflow-visible">
                          <line
                            x1="0"
                            y1="50%"
                            x2="100%"
                            y2="50%"
                            stroke="rgba(255, 255, 255, 0.5)"
                            strokeWidth="2"
                            strokeDasharray="8 6"
                            className="animate-draw-dashed-line-right"
                            style={animationStyle}
                          />
                        </svg>
                     </div>

                   <AirplaneIcon
                      className="absolute text-white text-xl sm:text-2xl animate-plane-fly-right"
                      style={{
                         top: '50%',
                         marginTop: '-10px',
                         transform: 'translateY(-50%) translateX(-50%) rotate(90deg)',
                         ...animationStyle,
                      }}
                    />
                 </div>
               </div>
            )}

        </div>

        {/* Nav Buttons (Sides) */}
        {slides.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-20 border border-white/20 text-white"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-20 border border-white/20 text-white"
                aria-label="Next slide"
              >
                <ChevronRightIcon />
              </button>
            </>
        )}
      </section>
    </>
  )
}
