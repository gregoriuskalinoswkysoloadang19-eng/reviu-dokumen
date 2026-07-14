import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = RadixTabs.Root

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('inline-flex items-center gap-1 rounded-lg bg-surface-sunken p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary transition-all data-[state=active]:bg-surface-raised data-[state=active]:text-ink-primary data-[state=active]:shadow-soft-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40',
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: RadixTabs.TabsContentProps) {
  return <RadixTabs.Content className={cn('animate-fade-in mt-4', className)} {...props} />
}
