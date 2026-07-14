import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full px-3 py-2.5 rounded-lg text-sm border bg-surface-raised text-ink-primary placeholder:text-ink-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none',
      error ? 'border-danger' : 'border-border',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export default Textarea
