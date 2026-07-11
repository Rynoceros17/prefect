import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { PostAspectRatio, PostImageMeta } from '../../types'
import { clampMeta, computePanLimits, getImageTransform, normalizePanValue } from '../../utils/cropBounds'

interface CroppedImageProps {
  src: string
  meta: PostImageMeta
  aspectRatio: PostAspectRatio
  interactive?: boolean
  onMetaChange?: (meta: PostImageMeta) => void
  className?: string
}

export function CroppedImage({
  src,
  meta,
  aspectRatio,
  interactive = false,
  onMetaChange,
  className = '',
}: CroppedImageProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 })
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const normalizedMeta: PostImageMeta = {
    panX: normalizePanValue(meta.panX),
    panY: normalizePanValue(meta.panY),
    zoom: Math.max(1, meta.zoom),
  }

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const measure = () => {
      setFrameSize({ w: frame.clientWidth, h: frame.clientHeight })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [aspectRatio])

  const transform =
    frameSize.w > 0 && imgSize.w > 0
      ? getImageTransform(frameSize.w, frameSize.h, imgSize.w, imgSize.h, normalizedMeta)
      : null

  useLayoutEffect(() => {
    if (!onMetaChange || !transform) return
    const { clamped } = transform
    if (
      clamped.panX !== normalizedMeta.panX ||
      clamped.panY !== normalizedMeta.panY
    ) {
      onMetaChange({ ...normalizedMeta, panX: clamped.panX, panY: clamped.panY })
    }
  }, [
    onMetaChange,
    transform,
    normalizedMeta.panX,
    normalizedMeta.panY,
    normalizedMeta.zoom,
  ])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || !onMetaChange || !transform) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: transform.clamped.panX,
        panY: transform.clamped.panY,
      }
    },
    [interactive, onMetaChange, transform],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !onMetaChange || !transform) return
      const dx = e.clientX - dragRef.current.x
      const dy = e.clientY - dragRef.current.y
      const { limits } = transform

      const next: PostImageMeta = {
        ...normalizedMeta,
        panX:
          limits.maxPanX > 0
            ? dragRef.current.panX + dx / limits.maxPanX
            : 0,
        panY:
          limits.maxPanY > 0
            ? dragRef.current.panY + dy / limits.maxPanY
            : 0,
      }

      onMetaChange(clampMeta(next, limits))
    },
    [normalizedMeta, onMetaChange, transform],
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <div
      ref={frameRef}
      className={`cropped-image-frame ${interactive ? 'cropped-image-frame--interactive' : ''} ${className}`}
      style={{ aspectRatio }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={src}
        alt=""
        className="cropped-image__img"
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget
          setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
        }}
        style={
          transform
            ? {
                width: transform.width,
                height: transform.height,
                transform: transform.transform,
              }
            : undefined
        }
      />
    </div>
  )
}

export function clampMetaForFrame(
  meta: PostImageMeta,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
): PostImageMeta {
  const normalized: PostImageMeta = {
    panX: normalizePanValue(meta.panX),
    panY: normalizePanValue(meta.panY),
    zoom: Math.max(1, meta.zoom),
  }
  const limits = computePanLimits(frameW, frameH, imgW, imgH, normalized.zoom)
  return clampMeta(normalized, limits)
}
