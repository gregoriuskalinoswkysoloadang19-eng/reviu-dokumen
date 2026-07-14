import Link from 'next/link'
import { FileText, User, Calendar, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_BADGE } from '@/lib/constants'
import MetadataChip from '@/components/ui/MetadataChip'
import ProgressBar from '@/components/ui/ProgressBar'

export type DocLite = {
  id: string
  nomor_laporan: string
  nama_dokumen: string
  kategori: string
  status: string
  progres: number
  pic: string | null
  target_selesai: string | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Compact row used in dashboard widgets (assigned docs, recent docs, etc.) */
export function DocumentRow({ doc, overdue }: { doc: DocLite; overdue?: boolean }) {
  return (
    <Link
      href={`/dokumen/${doc.id}`}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-surface-sunken"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40">
        <FileText className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-primary">{doc.nama_dokumen}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-tertiary">{doc.nomor_laporan}</span>
          {doc.pic && <MetadataChip icon={User} label={doc.pic} />}
          {doc.target_selesai && (
            <MetadataChip
              icon={Calendar}
              label={fmtDate(doc.target_selesai)}
              className={overdue ? 'bg-danger-subtle text-danger-strong' : ''}
            />
          )}
        </div>
      </div>
      <span className={cn(STATUS_BADGE[doc.status] || STATUS_BADGE['Belum Direviu'], 'shrink-0')}>{doc.status}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </Link>
  )
}

/** Card used in grid layouts (e.g. Document Repository grid view) */
export function DocumentGridCard({ doc }: { doc: DocLite }) {
  return (
    <Link
      href={`/dokumen/${doc.id}`}
      className="group flex flex-col rounded-xl border border-border bg-surface-raised p-4 shadow-soft-sm transition-all duration-250 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-soft-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-transform duration-250 group-hover:scale-110 dark:bg-brand-950/40">
          <FileText className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className={STATUS_BADGE[doc.status] || STATUS_BADGE['Belum Direviu']}>{doc.status}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-ink-primary">{doc.nama_dokumen}</p>
      <p className="mt-0.5 text-[11px] text-ink-tertiary">{doc.nomor_laporan}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <MetadataChip label={doc.kategori} />
        {doc.pic && <MetadataChip icon={User} label={doc.pic} />}
      </div>
      <div className="mt-3">
        <ProgressBar value={doc.progres} />
      </div>
    </Link>
  )
}
