import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger

export function DropdownMenuContent({ className, sideOffset = 8, ...props }: RadixDropdown.DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[200px] rounded-xl border border-border bg-surface-raised shadow-soft-lg p-1.5 animate-scale-in',
          className
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: RadixDropdown.DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      className={cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-secondary cursor-pointer transition-colors outline-none data-[highlighted]:bg-surface-sunken data-[highlighted]:text-ink-primary',
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }: RadixDropdown.DropdownMenuSeparatorProps) {
  return <RadixDropdown.Separator className={cn('h-px bg-border-subtle my-1.5', className)} {...props} />
}

export function DropdownMenuLabel({ className, ...props }: RadixDropdown.DropdownMenuLabelProps) {
  return <RadixDropdown.Label className={cn('px-2.5 py-1.5 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide', className)} {...props} />
}
