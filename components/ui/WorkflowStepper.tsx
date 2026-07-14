import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WorkflowStage = {
  key: string
  label: string
  done: boolean
  active: boolean
  timestamp?: string | null
}

const DEFAULT_STAGES = ['Upload', 'Review', 'Evaluasi', 'Final Approval']

/**
 * Maps the existing STATUS_LIST/progres values onto the four-stage
 * Upload → Review → Evaluasi → Final Approval pipeline requested for the
 * document Progress Tracker, without touching how status/progres are
 * stored or computed server-side.
 */
export function stagesFromProgress(progres: number, status: string): WorkflowStage[] {
  // Each stage is "done" once progres reaches the threshold where the next
  // stage begins; the current stage is whichever one progres currently sits
  // in. Final stage additionally requires progres === 100 to be marked done.
  const thresholdAfter = [25, 60, 100, 100] // progres value at which stage i is considered complete
  const lastIndex = DEFAULT_STAGES.length - 1
  return DEFAULT_STAGES.map((label, i) => {
    const done = i === lastIndex ? progres >= 100 : progres >= thresholdAfter[i]
    const startsAt = i === 0 ? 0 : thresholdAfter[i - 1]
    const active = !done && progres >= startsAt
    return { key: label, label, done, active, timestamp: null }
  })
}

export default function WorkflowStepper({ stages, className }: { stages: WorkflowStage[]; className?: string }) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors duration-300 flex-shrink-0',
                stage.done && 'bg-accent-500 border-accent-500 text-white',
                stage.active && !stage.done && 'border-brand-500 text-brand-600 bg-brand-50 animate-pulse',
                !stage.done && !stage.active && 'border-border-strong text-ink-tertiary bg-surface-sunken'
              )}
            >
              {stage.done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-[11px] font-medium text-center leading-tight',
                stage.done || stage.active ? 'text-ink-primary' : 'text-ink-tertiary'
              )}
            >
              {stage.label}
            </span>
            {stage.timestamp && <span className="text-[10px] text-ink-tertiary">{stage.timestamp}</span>}
          </div>
          {i < stages.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 -mt-5 rounded-full overflow-hidden bg-surface-sunken">
              <div
                className={cn('h-full bg-accent-500 transition-all duration-500', stage.done ? 'w-full' : 'w-0')}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
