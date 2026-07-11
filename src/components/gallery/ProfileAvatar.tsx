interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'profile-avatar--sm',
  md: 'profile-avatar--md',
  lg: 'profile-avatar--lg',
}

export function ProfileAvatar({ size = 'sm', className = '' }: ProfileAvatarProps) {
  return (
    <div
      className={`profile-avatar ${sizes[size]} ${className}`}
      aria-hidden
    >
      <span className="profile-avatar__emoji">🚌</span>
    </div>
  )
}
