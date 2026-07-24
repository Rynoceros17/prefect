export interface ProcessImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  /** Keep the original file when it already fits these bounds. */
  maxBytes?: number
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image.'))
    }

    img.src = objectUrl
  })
}

/** Resize and compress images before storing — prevents localStorage blow-ups and black screens. */
export async function processImageFileToBlob(
  file: File,
  options: ProcessImageOptions = {},
): Promise<Blob> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.88, maxBytes = 2_000_000 } = options

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const { width, height } = await readImageDimensions(file)
  const fitsBounds = width <= maxWidth && height <= maxHeight

  if (fitsBounds && file.size <= maxBytes) {
    return file
  }

  return compressImage(file, maxWidth, maxHeight, quality)
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {},
): Promise<string> {
  const blob = await processImageFileToBlob(file, options)
  return readBlobAsDataUrl(blob)
}

function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      const scale = Math.min(1, maxWidth / width, maxHeight / height)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process image.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const tryEncode = (mime: string) =>
        new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), mime, quality)
        })

      void (async () => {
        const webp = await tryEncode('image/webp')
        if (webp) {
          resolve(webp)
          return
        }

        const jpeg = await tryEncode('image/jpeg')
        if (jpeg) resolve(jpeg)
        else reject(new Error('Image compression failed.'))
      })()
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image.'))
    }

    img.src = objectUrl
  })
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
