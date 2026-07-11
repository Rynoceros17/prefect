import { useState } from 'react'
import { ModalPortal } from '../ModalPortal'
import { useScrollLock } from '../../hooks/useScrollLock'
import type { PostAspectRatio, PostImageMeta } from '../../types'
import { normalizePanValue } from '../../utils/cropBounds'
import { CroppedImage } from './CroppedImage'

interface ImageCropEditorProps {
  imageUrl: string
  aspectRatio: PostAspectRatio
  meta: PostImageMeta
  onSave: (meta: PostImageMeta) => void
  onClose: () => void
}

export function ImageCropEditor({
  imageUrl,
  aspectRatio,
  meta,
  onSave,
  onClose,
}: ImageCropEditorProps) {
  const [draft, setDraft] = useState<PostImageMeta>({
    panX: normalizePanValue(meta.panX),
    panY: normalizePanValue(meta.panY),
    zoom: Math.max(1, meta.zoom),
  })

  useScrollLock(true)

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  return (
    <ModalPortal>
      <div
        className="crop-editor-overlay"
      onClick={onClose}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="crop-editor" onClick={(e) => e.stopPropagation()}>
        <h3 className="crop-editor__title">Crop & position</h3>
        <p className="crop-editor__hint">Drag to reposition · zoom to crop tighter</p>

        <CroppedImage
          src={imageUrl}
          meta={draft}
          aspectRatio={aspectRatio}
          interactive
          onMetaChange={setDraft}
          className="crop-editor__frame"
        />

        <label className="crop-editor__slider-label">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={draft.zoom}
            onChange={(e) => setDraft((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
          />
        </label>

        <div className="crop-editor__actions">
          <button type="button" className="btn-ghost btn-small" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => setDraft({ panX: 0, panY: 0, zoom: 1 })}
          >
            Reset
          </button>
          <button type="button" className="btn-primary btn-small" onClick={handleSave}>
            Apply
          </button>
        </div>
      </div>
      </div>
    </ModalPortal>
  )
}
