import type { PostImageMeta } from '../types'

export interface PanLimits {
  maxPanX: number
  maxPanY: number
}

export function computePanLimits(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  zoom: number,
): PanLimits {
  if (frameW <= 0 || frameH <= 0 || imgW <= 0 || imgH <= 0) {
    return { maxPanX: 0, maxPanY: 0 }
  }

  const coverScale = Math.max(frameW / imgW, frameH / imgH) * Math.max(1, zoom)
  const scaledW = imgW * coverScale
  const scaledH = imgH * coverScale

  return {
    maxPanX: Math.max(0, (scaledW - frameW) / 2),
    maxPanY: Math.max(0, (scaledH - frameH) / 2),
  }
}

export function clampMeta(meta: PostImageMeta, limits: PanLimits): PostImageMeta {
  return {
    zoom: Math.max(1, meta.zoom),
    panX: limits.maxPanX > 0 ? Math.max(-1, Math.min(1, meta.panX)) : 0,
    panY: limits.maxPanY > 0 ? Math.max(-1, Math.min(1, meta.panY)) : 0,
  }
}

export function getCoverDimensions(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  zoom: number,
) {
  const coverScale = Math.max(frameW / imgW, frameH / imgH) * Math.max(1, zoom)
  return {
    width: imgW * coverScale,
    height: imgH * coverScale,
  }
}

export function getImageTransform(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  meta: PostImageMeta,
) {
  const limits = computePanLimits(frameW, frameH, imgW, imgH, meta.zoom)
  const clamped = clampMeta(meta, limits)
  const { width, height } = getCoverDimensions(frameW, frameH, imgW, imgH, clamped.zoom)
  const offsetX = clamped.panX * limits.maxPanX
  const offsetY = clamped.panY * limits.maxPanY

  return {
    width,
    height,
    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
    limits,
    clamped,
  }
}

/** Migrate legacy percent pan values (±40) to normalized ±1. */
export function normalizePanValue(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 0
  if (Math.abs(value) > 1) {
    return Math.max(-1, Math.min(1, value / 40))
  }
  return Math.max(-1, Math.min(1, value))
}
