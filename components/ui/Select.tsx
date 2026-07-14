import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'w-full h-10 pl-3 pr-9 rounded-lg text-sm border bg-surface-raised text-ink-primary appearance-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400',
        error ? 'border-danger' : 'border-border',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
  </div>
))
Select.displayName = 'Select'

export default Select
