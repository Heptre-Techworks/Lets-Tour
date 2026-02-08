// src/blocks/InstagramCarousel/Component.client.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import Image from 'next/image'

// Static image import for the right container
const rightContainerImage =
  'https://zozxszsaofxvunkl.public.blob.vercel-storage.com/hw__bpyheb9jkbw2_large_2x.png'
const InstagramEmbed = dynamic(
  () => import('react-social-media-embed').then((m) => m.InstagramEmbed),
  { ssr: false },
)

type GridPost = { url: string; captioned?: boolean }

const VIDEO_URL =
  'https://zozxszsaofxvunkl.public.blob.vercel-storage.com/AQPcZr0VAFuUhDLpW0DzIMo4roUsUsN9tIEJOmTOiGg195MSvQYTkvpLGkH7ek1QeI-6NMc0EAlNMLf1jq96MPSPvEZH6YvZl5KqEHQ.mp4'

const InstagramGlyph = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
  </svg>
)

const EmbedWrapper = ({
  url,
  embedWidth,
  captioned,
}: {
  url: string
  embedWidth: number
  captioned: boolean
}) => {
  const embedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const videoElement = embedRef.current?.querySelector('video')
          if (videoElement) {
            videoElement.muted = true
            videoElement.playsInline = true
            videoElement.play().catch((error) => {
              console.warn('Autoplay was prevented:', error)
            })
            observer.disconnect()
          }
        }
      }
    })

    if (embedRef.current) {
      observer.observe(embedRef.current, { childList: true, subtree: true })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={embedRef}>
      <InstagramEmbed url={url} width={embedWidth} captioned={captioned} />
    </div>
  )
}

