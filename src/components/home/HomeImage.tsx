type HomeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Above-the-fold hero images load eagerly at high priority. */
  priority?: boolean
}

export function HomeImage({
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
  alt = '',
  ...props
}: HomeImageProps) {
  return (
    <img
      alt={alt}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={priority ? 'high' : fetchPriority}
      {...props}
    />
  )
}
