import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { JourneyBlock, JourneyBlockLayout, JourneyPlanetPage, JourneySpaceIconKind, JourneyTextBlock } from '../../types'
import { uploadImageFromFile } from '../../services/imageUpload'
import {
  createCarouselBlock,
  createGoldTitleBlock,
  createImageBlock,
  createSpaceIconBlock,
  createTextBlock,
  createVideoBlock,
  getBlockBackgroundColor,
  getGlassBackground,
  JOURNEY_DEFAULT_BOX_COLOR,
  JOURNEY_FONT_OPTIONS,
  JOURNEY_PLANET_TYPES,
} from '../../utils/journey'
import { getYoutubeEmbedUrl } from '../../utils/youtube'
import { JourneyPlanetControls } from './JourneyPlanetControls'
import { JourneySpaceIcon, JOURNEY_SPACE_ICONS } from './JourneySpaceIcon'
import { JourneyTitle } from './JourneyTitle'
import {
  DraggableEditorPanel,
  defaultPinboardToolbarPosition,
  defaultPinInspectorPosition,
  defaultTextFormatToolbarPosition,
} from './DraggableEditorPanel'

interface JourneyPinboardProps {
  blocks: JourneyBlock[]
  onChange: (blocks: JourneyBlock[]) => void
  isEditMode: boolean
  /** When true, board fills the viewport (planet scrapbook mode) */
  fullscreen?: boolean
}

type DragMode = 'move' | 'resize' | null

