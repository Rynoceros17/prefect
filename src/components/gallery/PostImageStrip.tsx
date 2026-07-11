import type { PostImageMeta } from '../../types'

import { CroppedImage } from './CroppedImage'

interface PostImageStripProps {
  images: string[]
  imageMeta: PostImageMeta[]
  onReorder: (from: number, to: number) => void
  onCrop: (index: number) => void
  onRemove: (index: number) => void
}

export function PostImageStrip({
  images,
  imageMeta,
  onReorder,
  onCrop,
  onRemove,
}: PostImageStripProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <div className="post-image-strip">
      <p className="post-image-strip__label">Drag to reorder photos</p>
      <div className="post-image-strip__list">
        {images.map((src, index) => (
          <div
            key={`${src.slice(0, 32)}-${index}`}
            className="post-image-strip__item"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="post-image-strip__thumb-wrap">
              <CroppedImage
                src={src}
                meta={imageMeta[index]}
                aspectRatio="1"
                className="post-image-strip__crop"
              />
            </div>
            <span className="post-image-strip__index">{index + 1}</span>
            <div className="post-image-strip__item-actions">
              <button type="button" className="btn-ghost btn-small" onClick={() => onCrop(index)}>
                Crop
              </button>
              <button type="button" className="btn-ghost btn-small" onClick={() => onRemove(index)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
