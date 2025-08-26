// components/blocks/HeroMainBlock.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'

// --- TYPE DEFINITIONS ---
type Media = {
  url: string
  alt?: string
}
type Option = { label: string; value: string }
type Slide = { image: Media | string; title: string; subtitle: string; location: string }

type Props = {
  slides: Slide[]
  cloudImage: Media | string
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

// --- REUSABLE SVG ICONS ---
const AirplaneIcon = ({ className = '' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.4 14.6l-8.1-4.8V3.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v6.3L2.2 14.6c-.3.2-.3.5 0 .7l1.2.8 6.7-3.9v5.6l-2 1.5V21l3.5-1 3.5 1v-1.5l-2-1.5V12l6.7 3.9 1.2-.8c.3-.2.3-.5 0-.7z"/>
  </svg>
)
const ChevronLeftIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18L9 12L15 6" /></svg>)
const ChevronRightIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18L15 12L9 6" /></svg>)

// --- THE MAIN COMPONENT ---
export const HeroMainBlock: React.FC<Props> = ({
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isChanging, setIsChanging] = useState(false)
  const [progress, setProgress] = useState(0) // For the progress bar animation

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)

  const setSlide = (index: number) => {
    if (isChanging) return
    setIsChanging(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setProgress(0) // Reset progress on slide change
      setIsChanging(false)
    }, transitionDuration / 2)
  }

  // Slideshow and Progress Bar Animation Logic
  useEffect(() => {
    if (slides.length <= 1) return

    // Autoplay Timer
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSlide((currentSlide + 1) % slides.length)
    }, autoplayDuration)

    // Progress bar animation using requestAnimationFrame
    let startTime = Date.now()
    const animateProgress = () => {
      const elapsedTime = Date.now() - startTime
      const currentProgress = Math.min((elapsedTime / autoplayDuration) * 100, 100)
      setProgress(currentProgress)
      animationFrameRef.current = requestAnimationFrame(animateProgress)
    }
    animationFrameRef.current = requestAnimationFrame(animateProgress)
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [currentSlide, slides.length, autoplayDuration])
  
  const goToPrev = () => setSlide((currentSlide - 1 + slides.length) % slides.length)
  const goToNext = () => setSlide((currentSlide + 1) % slides.length)
  
  if (!slides || slides.length === 0) return null
  const activeSlide = slides[currentSlide]
  const cloudImageUrl = typeof cloudImage === 'string' ? cloudImage : cloudImage?.url

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Roboto:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        @keyframes fly-across {
          from { left: 0; }
          to { left: 100%; }
        }
        .animate-fly-across {
          animation: fly-across 15s linear infinite;
        }
      `}</style>
      
      <section className="relative w-full h-screen overflow-hidden bg-black font-roboto text-white">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <img key={index} src={typeof slide.image === 'string' ? slide.image : slide.image?.url} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000" style={{ opacity: index === currentSlide ? 1 : 0 }} />
          ))}
        </div>

        <div className="relative z-10 w-full h-full">
          {/* Top Airplane Path Animation */}
          {enableAirplaneAnimation && (
            <div className="absolute top-[20%] left-0 w-full px-16 pointer-events-none">
              <div className="relative w-1/3 mx-auto">
                 <div className="absolute w-full top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/50" />
                 <AirplaneIcon className="absolute top-1/2 -translate-y-1/2 animate-fly-across" />
              </div>
            </div>
          )}

          {/* Main Title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="font-playfair italic text-8xl font-bold whitespace-nowrap drop-shadow-lg transition-all duration-500" style={{ opacity: isChanging ? 0 : 1, transform: `translateY(${isChanging ? '1rem' : '0'})` }}>
              {activeSlide.title}
            </h1>
          </div>

          {/* Navigation Arrows */}
          <button onClick={goToPrev} className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"><ChevronLeftIcon /></button>
          <button onClick={goToNext} className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"><ChevronRightIcon /></button>
          
          {/* Bottom Section Container */}
          <div className="absolute bottom-0 left-0 w-full h-1/2">
            {/* Cloud Image Layer */}
            {cloudImageUrl && (
              <div className="absolute inset-0 -bottom-10">
                <img src={cloudImageUrl} alt="Cloud overlay" className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom" style={{ maskImage: 'linear-gradient(to top, white 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, white 60%, transparent 100%)' }} />
              </div>
            )}
            
            <div className="absolute inset-0 flex flex-col justify-end items-center pb-12">
              {/* Location & Progress Bar */}
              <div className="w-1/2 flex items-center justify-between mb-16 transition-all duration-500" style={{ opacity: isChanging ? 0 : 1, transform: `translateY(${isChanging ? '1rem' : '0'})` }}>
                <div>
                  <p className="text-sm font-light">{activeSlide.subtitle}</p>
                  <h2 className="text-3xl font-light">{activeSlide.location}</h2>
                </div>
                <div className="relative flex-grow h-px bg-white/30 ml-4">
                    {/* Animated Plane on Progress Track */}
                    {enableAirplaneAnimation && (
                        <AirplaneIcon className="absolute top-1/2 -translate-y-1/2" style={{ left: `${progress}%` }} />
                    )}
                </div>
              </div>

              {/* Search Form */}
              <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-3xl relative">
                <div className="grid grid-cols-4 bg-[#f0b95a] rounded-lg shadow-2xl overflow-hidden text-black/70">
                  <input placeholder={placeholders?.destination} className="p-3 bg-transparent border-r border-black/10 focus:outline-none placeholder:text-black/70"/>
                  <input type="text" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} placeholder={placeholders?.date} className="p-3 bg-transparent border-r border-black/10 focus:outline-none placeholder:text-black/70"/>
                  <input placeholder={placeholders?.people} className="p-3 bg-transparent border-r border-black/10 focus:outline-none placeholder:text-black/70"/>
                  <input placeholder={placeholders?.category} className="p-3 bg-transparent focus:outline-none placeholder:text-black/70"/>
                </div>
                
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                   <button type="submit" className="px-10 py-3 bg-white text-black font-medium rounded-full shadow-lg hover:scale-105 transition-transform duration-200">
                      {buttonLabel}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroMainBlock
