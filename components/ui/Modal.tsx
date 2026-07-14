import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border bg-surface-raised shadow-soft-xl p-6 animate-scale-in',
            className
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <Dialog.Title className="font-display font-semibold text-ink-primary text-base">{title}</Dialog.Title>
            <Dialog.Close className="text-ink-tertiary hover:text-ink-primary rounded-md p-1 -mr-1 -mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          {description && <Dialog.Description className="text-xs text-ink-tertiary mb-4">{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
