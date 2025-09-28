// src/blocks/InstagramCarousel/Component.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/utilities/ui';
import RichText from '@/components/RichText';
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical';
import type { InstagramCarouselBlock as InstagramCarouselBlockProps } from '@/payload-types';

// Client-only Instagram embed (depends on window.instgrm)
const InstagramEmbed = dynamic(
  () => import('react-social-media-embed').then((m) => m.InstagramEmbed),
  { ssr: false },
);

type GridPost = { url: string; captioned?: boolean };

const InstagramImageGrid: React.FC<{
  posts: GridPost[];
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  gutter?: string;
  aspect?: number;       // base aspect for width->height scaling
  trimTop?: number;      // header crop when not captioned
  trimBottom?: number;   // footer crop when not captioned
  className?: string;
}> = ({
  posts,
  columnsDesktop = 4,
  columnsTablet = 3,
  columnsMobile = 2,
  gutter = '12px',
  aspect = 1,
  trimTop = 88,
  trimBottom = 120,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = React.useState(320);
  const [colCount, setColCount] = React.useState(columnsDesktop);

  // Pair posts into columns: [top, bottom]
  const pairedColumns = React.useMemo(() => {
    const out: Array<[GridPost | undefined, GridPost | undefined]> = [];
    for (let i = 0; i < posts.length; i += 2) {
      out.push([posts[i], posts[i + 1]]);
    }
    return out;
  }, [posts]);

  React.useEffect(() => {
    const parsePx = (x: string) => Number((/([\d.]+)/.exec(x)?.[1] ?? 0)); // fixed capture
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const ww = window.innerWidth;
      const cols =
        ww >= 1024 ? columnsDesktop : ww >= 768 ? columnsTablet : columnsMobile;
      setColCount(cols);
      const cw = Math.max(
        220,
        Math.floor((w - (cols - 1) * parsePx(gutter)) / cols),
      );
      setCardWidth(cw);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [columnsDesktop, columnsTablet, columnsMobile, gutter]);

  // Grid sizing: a column holds 2 cards; big ~60%, small ~40% of column height
  const columnHeight = Math.round(cardWidth * aspect * 1.6);
  const bigH = Math.round(columnHeight * 0.62);
  const smallH = columnHeight - bigH;

  const embedWidth = cardWidth + 160;

  return (
    <section className={cn(className)} aria-label="Instagram images grid">
      <div
        ref={containerRef}
        className="ig2-grid"
        style={{
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: gutter,
        }}
      >
        {pairedColumns.map(([top, bottom], colIndex) => {
          const even = colIndex % 2 === 0;
          // Pattern:
          // - Even column: top small, bottom big
          // - Odd column:  top big,   bottom small
          const topIsBig = !even;
          const topH = topIsBig ? bigH : smallH;
          const bottomH = topIsBig ? smallH : bigH;

          const topKey = `ig:top:${top?.url ?? 'empty'}:${colIndex}`;
          const bottomKey = `ig:bottom:${bottom?.url ?? 'empty'}:${colIndex}`;

          return (
            <div key={`col:${top?.url ?? 'x'}:${bottom?.url ?? 'y'}:${colIndex}`} className="ig2-col">
              {/* Top card */}
              {top ? (
                <div className="ig2-cell" style={{ height: `${topH}px` }} key={topKey}>
                  <div className="ig2-clip" style={{ height: `${topH}px` }}>
                    <div
                      className="ig2-shift"
                      style={{
                        transform: `translateY(-${top.captioned ? 0 : trimTop}px)`,
                        minHeight: `${topH + (top.captioned ? 0 : trimTop) + (top.captioned ? 0 : trimBottom)}px`,
                      }}
                    >
                      <InstagramEmbed url={top.url} width={embedWidth} captioned={!!top.captioned} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ig2-cell" style={{ height: `${topH}px` }} />
              )}

              {/* Bottom card */}
              {bottom ? (
                <div className="ig2-cell" style={{ height: `${bottomH}px` }} key={bottomKey}>
                  <div className="ig2-clip" style={{ height: `${bottomH}px` }}>
                    <div
                      className="ig2-shift"
                      style={{
                        transform: `translateY(-${bottom.captioned ? 0 : trimTop}px)`,
                        minHeight: `${bottomH + (bottom.captioned ? 0 : trimTop) + (bottom.captioned ? 0 : trimBottom)}px`,
                      }}
                    >
                      <InstagramEmbed url={bottom.url} width={embedWidth} captioned={!!bottom.captioned} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ig2-cell" style={{ height: `${bottomH}px` }} />
              )}
            </div>
          );
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
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

// Export const component typed by the generated interfaceName
export const InstagramCarousel: React.FC<
  InstagramCarouselBlockProps & { className?: string }
> = ({ heading, profile, layout, posts, caption, className }) => {
  const typedCaption = caption as DefaultTypedEditorState | null | undefined;
  const hasCaption = !!typedCaption && typeof typedCaption === 'object' && 'root' in typedCaption;

  const columnsDesktop = layout?.columnsDesktop ?? 4;
  const columnsTablet = layout?.columnsTablet ?? 3;
  const columnsMobile = layout?.columnsMobile ?? 2;
  const gutter = layout?.gutter ?? '12px';
  const showCaptionsGlobal = !!layout?.showCaptions;

  const mappedPosts: GridPost[] = (posts || []).map((p) => ({
    url: p?.url ?? '',
    captioned: showCaptionsGlobal || !!p?.captioned,
  }));

  return (
    <div className={cn('container', className)}>
      {(heading || profile?.handle) && (
        <header className="mb-4 flex items-center justify-between">
          {heading && <h3 className="text-lg font-semibold">{heading}</h3>}
          {profile?.profileUrl && (
            <a
              href={profile.profileUrl}
              className="rounded-full border px-3 py-1 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile?.followLabel ?? 'Follow us'}
            </a>
          )}
        </header>
      )}

      <InstagramImageGrid
        posts={mappedPosts}
        columnsDesktop={columnsDesktop}
        columnsTablet={columnsTablet}
        columnsMobile={columnsMobile}
        gutter={gutter}
        aspect={1}
        trimTop={88}
        trimBottom={120}
      />

      {hasCaption && (
        <div className="mt-6">
          <RichText data={typedCaption!} enableGutter={false} />
        </div>
      )}
    </div>
  );
};

export default InstagramCarousel;
