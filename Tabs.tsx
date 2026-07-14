import * as RadixTooltip from '@radix-ui/react-tooltip'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>
}

export default function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-ink-primary text-ink-inverse text-xs px-2.5 py-1.5 shadow-soft-md animate-fade-in"
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink-primary" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