export function JourneyPinboard({
  blocks,
  onChange,
  isEditMode,
  fullscreen = false,
}: JourneyPinboardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragMode, setDragMode] = useState<DragMode>(null)

  useEffect(() => {
    if (!isEditMode) {
      setSelectedId(null)
      setDragMode(null)
    }
  }, [isEditMode])
  const dragRef = useRef<{
    id: string
    mode: DragMode
    startX: number
    startY: number
    origin: JourneyBlockLayout
  } | null>(null)

  const updateBlock = (id: string, updated: JourneyBlock) => {
    onChange(blocks.map((b) => (b.id === id ? updated : b)))
  }

  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...blocks.map((b) => b.layout.zIndex))
    const block = blocks.find((b) => b.id === id)
    if (!block || block.layout.zIndex >= maxZ) return
    updateBlock(id, { ...block, layout: { ...block.layout, zIndex: maxZ + 1 } })
  }

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const addBlock = (type: JourneyBlock['type'] | 'gold-title') => {
    const index = blocks.length
    const block =
      type === 'gold-title'
        ? createGoldTitleBlock('OUR PREFECT JOURNEY', undefined)
        : type === 'text'
          ? createTextBlock('New note…', undefined, index)
          : type === 'image'
            ? createImageBlock('', undefined, index)
            : type === 'video'
              ? createVideoBlock('', undefined, index)
              : createCarouselBlock([], undefined, index)
    onChange([...blocks, block])
    setSelectedId(block.id)
  }

  const addSpaceIcon = (icon: JourneySpaceIconKind) => {
    const block = createSpaceIconBlock(icon, undefined, blocks.length)
    onChange([...blocks, block])
    setSelectedId(block.id)
  }

  const onPointerDown = (e: React.PointerEvent, id: string, mode: DragMode) => {
    if (!isEditMode || !mode) return
    e.preventDefault()
    e.stopPropagation()
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    bringToFront(id)
    setSelectedId(id)
    setDragMode(mode)
    dragRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...block.layout },
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current
      const board = boardRef.current
      if (!drag || !board || !drag.mode) return

      const rect = board.getBoundingClientRect()
      const dx = ((clientX - drag.startX) / rect.width) * 100
      const dy = ((clientY - drag.startY) / rect.height) * 100
      const block = blocks.find((b) => b.id === drag.id)
      if (!block) return

      if (drag.mode === 'move') {
        updateBlock(drag.id, {
          ...block,
          layout: {
            ...block.layout,
            x: Math.max(0, Math.min(100 - block.layout.width, drag.origin.x + dx)),
            y: Math.max(0, Math.min(100 - block.layout.height, drag.origin.y + dy)),
          },
        })
      } else if (drag.mode === 'resize') {
        const isText = block.type === 'text'
        const minSize = isText ? 1 : 12
        const maxSize = isText ? 100 : 90
        updateBlock(drag.id, {
          ...block,
          layout: {
            ...block.layout,
            width: Math.max(minSize, Math.min(maxSize, drag.origin.width + dx)),
            height: Math.max(minSize, Math.min(maxSize, drag.origin.height + dy)),
          },
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocks],
  )

  const onPointerMoveEvent = useCallback(
    (e: React.PointerEvent) => onPointerMove(e.clientX, e.clientY),
    [onPointerMove],
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
    setDragMode(null)
  }, [])

  useEffect(() => {
    if (dragMode === null) return
    const onMove = (e: PointerEvent) => onPointerMove(e.clientX, e.clientY)
    const onUp = () => onPointerUp()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragMode, onPointerMove, onPointerUp])

  const handleImageUpload = async (blockId: string, files: FileList | null, multi = false) => {
    if (!files?.length) return
    try {
      const urls = await Promise.all(
        Array.from(files)
          .slice(0, multi ? 8 : 1)
          .map((f) =>
            uploadImageFromFile(f, `images/journey/${blockId}/${crypto.randomUUID()}`, {
              maxWidth: 1400,
              maxHeight: 1000,
            }),
          ),
      )
      const block = blocks.find((b) => b.id === blockId)
      if (!block) return
      if (block.type === 'image') {
        updateBlock(blockId, { ...block, imageUrl: urls[0] })
      } else if (block.type === 'carousel') {
        updateBlock(blockId, { ...block, images: [...block.images, ...urls].slice(0, 12) })
      }
    } catch {
      window.alert('Could not process that image.')
    }
  }

  const selected = blocks.find((b) => b.id === selectedId) ?? null

  return (
    <div
      className={`journey-pinboard-wrap ${fullscreen ? 'journey-pinboard-wrap--fullscreen' : ''} ${isEditMode ? 'journey-pinboard-wrap--edit' : ''}`}
      onPointerDown={(e) => isEditMode && e.stopPropagation()}
      onClick={(e) => isEditMode && e.stopPropagation()}
    >
      {isEditMode && (
        <DraggableEditorPanel
          id="journey-pinboard-toolbar"
          className="journey-pinboard__toolbar-wrap"
          defaultPosition={defaultPinboardToolbarPosition}
          zIndex={112}
        >
          <div className="journey-pinboard__toolbar">
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => addBlock('gold-title')}
          >
            + Gold title
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => addBlock('text')}>
            + Text
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => addBlock('image')}>
            + Photo
          </button>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => addBlock('carousel')}
          >
            + Carousel
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => addBlock('video')}>
            + YouTube
          </button>
          {JOURNEY_SPACE_ICONS.map(({ kind, label, emoji }) => (
            <button
              key={kind}
              type="button"
              className="btn-secondary btn-small journey-pinboard__icon-btn"
              onClick={() => addSpaceIcon(kind)}
              title={`Add ${label}`}
            >
              {emoji}
            </button>
          ))}
          {selected && (
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removeBlock(selected.id)}
            >
              Delete
            </button>
          )}
          </div>
        </DraggableEditorPanel>
      )}

      <div
        ref={boardRef}
        className={`journey-pinboard ${isEditMode ? 'journey-pinboard--edit' : ''} ${fullscreen ? 'journey-pinboard--fullscreen' : ''}`}
        onPointerMove={onPointerMoveEvent}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedId(null)
          }
        }}
      >
        {blocks.map((block) => (
          <PinCard
            key={block.id}
            block={block}
            selected={isEditMode && selectedId === block.id}
            isEditMode={isEditMode}
            dragging={dragMode !== null && selectedId === block.id}
            onSelect={() => {
              setSelectedId(block.id)
              bringToFront(block.id)
            }}
            onMoveStart={(e) => onPointerDown(e, block.id, 'move')}
            onResizeStart={(e) => onPointerDown(e, block.id, 'resize')}
            onChange={(updated) => updateBlock(block.id, updated)}
            onUpload={(files, multi) => void handleImageUpload(block.id, files, multi)}
          />
        ))}

        {!blocks.length && isEditMode && (
          <p className="journey-pinboard__empty">
            Drag pins across the whole screen — add text, photos, carousels, or YouTube.
          </p>
        )}
      </div>

      {isEditMode && selected && (
        <DraggableEditorPanel
          id="journey-pin-inspector"
          className="journey-pin-inspector-wrap"
          defaultPosition={defaultPinInspectorPosition}
          zIndex={112}
        >
          <PinInspector
            block={selected}
            onChange={(updated) => updateBlock(selected.id, updated)}
            onUpload={(files, multi) => void handleImageUpload(selected.id, files, multi)}
          />
        </DraggableEditorPanel>
      )}

      {isEditMode && selected?.type === 'text' && (
        <DraggableEditorPanel
          id="journey-text-format-toolbar"
          className="journey-text-toolbar-wrap"
          defaultPosition={defaultTextFormatToolbarPosition}
          zIndex={113}
        >
          <TextFormatToolbar
            block={selected}
            onChange={(updated) => updateBlock(selected.id, updated)}
          />
        </DraggableEditorPanel>
      )}
    </div>
  )
}

