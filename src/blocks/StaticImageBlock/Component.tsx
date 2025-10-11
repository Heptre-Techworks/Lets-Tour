import React from 'react';

interface Media {
  url: string;
  alt?: string;
}

interface Props {
  image: Media;
  overlay?: boolean;
  overlayOpacity?: number;
  height?: 'small' | 'medium' | 'large' | 'xl';
}

const StaticImageBlock: React.FC<Props> = ({
  image,
  overlay = true,
  overlayOpacity = 0.5,
  height = 'medium',
}) => {
  if (!image?.url) {
    return null;
  }

  const getHeightClass = () => {
    switch (height) {
      case 'small':
        return 'h-80';
      case 'large':
        return 'h-[500px]';
      case 'xl':
        return 'h-[600px]';
      case 'medium':
      default:
        return 'h-96';
    }
  };

  return (
    <section className={`relative w-full overflow-hidden ${getHeightClass()}`}>
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
    </section>
  );
};

export default StaticImageBlock;
