function extensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const match = pathname.match(/\.(jpe?g|png|webp|gif)$/i)
    if (match) return match[1].toLowerCase()
  } catch {
    /* ignore */
  }
  return 'jpg'
}

async function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Download failed')
  return response.blob()
}

export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const blob = await fetchImageBlob(url)
    await downloadBlob(blob, filename)
    return
  } catch {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.click()
  }
}

export async function downloadPostImages(
  postId: string,
  images: string[],
): Promise<void> {
  if (!images.length) return

  for (let index = 0; index < images.length; index += 1) {
    const url = images[index]
    const ext = extensionFromUrl(url)
    const filename =
      images.length === 1
        ? `post-${postId}.${ext}`
        : `post-${postId}-${index + 1}.${ext}`
    await downloadImage(url, filename)
    if (index < images.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
    }
  }
}
