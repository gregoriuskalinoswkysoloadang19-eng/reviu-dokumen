import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MetadataChip({
  icon: Icon, label, className,
}: { icon?: LucideIcon; label: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md bg-surface-sunken px-2 py-1 text-[11px] font-medium text-ink-secondary', className)}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
      {label}
    </span>
  )
}