function PinCard({
  block,
  selected,
  isEditMode,
  dragging,
  onSelect,
  onMoveStart,
  onResizeStart,
  onChange,
  onUpload,
}: {
  block: JourneyBlock
  selected: boolean
  isEditMode: boolean
  dragging: boolean
  onSelect: () => void
  onMoveStart: (e: React.PointerEvent) => void
  onResizeStart: (e: React.PointerEvent) => void
  onChange: (block: JourneyBlock) => void
  onUpload: (files: FileList | null, multi?: boolean) => void
}) {
  const [iconActive, setIconActive] = useState(false)
  const embed = block.type === 'video' ? getYoutubeEmbedUrl(block.youtubeUrl) : null
  const isGoldTitle = block.type === 'text' && block.variant === 'gold-title'
  const isTransparent = block.type === 'text' && block.backgroundColor === 'transparent'
  const hasBg =
    block.type === 'text' &&
    block.backgroundColor &&
    block.backgroundColor !== 'transparent'
  const useGlass = block.type === 'text' && hasBg
  const bg =
    block.type === 'text'
      ? isTransparent || (isGoldTitle && !hasBg)
        ? undefined
        : getGlassBackground(block.backgroundColor)
      : block.type === 'space-icon'
        ? undefined
        : getBlockBackgroundColor(block)

  const textStyle =
    block.type === 'text'
      ? {
          color: block.textColor,
          fontSize: block.fontSize ?? (isGoldTitle ? 42 : 15),
          textAlign: block.textAlign,
          fontFamily: block.fontFamily || undefined,
          fontWeight: block.fontWeight,
          fontStyle: block.fontStyle,
        }
      : undefined

  return (
    <div
      className={`journey-pin-shell ${selected ? 'journey-pin-shell--selected' : ''} ${dragging ? 'journey-pin-shell--dragging' : ''} ${isGoldTitle ? 'journey-pin-shell--gold' : ''}`}
      style={{
        left: `${block.layout.x}%`,
        top: `${block.layout.y}%`,
        width: `${block.layout.width}%`,
        height: `${block.layout.height}%`,
        zIndex: block.layout.zIndex + 10,
        transform: `rotate(${block.layout.rotation ?? 0}deg)`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (isEditMode) onSelect()
      }}
    >
      <article
        className={`journey-pin ${selected && !isTransparent && !isGoldTitle ? 'journey-pin--selected' : ''} ${isGoldTitle ? 'journey-pin--gold-title' : ''} ${hasBg ? 'journey-pin--has-bg' : ''} ${useGlass ? 'journey-pin--glass' : ''} ${isTransparent || isGoldTitle ? 'journey-pin--transparent' : ''} journey-pin--${block.type} ${block.type === 'space-icon' ? 'journey-pin--space-icon' : ''}`}
        style={{
          background: bg,
          backdropFilter: useGlass ? 'blur(14px) saturate(1.35)' : undefined,
          WebkitBackdropFilter: useGlass ? 'blur(14px) saturate(1.35)' : undefined,
        } as React.CSSProperties}
      >
      {isEditMode && !isGoldTitle && (
        <button
          type="button"
          className="journey-pin__drag"
          onPointerDown={onMoveStart}
          aria-label="Move pin"
        >
          ⠿
        </button>
      )}

      {block.type === 'text' && isGoldTitle && (
        <div className="journey-pin__gold-title">
          <JourneyTitle
            title={block.content}
            isEditMode={isEditMode}
            onChange={(content) => onChange({ ...block, content })}
            style={textStyle}
            inPinboard
          />
        </div>
      )}

      {block.type === 'text' && !isGoldTitle && (
        <div className="journey-pin__text" style={textStyle}>
          {isEditMode ? (
            <textarea
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Write…"
              style={{ fontSize: textStyle?.fontSize }}
            />
          ) : (
            <p style={{ fontSize: textStyle?.fontSize }}>{block.content}</p>
          )}
        </div>
      )}

      {block.type === 'image' && (
        <figure className="journey-pin__figure">
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt={block.caption || ''}
              style={{ objectFit: block.objectFit ?? 'cover' }}
            />
          ) : (
            <div className="journey-pin__placeholder">
              {isEditMode ? (
                <label className="btn-secondary btn-small">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => onUpload(e.target.files)}
                  />
                </label>
              ) : (
                'No image'
              )}
            </div>
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )}

      {block.type === 'carousel' && (
        <CarouselPin block={block} isEditMode={isEditMode} onChange={onChange} onUpload={onUpload} />
      )}

      {block.type === 'video' && (
        <div className="journey-pin__video">
          {embed ? (
            <iframe
              src={embed}
              title={block.title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="journey-pin__placeholder journey-pin__placeholder--video">
              {isEditMode ? (
                <div className="journey-pin__video-setup">
                  <span className="journey-pin__video-icon" aria-hidden>
                    ▶
                  </span>
                  <p>Paste a YouTube link in the inspector below</p>
                  <input
                    className="edit-input"
                    value={block.youtubeUrl}
                    onChange={(e) => onChange({ ...block, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=…"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                'Video coming soon'
              )}
            </div>
          )}
          {block.title && <p className="journey-pin__video-title">{block.title}</p>}
        </div>
      )}

      {block.type === 'space-icon' && (
        <div className="journey-pin__space-icon-wrap">
          <JourneySpaceIcon
            kind={block.icon}
            active={iconActive}
            onClick={() => {
              if (!isEditMode) {
                setIconActive(true)
                window.setTimeout(() => setIconActive(false), 1200)
              }
            }}
          />
        </div>
      )}

      {isEditMode && selected && !isGoldTitle && (
        <button
          type="button"
          className="journey-pin__resize"
          onPointerDown={onResizeStart}
          aria-label="Resize pin"
        />
      )}
      </article>

      {isEditMode && selected && isGoldTitle && (
        <>
          <button
            type="button"
            className="journey-pin__corner-move"
            onPointerDown={onMoveStart}
            aria-label="Move pin"
          >
            ⠿
          </button>
          <button
            type="button"
            className="journey-pin__corner-resize"
            onPointerDown={onResizeStart}
            aria-label="Resize pin"
          />
        </>
      )}
    </div>
  )
}

function TextFormatToolbar({
  block,
  onChange,
}: {
  block: JourneyTextBlock
  onChange: (block: JourneyBlock) => void
}) {
  const isGoldTitle = block.variant === 'gold-title'
  const fontSize = block.fontSize ?? (isGoldTitle ? 42 : 15)

  return (
    <div
      className="journey-pin-shell__toolbar journey-pin-shell__toolbar--text"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={block.fontFamily ?? ''}
        onChange={(e) => onChange({ ...block, fontFamily: e.target.value })}
        aria-label="Font"
      >
        {JOURNEY_FONT_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={`journey-pin-inspector__fmt ${block.fontWeight === 'bold' ? 'is-active' : ''}`}
        onClick={() =>
          onChange({
            ...block,
            fontWeight: block.fontWeight === 'bold' ? 'normal' : 'bold',
          })
        }
        aria-label="Bold"
      >
        B
      </button>
      <button
        type="button"
        className={`journey-pin-inspector__fmt ${block.fontStyle === 'italic' ? 'is-active' : ''}`}
        onClick={() =>
          onChange({
            ...block,
            fontStyle: block.fontStyle === 'italic' ? 'normal' : 'italic',
          })
        }
        aria-label="Italic"
      >
        I
      </button>
      <button
        type="button"
        className={`journey-pin-inspector__fmt ${isGoldTitle ? 'is-active' : ''}`}
        onClick={() =>
          onChange({
            ...block,
            variant: isGoldTitle ? 'plain' : 'gold-title',
            backgroundColor: isGoldTitle ? JOURNEY_DEFAULT_BOX_COLOR : 'transparent',
          })
        }
        aria-label="Gold title style"
        title="Gold title style"
      >
        ✦
      </button>
      <label className="journey-pin__text-toolbar-size">
        <span className="journey-pin__text-toolbar-label">Size</span>
        <input
          type="number"
          min={1}
          step={1}
          value={fontSize}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (!Number.isFinite(next) || next <= 0) return
            onChange({ ...block, fontSize: next })
          }}
          aria-label="Font size"
        />
      </label>
      <span className="journey-pin__text-toolbar-label">Text</span>
      <input
        type="color"
        value={toHex(block.textColor ?? '#f5f0e8')}
        onChange={(e) => onChange({ ...block, textColor: e.target.value })}
        aria-label="Text colour"
        title="Text colour"
      />
      <span className="journey-pin__text-toolbar-label">Box</span>
      <button
        type="button"
        className={`journey-pin-inspector__fmt ${block.backgroundColor === 'transparent' ? 'is-active' : ''}`}
        onClick={() =>
          onChange({
            ...block,
            backgroundColor:
              block.backgroundColor === 'transparent'
                ? JOURNEY_DEFAULT_BOX_COLOR
                : 'transparent',
          })
        }
        aria-label="Transparent box"
        title="Transparent box"
      >
        ∅
      </button>
      <input
        type="color"
        value={toHex(block.backgroundColor ?? '#0c1024')}
        disabled={block.backgroundColor === 'transparent'}
        onChange={(e) => onChange({ ...block, backgroundColor: e.target.value })}
        aria-label="Box colour"
        title="Box colour"
      />
      <select
        value={block.textAlign ?? 'left'}
        onChange={(e) =>
          onChange({
            ...block,
            textAlign: e.target.value as 'left' | 'center' | 'right',
          })
        }
        aria-label="Align"
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
    </div>
  )
}

function CarouselPin({
  block,
  isEditMode,
  onUpload,
}: {
  block: Extract<JourneyBlock, { type: 'carousel' }>
  isEditMode: boolean
  onChange: (block: JourneyBlock) => void
  onUpload: (files: FileList | null, multi?: boolean) => void
}) {
  const [slide, setSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const count = block.images.length
  const current = count ? slide % count : 0

  const go = (next: number) => {
    if (count <= 1) return
    setDirection(next > current ? 1 : -1)
    setSlide((next + count) % count)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start || count <= 1) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 36) {
      go(dx < 0 ? current + 1 : current - 1)
    }
    touchRef.current = null
  }

  return (
    <figure className="journey-pin__carousel">
      <div
        className="journey-pin__carousel-frame"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {count ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={current}
              src={block.images[current]}
              alt={block.caption || ''}
              className="journey-pin__carousel-slide"
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: `${dir >= 0 ? 100 : -100}%`, opacity: 0.4 }),
                center: { x: '0%', opacity: 1 },
                exit: (dir: number) => ({ x: `${dir >= 0 ? -100 : 100}%`, opacity: 0.4 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
            />
          </AnimatePresence>
        ) : (
          <div className="journey-pin__placeholder">
            {isEditMode ? (
              <label className="btn-secondary btn-small">
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => onUpload(e.target.files, true)}
                />
              </label>
            ) : (
              'Empty carousel'
            )}
          </div>
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              className="journey-pin__carousel-nav journey-pin__carousel-nav--prev"
              onClick={(e) => {
                e.stopPropagation()
                go(current - 1)
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="journey-pin__carousel-nav journey-pin__carousel-nav--next"
              onClick={(e) => {
                e.stopPropagation()
                go(current + 1)
              }}
            >
              ›
            </button>
            <div className="journey-pin__carousel-dots">
              {block.images.map((_, i) => (
                <span key={i} className={i === current ? 'is-active' : ''} />
              ))}
            </div>
          </>
        )}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  )
}

function PinInspector({
  block,
  onChange,
  onUpload,
}: {
  block: JourneyBlock
  onChange: (block: JourneyBlock) => void
  onUpload: (files: FileList | null, multi?: boolean) => void
}) {
  const embed = block.type === 'video' ? getYoutubeEmbedUrl(block.youtubeUrl) : null

  return (
    <div className="journey-pin-inspector" onClick={(e) => e.stopPropagation()}>
      <p className="journey-pin-inspector__title">Edit {block.type} pin</p>

      {block.type === 'text' && (
        <>
          <label>
            Style
            <select
              className="edit-input"
              value={block.variant ?? 'plain'}
              onChange={(e) =>
                onChange({
                  ...block,
                  variant: e.target.value as JourneyTextBlock['variant'],
                  backgroundColor:
                    e.target.value === 'gold-title' ? 'transparent' : block.backgroundColor,
                })
              }
            >
              <option value="plain">Plain text</option>
              <option value="gold-title">Gold title</option>
            </select>
          </label>
          <div className="journey-pin-inspector__format-row">
            <button
              type="button"
              className={`journey-pin-inspector__fmt ${block.fontWeight === 'bold' ? 'is-active' : ''}`}
              onClick={() =>
                onChange({
                  ...block,
                  fontWeight: block.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
            >
              B
            </button>
            <button
              type="button"
              className={`journey-pin-inspector__fmt ${block.fontStyle === 'italic' ? 'is-active' : ''}`}
              onClick={() =>
                onChange({
                  ...block,
                  fontStyle: block.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
            >
              I
            </button>
          </div>
          <label>
            Font
            <select
              className="edit-input"
              value={block.fontFamily ?? ''}
              onChange={(e) => onChange({ ...block, fontFamily: e.target.value })}
            >
              {JOURNEY_FONT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Text colour
            <input
              type="color"
              value={toHex(block.textColor ?? '#f5f0e8')}
              onChange={(e) => onChange({ ...block, textColor: e.target.value })}
            />
          </label>
          <label>
            Box colour
            <div className="journey-pin-inspector__color-row">
              <button
                type="button"
                className={`journey-pin-inspector__fmt ${block.backgroundColor === 'transparent' ? 'is-active' : ''}`}
                onClick={() =>
                  onChange({
                    ...block,
                    backgroundColor:
                      block.backgroundColor === 'transparent'
                        ? JOURNEY_DEFAULT_BOX_COLOR
                        : 'transparent',
                  })
                }
              >
                Transparent
              </button>
              <input
                type="color"
                value={toHex(block.backgroundColor ?? '#0c1024')}
                disabled={block.backgroundColor === 'transparent'}
                onChange={(e) => onChange({ ...block, backgroundColor: e.target.value })}
              />
            </div>
          </label>
          <label>
            Align
            <select
              className="edit-input"
              value={block.textAlign ?? 'left'}
              onChange={(e) =>
                onChange({
                  ...block,
                  textAlign: e.target.value as 'left' | 'center' | 'right',
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label>
            Font size
            <input
              type="number"
              className="edit-input"
              min={1}
              step={1}
              value={block.fontSize ?? (block.variant === 'gold-title' ? 42 : 15)}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isFinite(next) && next > 0) onChange({ ...block, fontSize: next })
              }}
            />
            <span className="journey-pin-inspector__size-value">
              {block.fontSize ?? (block.variant === 'gold-title' ? 42 : 15)}px
            </span>
          </label>
        </>
      )}

      {block.type === 'image' && (
        <>
          <input
            className="edit-input"
            value={block.imageUrl}
            onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
            placeholder="Image URL"
          />
          <label className="btn-secondary btn-small">
            Upload
            <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files)} />
          </label>
          <input
            className="edit-input"
            value={block.caption ?? ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption"
          />
          <label>
            Fit
            <select
              className="edit-input"
              value={block.objectFit ?? 'cover'}
              onChange={(e) =>
                onChange({ ...block, objectFit: e.target.value as 'cover' | 'contain' })
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </label>
        </>
      )}

      {block.type === 'carousel' && (
        <>
          <label className="btn-secondary btn-small">
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onUpload(e.target.files, true)}
            />
          </label>
          <input
            className="edit-input"
            value={block.caption ?? ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption"
          />
          <p className="journey-pin-inspector__hint">{block.images.length} photo(s)</p>
          {block.images.length > 0 && (
            <button
              type="button"
              className="btn-ghost btn-small"
              onClick={() => onChange({ ...block, images: block.images.slice(0, -1) })}
            >
              Remove last
            </button>
          )}
        </>
      )}

      {block.type === 'video' && (
        <div className="journey-pin-inspector__youtube">
          <label>
            YouTube link
            <input
              className="edit-input"
              value={block.youtubeUrl}
              onChange={(e) => onChange({ ...block, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </label>
          {embed ? (
            <p className="journey-pin-inspector__hint journey-pin-inspector__hint--ok">
              Video linked — preview on the pin
            </p>
          ) : block.youtubeUrl.trim() ? (
            <p className="journey-pin-inspector__hint journey-pin-inspector__hint--warn">
              Could not read that URL — try a full youtube.com or youtu.be link
            </p>
          ) : (
            <p className="journey-pin-inspector__hint">
              Paste any YouTube watch or share link
            </p>
          )}
          <label>
            Title (optional)
            <input
              className="edit-input"
              value={block.title ?? ''}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Video title"
            />
          </label>
        </div>
      )}

      {(block.type === 'image' || block.type === 'carousel' || block.type === 'video') && (
        <label>
          Box colour
          <input
            type="color"
            value={toHex(getBlockBackgroundColor(block) ?? '#0c1024')}
            onChange={(e) => onChange({ ...block, backgroundColor: e.target.value } as JourneyBlock)}
          />
        </label>
      )}

      {block.type === 'space-icon' && (
        <label>
          Icon
          <select
            className="edit-input"
            value={block.icon}
            onChange={(e) =>
              onChange({ ...block, icon: e.target.value as JourneySpaceIconKind })
            }
          >
            {JOURNEY_SPACE_ICONS.map(({ kind, label }) => (
              <option key={kind} value={kind}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Rotate
        <input
          type="range"
          min={-15}
          max={15}
          value={block.layout.rotation ?? 0}
          onChange={(e) =>
            onChange({
              ...block,
              layout: { ...block.layout, rotation: Number(e.target.value) },
            })
          }
        />
      </label>
    </div>
  )
}

function toHex(color: string): string {
  if (color.startsWith('#') && color.length >= 7) return color.slice(0, 7)
  if (color.startsWith('rgba')) return '#0c1024'
  return '#0c1024'
}

export function JourneyPlanetEditor({
  planet,
  onChange,
  onDelete,
}: {
  planet: JourneyPlanetPage
  onChange: (planet: JourneyPlanetPage) => void
  onDelete?: () => void
}) {
  return (
    <JourneyPlanetControls
      planetY={planet.planetY}
      planetSize={planet.planetSize}
      onPlanetYChange={(planetY) => onChange({ ...planet, planetY })}
      onPlanetSizeChange={(planetSize) => onChange({ ...planet, planetSize })}
      name={planet.name}
      planetColor={planet.planetColor}
      planetType={planet.planetType}
      onNameChange={(name) => onChange({ ...planet, name })}
      onColorChange={(planetColor) => onChange({ ...planet, planetColor })}
      onTypeChange={(planetType) =>
        onChange({ ...planet, planetType: planetType as JourneyPlanetPage['planetType'] })
      }
      typeOptions={JOURNEY_PLANET_TYPES}
      onDelete={onDelete}
    />
  )
}
