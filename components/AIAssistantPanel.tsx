import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Sparkles, X, FileText, Users2, ListChecks, AlarmClock, ChevronRight, CheckSquare, Square,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

type Dok = {
  id: string; nama_dokumen: string; nomor_laporan: string; kategori: string; pic: string
  status: string; progres: number; target_selesai: string | null; catatan: string | null
}

const CHECKLIST_TEMPLATE: Record<string, string[]> = {
  Perencanaan: [
    'Kesesuaian dokumen dengan RKPD/Renstra',
    'Indikator kinerja terukur dan realistis',
    'Kelengkapan lampiran pendukung',
    'Paraf dan tanda tangan pejabat berwenang',
  ],
  Keuangan: [
    'Kesesuaian anggaran dengan DPA',
    'Bukti transaksi dan kuitansi lengkap',
    'Rekonsiliasi saldo kas/bank',
    'Kepatuhan terhadap standar akuntansi pemerintahan',
  ],
  Kinerja: [
    'Capaian target dibandingkan rencana',
    'Analisis penyebab deviasi kinerja',
    'Data dukung capaian terverifikasi',
    'Rekomendasi tindak lanjut dirumuskan',
  ],
}

/**
 * Smart insight panel over the app's existing Supabase data — document
 * similarity, reviewer suggestions, and an auto-generated audit checklist.
 * This runs entirely on data already in the `dokumen` / `riwayat` tables;
 * it does not call an external LLM. Wiring a true generative AI assistant
 * (e.g. free-text summarization) would need a small server API route with
 * a model key, which is intentionally out of scope for a frontend-only
 * upgrade — this panel is built to slot a real call in later without
 * changing its UI contract.
 */
export default function AIAssistantPanel() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Dok | null>(null)
  const [similar, setSimilar] = useState<Dok[]>([])
  const [topReviewer, setTopReviewer] = useState<{ name: string; selesai: number } | null>(null)
  const [deadlineRisk, setDeadlineRisk] = useState<Dok[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const docId = typeof router.query.id === 'string' ? router.query.id : null

  useEffect(() => {
    if (!open) return
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [open, docId])

  async function load() {
    if (docId) {
      const { data: doc } = await supabase.from('dokumen').select('*').eq('id', docId).single()
      setCurrent(doc || null)
      if (doc) {
        const { data: sim } = await supabase
          .from('dokumen').select('*')
          .eq('kategori', doc.kategori).neq('id', doc.id)
          .order('created_at', { ascending: false }).limit(4)
        setSimilar(sim || [])

        const { data: peers } = await supabase.from('dokumen').select('pic,status').eq('kategori', doc.kategori)
        setTopReviewer(computeTopReviewer(peers || []))
      }
    } else {
      setCurrent(null)
      setSimilar([])
      const { data: all } = await supabase.from('dokumen').select('*').neq('status', 'Selesai')
      setTopReviewer(computeTopReviewer(all || []))
      const soon = (all || [])
        .filter((d) => d.target_selesai)
        .sort((a, b) => new Date(a.target_selesai).getTime() - new Date(b.target_selesai).getTime())
        .slice(0, 5)
      setDeadlineRisk(soon)
    }
  }

  function computeTopReviewer(rows: { pic: string; status: string }[]) {
    const tally: Record<string, number> = {}
    for (const r of rows) {
      if (r.status === 'Selesai' && r.pic) tally[r.pic] = (tally[r.pic] || 0) + 1
    }
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1])
    return sorted.length ? { name: sorted[0][0], selesai: sorted[0][1] } : null
  }

  const summary = useMemo(() => {
    if (!current) return null
    const parts = [
      `${current.nama_dokumen} (${current.nomor_laporan}) berada pada kategori ${current.kategori} dengan status "${current.status}" dan progres ${current.progres}%.`,
      current.target_selesai ? `Target penyelesaian: ${new Date(current.target_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.` : 'Belum ada target penyelesaian.',
      current.catatan ? `Catatan reviewer: "${current.catatan}"` : 'Belum ada catatan reviewer yang tercatat.',
    ]
    return parts.join(' ')
  }, [current])

  const checklist = current ? CHECKLIST_TEMPLATE[current.kategori] || [] : []

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-surface-raised border border-border shadow-soft-lg flex items-center justify-center text-brand-600 hover:shadow-soft-xl transition-shadow"
        aria-label="Buka AI Assistant"
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface-raised border-l border-border shadow-soft-xl flex flex-col animate-slide-up">
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border-subtle flex-shrink-0">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-display font-semibold text-ink-primary">AI Assistant</p>
                <p className="text-[11px] text-ink-tertiary truncate">
                  {current ? current.nama_dokumen : 'Insight lintas dokumen'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto p-1.5 rounded-md text-ink-tertiary hover:bg-surface-sunken">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {loading && <p className="text-sm text-ink-tertiary">Menganalisis data...</p>}

              {!loading && current && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Ringkasan Dokumen
                  </h3>
                  <p className="text-sm text-ink-primary leading-relaxed bg-surface-sunken rounded-lg p-3">{summary}</p>
                </section>
              )}

              {!loading && current && checklist.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5" /> Checklist Audit Otomatis
                  </h3>
                  <div className="space-y-1.5">
                    {checklist.map((item) => {
                      const isChecked = !!checked[item]
                      return (
                        <button
                          key={item}
                          onClick={() => setChecked((c) => ({ ...c, [item]: !c[item] }))}
                          className="w-full flex items-start gap-2 text-left text-sm p-2 rounded-lg hover:bg-surface-sunken transition-colors"
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-ink-tertiary flex-shrink-0 mt-0.5" />}
                          <span className={cn(isChecked ? 'text-ink-tertiary line-through' : 'text-ink-primary')}>{item}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-ink-tertiary mt-1.5">Checklist ini berbasis kategori dokumen dan hanya tersimpan sementara di sesi ini.</p>
                </section>
              )}

              {!loading && current && similar.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Dokumen Serupa
                  </h3>
                  <div className="space-y-1.5">
                    {similar.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => { router.push(`/dokumen/${d.id}`); }}
                        className="w-full flex items-center justify-between gap-2 text-left p-2.5 rounded-lg border border-border hover:bg-surface-sunken transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink-primary truncate">{d.nama_dokumen}</p>
                          <p className="text-xs text-ink-tertiary">{d.nomor_laporan}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ink-tertiary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {!loading && topReviewer && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2 flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5" /> Rekomendasi Reviewer
                  </h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{topReviewer.name}</p>
                      <p className="text-xs text-ink-tertiary">Kategori {current ? current.kategori : 'aktif'} paling berpengalaman</p>
                    </div>
                    <Badge tone="success">{topReviewer.selesai} selesai</Badge>
                  </div>
                </section>
              )}

              {!loading && !current && deadlineRisk.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2 flex items-center gap-1.5">
                    <AlarmClock className="w-3.5 h-3.5" /> Prioritas Mendekati Deadline
                  </h3>
                  <div className="space-y-1.5">
                    {deadlineRisk.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => router.push(`/dokumen/${d.id}`)}
                        className="w-full flex items-center justify-between gap-2 text-left p-2.5 rounded-lg border border-border hover:bg-surface-sunken transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink-primary truncate">{d.nama_dokumen}</p>
                          <p className="text-xs text-ink-tertiary">Target: {d.target_selesai ? new Date(d.target_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ink-tertiary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
