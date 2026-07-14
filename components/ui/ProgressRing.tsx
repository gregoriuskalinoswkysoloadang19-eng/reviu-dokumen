import { cn } from '@/lib/utils'

type Props = {
  value: number // 0–100
  size?: number
  strokeWidth?: number
  color?: string
  trackClassName?: string
  label?: React.ReactNode
  sublabel?: React.ReactNode
  className?: string
}

/**
 * Circular progress indicator used across the Dashboard and Reviewer
 * Workspace to show document / workflow completion at a glance.
 * Pure SVG + CSS transition — no animation library dependency required,
 * so it stays lightweight even when several render on one screen.
 */
export default function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color = '#2b60ea',
  trackClassName,
  label,
  sublabel,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn('stroke-surface-sunken', trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label !== undefined ? label : <span className="text-lg font-display font-bold text-ink-primary">{clamped}%</span>}
        {sublabel && <span className="text-[10px] text-ink-tertiary mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
