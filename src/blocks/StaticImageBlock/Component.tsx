import React from 'react';

interface Media {
  url: string;
  alt?: string;
}

interface Props {
  image: Media;
  overlay?: boolean;
  overlayOpacity?: number;
}

const StaticImageBlock: React.FC<Props> = ({
  image,
  overlay = true,
  overlayOpacity = 0.5,
}) => {
  if (!image?.url) {
    return null;
  }

  return (
    <section 
      className="w-screen relative pb-12 sm:pb-16 md:pb-20"
      style={{ 
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      <div 
        className="relative w-full overflow-hidden"
        style={{ height: '750px' }}
      >
        <img
          src={image.url}
          alt={image.alt || ''}
          className="w-full h-full object-cover"
        />
        {overlay && (
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>
    </section>
  );
};

export default StaticImageBlock;
