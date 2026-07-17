import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '../lib/firebase'
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

async function uploadBlob(storagePath: string, blob: Blob): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), storagePath)
  await uploadBytes(storageRef, blob, { contentType: blob.type || 'image/jpeg' })
  return getDownloadURL(storageRef)
}

export async function uploadDataUrl(dataUrl: string, storagePath: string): Promise<string> {
  if (!isFirebaseConfigured()) return dataUrl
  if (!isDataUrl(dataUrl)) return dataUrl
  const blob = dataUrlToBlob(dataUrl)
  const ext = extensionForMime(blob.type)
  const path = storagePath.includes('.') ? storagePath : `${storagePath}.${ext}`
  return uploadBlob(path, blob)
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
  const ext = extensionForMime(blob.type)
  const path = storagePath.includes('.') ? storagePath : `${storagePath}.${ext}`
  return uploadBlob(path, blob)
}

export async function resolveImageUrl(url: string, storagePath: string): Promise<string> {
  if (!isFirebaseConfigured() || !isDataUrl(url)) return url
  return uploadDataUrl(url, storagePath)
}
