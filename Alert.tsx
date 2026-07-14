import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

const sizeClass = { sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' }

export default function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string
  src?: string | null
  size?: keyof typeof sizeClass
  className?: string
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'U'

  return (
    <RadixAvatar.Root className={cn('inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-accent-500 text-white font-semibold flex-shrink-0', sizeClass[size], className)}>
      {src && <RadixAvatar.Image src={src} alt={name} className="w-full h-full object-cover" />}
      <RadixAvatar.Fallback delayMs={src ? 400 : 0}>{initials}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}
