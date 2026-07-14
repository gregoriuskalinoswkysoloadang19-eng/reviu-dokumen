import { cn } from '@/lib/utils'

export type TimelineEntry = {
  id: string
  keterangan: string
  warna: string
  created_at: string
  actor?: string | null
}

const COLOR_MAP: Record<string, string> = {
  g: '#16a34a', b: '#2563eb', a: '#d97706', x: '#9ca3af', v: '#7c3aed', r: '#dc2626',
}

function fmtWhen(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Modern chronological workflow timeline — replaces the plain list
 * previously used to show `riwayat` rows. Reads the same `keterangan` /
 * `warna` / `created_at` fields already produced by the existing
 * Supabase writes, so no schema or business-logic change is required.
 */
export default function ActivityTimeline({ entries, dense }: { entries: TimelineEntry[]; dense?: boolean }) {
  if (entries.length === 0) {
    return <p className="text-sm text-ink-tertiary text-center py-6">Belum ada aktivitas.</p>
  }

  return (
    <ol className="relative">
      {entries.map((entry, i) => {
        const color = COLOR_MAP[entry.warna] || '#9ca3af'
        const isLast = i === entries.length - 1
        return (
          <li key={entry.id} className={cn('relative pl-7', !isLast && 'pb-5')}>
            {!isLast && (
              <span className="absolute left-[7px] top-4 bottom-0 w-px bg-border" aria-hidden />
            )}
            <span
              className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-surface-raised"
              style={{ background: color }}
              aria-hidden
            />
            <div className={cn('rounded-lg', dense ? 'py-0' : 'py-0.5')}>
              <p className="text-sm text-ink-primary leading-snug">{entry.keterangan}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-tertiary">
                <span>{fmtWhen(entry.created_at)}</span>
                {entry.actor && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-ink-tertiary/50" />
                    <span>{entry.actor}</span>
                  </>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