const InstagramImageGrid: React.FC<{
  posts: GridPost[]
  gutter?: string
  aspect?: number
  trimTop?: number
  trimBottom?: number
  className?: string
}> = ({ posts, gutter = '12px', aspect = 1, trimTop = 88, trimBottom = 120, className }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [cardWidth, setCardWidth] = React.useState(320)

  const COLUMNS = 2

  const pairedColumns = React.useMemo(() => {
    const out: Array<[GridPost | undefined, GridPost | undefined]> = []
    for (let i = 0; i < posts.length; i += 2) out.push([posts[i], posts[i + 1]])
    return out
  }, [posts])

  React.useEffect(() => {
    const parsePx = (x: string) => Number(/([\d.]+)/.exec(x)?.[1] ?? 0)
    const onResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const cw = Math.max(220, Math.floor((w - (COLUMNS - 1) * parsePx(gutter)) / COLUMNS))
      setCardWidth(cw)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [gutter])

  const columnHeight = Math.round(cardWidth * aspect * 2)
  const bigH = Math.round(columnHeight * 0.62)
  const smallH = columnHeight - bigH
  const embedWidth = cardWidth

  return (
    <section className={cn(className)} aria-label="Instagram images grid">
      <div
        ref={containerRef}
        className="ig2-grid"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
          gap: gutter,
        }}
      >
        {pairedColumns.map(([top, bottom], colIndex) => {
          const even = colIndex % 2 === 0
          const topIsBig = !even
          const topH = topIsBig ? bigH : smallH
          const bottomH = topIsBig ? smallH : bigH

          return (
            <div key={`col-${colIndex}`} className="ig2-col" style={{ gap: gutter }}>
              {top ? (
                <div className="ig2-cell" style={{ height: `${topH}px` }}>
                  <div className="ig2-clip" style={{ height: `${topH}px` }}>
                    <div
                      className="ig2-shift"
                      style={{
                        transform: `translateY(-${top.captioned ? 0 : trimTop}px)`,
                        minHeight: `${topH + (top.captioned ? 0 : trimTop + trimBottom)}px`,
                      }}
                    >
                      <EmbedWrapper
                        url={top.url}
                        embedWidth={embedWidth}
                        captioned={!!top.captioned}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ig2-cell" style={{ height: `${topH}px` }} />
              )}

              {bottom ? (
                <div className="ig2-cell" style={{ height: `${bottomH}px` }}>
                  <div className="ig2-clip" style={{ height: `${bottomH}px` }}>
                    <div
                      className="ig2-shift"
                      style={{
                        transform: `translateY(-${bottom.captioned ? 0 : trimTop}px)`,
                        minHeight: `${bottomH + (bottom.captioned ? 0 : trimTop + trimBottom)}px`,
                      }}
                    >
                      <EmbedWrapper
                        url={bottom.url}
                        embedWidth={embedWidth}
                        captioned={!!bottom.captioned}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ig2-cell" style={{ height: `${bottomH}px` }} />
              )}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .ig2-grid {
          display: grid;
          align-items: stretch;
        }
        .ig2-col {
          display: flex;
          flex-direction: column;
        }
        .ig2-cell {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 10px;
          background: #f4f4f4;
        }
        .ig2-clip {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .ig2-shift {
          position: absolute;
          inset: 0;
          width: 100%;
        }
      `}</style>
    </section>
  )
}

export const InstagramCarouselClient: React.FC<any> = ({
  heading,
  profile,
  layout,
  posts,
  caption,
  className,
  videoUrl, // New prop maintained
}) => {
  const typedCaption = caption as DefaultTypedEditorState | null | undefined
  const hasCaption = !!typedCaption && typeof typedCaption === 'object' && 'root' in typedCaption
  const gutter = layout?.gutter ?? '12px'
  const showCaptionsGlobal = !!layout?.showCaptions

  const allMappedPosts: GridPost[] = (posts || [])
  .map((p: any) => ({
    url: p?.url ?? '',
    captioned: showCaptionsGlobal || !!p?.captioned,
  }))
  .filter((p: GridPost) => p.url && p.url.trim().length > 0)

  const MAX_POSTS_PER_GRID = 4
  const gridOnePosts = allMappedPosts.slice(0, MAX_POSTS_PER_GRID)
  const avatarUrl =
    typeof profile?.avatarUrl === 'object' ? profile.avatarUrl?.url : profile?.avatarUrl

  // Re-added State and Refs from original code
  const [leftGridHeight, setLeftGridHeight] = useState('auto')
  const leftGridRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Combined legacy measure logic + resilience
  useEffect(() => {
    const measureHeight = () => {
      // Small timeout to allow render
      setTimeout(() => {
        if (leftGridRef.current && leftGridRef.current.offsetHeight > 50) {
          setLeftGridHeight(`${leftGridRef.current.offsetHeight}px`)
        } else {
          // Fallback if measurement (0 or null) fails, so it doesn't disappear
          setLeftGridHeight('550px') 
        }
      }, 200)
    }
    measureHeight()
    window.addEventListener('resize', measureHeight)
    return () => window.removeEventListener('resize', measureHeight)
  }, [gridOnePosts.length])


  const [videoSrc, setVideoSrc] = useState<string>('')
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVideoSrc(videoUrl || VIDEO_URL)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' },
    )

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current)
    }

    return () => observer.disconnect()
  }, [videoUrl])

  useEffect(() => {
    if (!videoSrc) return

    const timer = setTimeout(() => {
      const videoElement = videoContainerRef.current?.querySelector('video')
      if (videoElement) {
        videoElement.muted = true
        videoElement.playsInline = true
        videoElement.loop = true
        videoElement.play().catch((error) => console.warn(error))
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [videoSrc])

  return (
    <div className={cn('container py-4', className)}>
      {(heading || profile?.handle) && (
        <header className="mb-6 flex flex-wrap items-center gap-4 border-b pb-4">
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={`${profile?.handle ?? 'Instagram'} logo`}
              className="h-10 w-10 rounded-full object-cover shadow-md"
              fill
            />
          )}

          <div className="flex flex-col">
            <h3
              className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900"
              style={{ fontFamily: "'NATS', sans-serif" }}
            >
              {heading ?? 'Latest on Instagram'}
            </h3>
            <span
              className="text-sm sm:text-base leading-snug text-gray-600"
              style={{ fontFamily: "'NATS', sans-serif" }}
            >
              @{profile?.handle ?? 'Our Feed'} ({allMappedPosts.length} posts)
            </span>
          </div>

          <div className="hidden sm:block h-12 w-px bg-gray-300 mx-4" aria-hidden="true" />

          {profile?.profileUrl && (
            <a
              href={profile.profileUrl}
              className="relative group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm sm:text-base font-medium text-white shadow-lg ml-auto lg:ml-0 transition-all duration-300 ease-in-out overflow-hidden"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background:
                  'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                fontFamily: "'NATS', sans-serif",
              }}
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                aria-hidden="true"
              ></span>
              <InstagramGlyph className="h-5 w-5 text-white relative z-10" />
              <span className="tracking-wide relative z-10">
                {profile?.followLabel ?? 'Follow us'}
              </span>
            </a>
          )}
        </header>
      )}

      {/* Main Content: Reverted to w-1/2 layout but without m-5 */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch">
        {gridOnePosts.length > 0 && (
          <div className="w-full lg:w-1/2" ref={leftGridRef}>
            <InstagramImageGrid
              posts={gridOnePosts}
              gutter={gutter}
              aspect={1}
              trimTop={80}
              trimBottom={10}
            />
          </div>
        )}

        <div className="w-full lg:w-1/2">
          <div
            className="ig2-cell w-full"
            style={{
              height: leftGridHeight,
              overflow: 'hidden',
              borderRadius: '20px',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'top',
            }}
          >
            <div className="relative w-full h-[440px] sm:h-[440px] md:h-[550px]">
              <Image
                src={rightContainerImage}
                alt="Custom promotional image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div
              ref={videoContainerRef}
              className="z-10 pointer-events-auto relative w-[200px] sm:w-[200px] md:w-[250px] h-[430px] sm-h[450px] md:h-[530px] top-[5px] sm:top-[11px] md:top-[10px] rounded-[30px] overflow-hidden"
            >
              <video
                src={videoSrc}
                controls={false}
                autoPlay={true}
                muted={true}
                playsInline={true}
                loop={true}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {hasCaption && (
        <div className="mt-6">
          <div style={{ fontFamily: "'NATS', sans-serif", color: '#000000' }}>
            <RichText data={typedCaption!} enableGutter={false} />
          </div>
        </div>
      )}
    </div>
  )
}

export default InstagramCarouselClient
