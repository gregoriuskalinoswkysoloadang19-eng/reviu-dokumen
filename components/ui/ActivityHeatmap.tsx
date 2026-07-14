import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const DAY_MS = 86400000

/**
 * GitHub-contributions-style heatmap. Takes a flat list of ISO timestamps
 * (e.g. `riwayat.created_at`) and buckets them by day over the last
 * `weeks` weeks — pure client-side aggregation of data already fetched
 * elsewhere, no new query or schema needed.
 */
export default function ActivityHeatmap({ timestamps, weeks = 14 }: { timestamps: string[]; weeks?: number }) {
  const { days, max } = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const ts of timestamps) {
      const key = new Date(ts).toISOString().slice(0, 10)
      counts[key] = (counts[key] || 0) + 1
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Align end of grid to the upcoming Saturday so columns are full weeks.
    const endOffset = 6 - today.getDay()
    const end = new Date(today.getTime() + endOffset * DAY_MS)
    const totalDays = weeks * 7
    const start = new Date(end.getTime() - (totalDays - 1) * DAY_MS)

    const list = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(start.getTime() + i * DAY_MS)
      const key = d.toISOString().slice(0, 10)
      return { date: d, key, count: counts[key] || 0, future: d > today }
    })
    const max = Math.max(1, ...list.map((d) => d.count))
    return { days: list, max }
  }, [timestamps, weeks])

  const columns = useMemo(() => {
    const cols: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7))
    return cols
  }, [days])

  function shade(count: number, future: boolean) {
    if (future) return 'bg-transparent'
    if (count === 0) return 'bg-surface-sunken'
    const ratio = count / max
    if (ratio > 0.75) return 'bg-brand-600'
    if (ratio > 0.5) return 'bg-brand-500'
    if (ratio > 0.25) return 'bg-brand-400'
    return 'bg-brand-200'
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((day) => (
              <div
                key={day.key}
                title={`${day.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — ${day.count} aktivitas`}
                className={cn('w-3 h-3 rounded-sm', shade(day.count, day.future))}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 text-[10px] text-ink-tertiary flex-shrink-0 pt-0.5">
        <span>Lebih sedikit</span>
        <div className="flex gap-1">
          {['bg-surface-sunken', 'bg-brand-200', 'bg-brand-400', 'bg-brand-500', 'bg-brand-600'].map((c) => (
            <span key={c} className={cn('w-3 h-3 rounded-sm', c)} />
          ))}
        </div>
        <span>Lebih banyak</span>
      </div>
    </div>
  )
}
