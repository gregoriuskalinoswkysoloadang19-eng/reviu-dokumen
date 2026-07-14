import { cn } from '@/lib/utils'

export default function ProgressBar({
  value,
  color,
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-surface-sunken overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped}%`, background: color || 'linear-gradient(90deg, #2b60ea, #17b271)' }}
      />
    </div>
  )
}
