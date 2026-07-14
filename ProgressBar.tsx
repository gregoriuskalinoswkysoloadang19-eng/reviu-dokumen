import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, error, ...props }, ref) => {
  if (icon) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-tertiary">{icon}</div>
        <input
          ref={ref}
          className={cn(
            'w-full h-10 pl-9 pr-3 rounded-lg text-sm border bg-surface-raised text-ink-primary placeholder:text-ink-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400',
            error ? 'border-danger' : 'border-border',
            className
          )}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-lg text-sm border bg-surface-raised text-ink-primary placeholder:text-ink-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400',
        error ? 'border-danger' : 'border-border',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export default Input
