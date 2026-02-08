
import sharp from 'sharp'

type MediaSize = 'mobile' | 'tablet' | 'desktop'

const SIZES: Record<MediaSize, { width: number; height?: number }> = {
  mobile: { width: 640 },
  tablet: { width: 1024 },
  desktop: { width: 1920 },
}

export async function processMedia(
  buffer: Buffer,
): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
  // Convert to WebP and optimize
  const processed = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer()

  return {
    buffer: processed,
    mimeType: 'image/webp',
    size: processed.length,
  }
}

export async function generateResponsiveVariant(
  buffer: Buffer,
  size: MediaSize,
): Promise<{ buffer: Buffer; width: number; height: number; size: number }> {
  const { width, height } = SIZES[size]
  
  const pipeline = sharp(buffer).resize(width, height, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  // Get dimensions
  const metadata = await pipeline.metadata()
  const processedBuffer = await pipeline.webp({ quality: 80 }).toBuffer()

  return {
    buffer: processedBuffer,
    width: metadata.width || width,
    height: metadata.height || 0,
    size: processedBuffer.length,
  }
}
