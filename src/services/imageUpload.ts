import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '../lib/firebase'
import { IMAGE_CACHE_CONTROL, feedUploadOptions, fullUploadOptions, uploadOptionsForPath } from '../utils/imagePresets'
import {
  isManagedStorageUrl,
  storagePathFromDownloadUrl,
} from '../utils/siteImageUrls'
import { processImageFile, processImageFileToBlob, type ProcessImageOptions } from '../utils/images'

export function isDataUrl(value: string): boolean {
  return value.startsWith('data:image/')
}

function extensionForMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  if (!header || !base64) throw new Error('Invalid data URL')
  const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function storagePathWithExtension(storagePath: string, blob: Blob): string {
  const ext = extensionForMime(blob.type)
  return storagePath.includes('.') ? storagePath : `${storagePath}.${ext}`
}

async function uploadBlob(storagePath: string, blob: Blob): Promise<string> {
  const path = storagePathWithExtension(storagePath, blob)
  const storageRef = ref(getFirebaseStorage(), path)
  await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'image/jpeg',
    cacheControl: IMAGE_CACHE_CONTROL,
  })
  return getDownloadURL(storageRef)
}

async function blobFromDataUrl(dataUrl: string, storagePath: string): Promise<Blob> {
  const rawBlob = dataUrlToBlob(dataUrl)
  const options = uploadOptionsForPath(storagePath)
  const file = new File([rawBlob], 'image', { type: rawBlob.type || 'image/jpeg' })
  return processImageFileToBlob(file, options)
}

export async function uploadDataUrl(dataUrl: string, storagePath: string): Promise<string> {
  if (!isFirebaseConfigured()) return dataUrl
  if (!isDataUrl(dataUrl)) return dataUrl
  const blob = await blobFromDataUrl(dataUrl, storagePath)
  return uploadBlob(storagePath, blob)
}

export async function uploadImageFromFile(
  file: File,
  storagePath: string,
  options: ProcessImageOptions = {},
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return processImageFile(file, options)
  }

  const blob = await processImageFileToBlob(file, options)
  return uploadBlob(storagePath, blob)
}

export interface GalleryImageVariants {
  feed: string
  full: string
}

/** Upload feed + lightbox variants for a gallery photo. */
export async function uploadGalleryImagePair(
  file: File,
  postId: string,
): Promise<GalleryImageVariants> {
  const id = crypto.randomUUID()
  const feedPath = `images/posts/${postId}/${id}-feed`
  const fullPath = `images/posts/${postId}/${id}-full`

  if (!isFirebaseConfigured()) {
    const [feed, full] = await Promise.all([
      processImageFile(file, feedUploadOptions()),
      processImageFile(file, fullUploadOptions()),
    ])
    return { feed, full }
  }

  const [feedBlob, fullBlob] = await Promise.all([
    processImageFileToBlob(file, feedUploadOptions()),
    processImageFileToBlob(file, fullUploadOptions()),
  ])
  const [feed, full] = await Promise.all([
    uploadBlob(feedPath, feedBlob),
    uploadBlob(fullPath, fullBlob),
  ])
  return { feed, full }
}

export async function resolveImageUrl(url: string, storagePath: string): Promise<string> {
  if (!isFirebaseConfigured() || !isDataUrl(url)) return url
  return uploadDataUrl(url, storagePath)
}

export async function deleteStorageImage(url: string): Promise<void> {
  if (!isFirebaseConfigured() || !isManagedStorageUrl(url)) return

  const path = storagePathFromDownloadUrl(url)
  if (!path) return

  try {
    await deleteObject(ref(getFirebaseStorage(), path))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'storage/object-not-found') return
    throw err
  }
}

export async function deleteStorageImages(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map((url) => deleteStorageImage(url)))
}
