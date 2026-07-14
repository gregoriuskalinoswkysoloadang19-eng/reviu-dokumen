import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
      <div className="w-14 h-14 rounded-2xl bg-surface-sunken flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ink-tertiary" />
      </div>
      <p className="font-display font-semibold text-ink-primary text-sm">{title}</p>
      {description && <p className="text-xs text-ink-tertiary mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
