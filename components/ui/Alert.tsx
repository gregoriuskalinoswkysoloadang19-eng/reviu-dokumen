import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'info'

const config: Record<Tone, { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle2, className: 'bg-success-subtle border-success/20 text-success-strong' },
  warning: { icon: AlertTriangle, className: 'bg-warning-subtle border-warning/20 text-warning-strong' },
  danger: { icon: XCircle, className: 'bg-danger-subtle border-danger/20 text-danger-strong' },
  info: { icon: Info, className: 'bg-info-subtle border-info/20 text-info-strong' },
}

export default function Alert({
  tone = 'info',
  title,
  className,
  children,
}: {
  tone?: Tone
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const { icon: Icon, className: toneClass } = config[tone]
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border p-3.5 text-sm', toneClass, className)} role="alert">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="text-[13px] opacity-90">{children}</div>}
      </div>
    </div>
  )
}
