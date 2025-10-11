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

// Open-source Instagram glyph (Bootstrap path), inherits currentColor
const InstagramGlyph = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
  </svg>
);

// ======================= Instagram grid =======================
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = React.useState(320);
  const [colCount, setColCount] = React.useState(columnsDesktop);

  // Pair posts into [top, bottom]
  const pairedColumns = React.useMemo(() => {
    const out: Array<[GridPost | undefined, GridPost | undefined]> = [];
    for (let i = 0; i < posts.length; i += 2) out.push([posts[i], posts[i + 1]]);
    return out;
  }, [posts]);

  React.useEffect(() => {
    const parsePx = (x: string) => Number((/([\d.]+)/.exec(x)?.[1] ?? 0));
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const ww = window.innerWidth;
      const cols = ww >= 1024 ? columnsDesktop : ww >= 768 ? columnsTablet : columnsMobile;
      setColCount(cols);
      const cw = Math.max(220, Math.floor((w - (cols - 1) * parsePx(gutter)) / cols));
      setCardWidth(cw);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [columnsDesktop, columnsTablet, columnsMobile, gutter]);

  // Column heights
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
          gap: gutter, // equal row/column gaps (container)
        }}
      >
        {pairedColumns.map(([top, bottom], colIndex) => {
          const even = colIndex % 2 === 0;
          const topIsBig = !even;
          const topH = topIsBig ? bigH : smallH;
          const bottomH = topIsBig ? smallH : bigH;

          const topKey = `ig:top:${top?.url ?? 'empty'}:${colIndex}`;
          const bottomKey = `ig:bottom:${bottom?.url ?? 'empty'}:${colIndex}`;

          return (
            <div
              key={`col:${top?.url ?? 'x'}:${bottom?.url ?? 'y'}:${colIndex}`}
              className="ig2-col"
              style={{ gap: gutter }} // equal gap between top/bottom in a column
            >
              {/* Top cell */}
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

              {/* Bottom cell */}
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
        .ig2-grid { display: grid; align-items: stretch; }
        .ig2-col { display: flex; flex-direction: column; }
        .ig2-cell {
          position: relative; width: 100%; overflow: hidden;
          border-radius: 10px; background: #f4f4f4;
        }
        .ig2-clip { position: absolute; inset: 0; overflow: hidden; }
        .ig2-shift { position: absolute; inset: 0; width: 100%; pointer-events: none; }
      `}</style>
    </section>
  );
};

// ===================== Exported block component =====================
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

  const postCount = mappedPosts.filter((p) => p.url && p.url.trim().length > 0).length; // number of valid posts
  const avatarUrl =
    (profile as any)?.avatarUrl ||
    (profile as any)?.image?.url ||
    (profile as any)?.logo?.url ||
    null;

  return (
    <div className={cn('container', className)}>
      {(heading || profile?.handle) && (
        <header className="mb-4 flex items-center">
          {/* Profile logo/avatar at left */}
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={`${profile?.handle ?? 'Instagram'} logo`}
              className="mr-3 h-8 w-8 rounded-full object-cover"
            />
          )}

          {/* Title and post count */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold leading-tight">
              {heading ?? 'Latest on Instagram'}
            </h3>
            <span className="text-xs text-gray-500 leading-snug">{postCount} posts</span>
          </div>

          {/* Vertical divider between title and button */}
          <div className="mx-3 h-6 w-px bg-gray-300" aria-hidden="true" />

          {/* Follow button with Instagram icon */}
          {profile?.profileUrl && (
            <a
              href={profile.profileUrl}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 hover:bg-gray-50 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramGlyph className="h-4 w-4" />
              <span>{profile?.followLabel ?? 'Follow us'}</span>
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
