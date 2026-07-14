import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Checkbox({
  className,
  ...props
}: RadixCheckbox.CheckboxProps) {
  return (
    <RadixCheckbox.Root
      className={cn(
        'w-5 h-5 rounded-md border border-border-strong bg-surface-raised flex items-center justify-center transition-colors data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40',
        className
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}
