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
  () => import('react-social-media-embed').then(m => m.InstagramEmbed),
  { ssr: false },
);

type GridPost = { url: string; captioned?: boolean };

const InstagramImageGrid: React.FC<{
  posts: GridPost[];
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  gutter?: string;
  aspect?: number;
  trimTop?: number;
  trimBottom?: number;
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
  const [cardWidth, setCardWidth] = React.useState(320);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const parsePx = (x: string) => Number((/([\d.]+)/.exec(x)?.[7] ?? 0));
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const ww = window.innerWidth;
      const cols = ww >= 1024 ? columnsDesktop : ww >= 768 ? columnsTablet : columnsMobile;
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

  const cardHeight = Math.round(cardWidth * aspect);
  const embedWidth = cardWidth + 160;

  return (
    <section className={cn(className)} aria-label="Instagram images grid">
      <div ref={containerRef} className="ig-grid">
        {posts.map((p, i) => {
          const showCaps = !!p.captioned; // if true, do not crop header/footer
          const top = showCaps ? 0 : trimTop;
          const bottom = showCaps ? 0 : trimBottom;

          return (
            <div key={i} className="ig-cell" style={{ height: `${cardHeight}px` }}>
              <div className="ig-clip" style={{ height: `${cardHeight}px` }}>
                <div
                  className="ig-shift"
                  style={{
                    transform: `translateY(-${top}px)`,
                    minHeight: `${cardHeight + top + bottom}px`,
                  }}
                >
                  <InstagramEmbed url={p.url} width={embedWidth} captioned={showCaps} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .ig-grid {
          display: grid;
          gap: ${gutter};
          grid-template-columns: repeat(${columnsMobile}, 1fr);
        }
        @media (min-width: 768px) {
          .ig-grid {
            grid-template-columns: repeat(${columnsTablet}, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .ig-grid {
            grid-template-columns: repeat(${columnsDesktop}, 1fr);
          }
        }
        .ig-cell {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 10px;
          background: #f4f4f4;
        }
        .ig-clip {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .ig-shift {
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
  // Optional caption under the grid using Lexical JSON
  const typedCaption = caption as DefaultTypedEditorState | null | undefined;
  const hasCaption =
    !!typedCaption && typeof typedCaption === 'object' && 'root' in typedCaption;

  const columnsDesktop = layout?.columnsDesktop ?? 4;
  const columnsTablet = layout?.columnsTablet ?? 3;
  const columnsMobile = layout?.columnsMobile ?? 2;
  const gutter = layout?.gutter ?? '12px';
  const showCaptionsGlobal = !!layout?.showCaptions;

  const mappedPosts: GridPost[] = (posts || []).map((p) => ({
    url: p?.url,
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
