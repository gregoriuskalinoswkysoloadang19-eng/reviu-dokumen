import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:
    'text-white shadow-soft-sm bg-gradient-to-br from-brand-500 to-accent-500 hover:brightness-105 hover:shadow-soft-md',
  secondary:
    'bg-surface-raised text-ink-primary border border-border hover:bg-surface-sunken',
  outline:
    'bg-transparent text-ink-primary border border-border-strong hover:bg-surface-sunken',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-surface-sunken hover:text-ink-primary',
  danger:
    'bg-danger text-white hover:bg-danger-strong shadow-soft-sm',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
  icon: 'h-10 w-10 rounded-lg justify-center',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
