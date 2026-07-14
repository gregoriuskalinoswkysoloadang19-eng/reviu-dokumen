import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneClass: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40',
  success: 'bg-success-subtle text-success-strong',
  warning: 'bg-warning-subtle text-warning-strong',
  danger: 'bg-danger-subtle text-danger-strong',
  info: 'bg-info-subtle text-info-strong',
  neutral: 'bg-surface-sunken text-ink-secondary',
}

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: Tone
  description?: string
  trend?: { value: number; label?: string } // value in %, positive = up
  href?: string
  loading?: boolean
}

export default function StatCard({
  label, value, icon: Icon, tone = 'brand', description, trend, href, loading,
}: StatCardProps) {
  const Wrapper = href ? 'a' : 'div'

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface-raised shadow-soft-sm p-5">
        <div className="skeleton h-9 w-9 rounded-lg mb-4" />
        <div className="skeleton h-6 w-16 rounded mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    )
  }

  const trendUp = (trend?.value ?? 0) > 0
  const trendFlat = (trend?.value ?? 0) === 0

  return (
    <Wrapper
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-surface-raised shadow-soft-sm p-5',
        'transition-all duration-250 hover:-translate-y-0.5 hover:shadow-soft-md hover:border-border-strong',
        href && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-250 group-hover:scale-110', toneClass[tone])}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              trendFlat ? 'bg-surface-sunken text-ink-tertiary'
                : trendUp ? 'bg-success-subtle text-success-strong' : 'bg-danger-subtle text-danger-strong'
            )}
          >
            {trendFlat ? <Minus className="h-3 w-3" /> : trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="font-display text-2xl font-semibold text-ink-primary leading-none">{value}</p>
        <p className="mt-1.5 text-xs font-medium text-ink-secondary">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-ink-tertiary">{description}</p>}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-x-100" />
    </Wrapper>
  )
}
