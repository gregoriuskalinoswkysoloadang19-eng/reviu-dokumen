import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Search, LayoutGrid, List as ListIcon, Star, Clock, Folder, FileText, Upload,
  X, Download, ExternalLink, History as HistoryIcon, User, CalendarDays,
  Hash, Tag, ChevronRight, UploadCloud, Inbox,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { STATUS_LIST, STATUS_BADGE, STATUS_PROGRES, KATEGORI_LIST, WARNA_RIWAYAT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Card, Input, Select, Skeleton, EmptyState, ProgressBar, Modal, Button } from '@/components/ui'
import MetadataChip from '@/components/ui/MetadataChip'
import { DocumentGridCard } from '@/components/DocumentCard'

type Dok = {
  id: string
  nomor_laporan: string
  nama_dokumen: string
  kategori: string
  status: string
  progres: number
  pic: string | null
  catatan: string | null
  tanggal_diajukan: string
  target_selesai: string | null
  tanggal_selesai: string | null
  file_url: string | null
  file_name: string | null
  file_size: string | null
  created_at: string
}

type Riwayat = { id: string; dokumen_id: string; keterangan: string; warna: string; created_at: string }

const FAVORITES_KEY = 'dres-repo-favorites'
const RECENT_KEY = 'dres-repo-recent'
const MAX_SIZE = 20 * 1024 * 1024
const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.zip', '.rar']

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(key) || '[]') } catch { return [] }
}
function writeIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids))
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

type NavKey = { type: 'all' } | { type: 'favorites' } | { type: 'recent' } | { type: 'kategori'; value: string } | { type: 'status'; value: string }

export default function RepositoriPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [fKategori, setFKategori] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [nav, setNav] = useState<NavKey>({ type: 'all' })
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [riwayat, setRiwayat] = useState<Riwayat[]>([])
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    fetchDocs()
    setFavorites(readIds(FAVORITES_KEY))
    setRecent(readIds(RECENT_KEY))
  }, [])

  async function fetchDocs() {
    setLoading(true)
    const { data } = await supabase.from('dokumen').select('*').order('created_at', { ascending: false })
    setDok(data || [])
    setLoading(false)
  }

  const selected = useMemo(() => dok.find(d => d.id === selectedId) || null, [dok, selectedId])

  useEffect(() => {
    if (!selected) { setRiwayat([]); setSignedUrl(null); return }
    supabase.from('riwayat').select('*').eq('dokumen_id', selected.id).order('created_at', { ascending: false })
      .then(({ data }) => setRiwayat(data || []))
    if (selected.file_url) {
      supabase.storage.from('dokumen-reviu').createSignedUrl(selected.file_url, 300)
        .then(({ data }) => setSignedUrl(data?.signedUrl || null))
    } else setSignedUrl(null)
  }, [selected])

  function openDoc(id: string) {
    setSelectedId(id)
    const next = [id, ...recent.filter(r => r !== id)].slice(0, 8)
    setRecent(next); writeIds(RECENT_KEY, next)
  }

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [id, ...favorites]
    setFavorites(next); writeIds(FAVORITES_KEY, next)
  }

  const kategoriCounts = useMemo(() => {
    const m: Record<string, number> = {}
    dok.forEach(d => { m[d.kategori] = (m[d.kategori] || 0) + 1 })
    return m
  }, [dok])

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {}
    dok.forEach(d => { m[d.status] = (m[d.status] || 0) + 1 })
    return m
  }, [dok])

  const scoped = useMemo(() => {
    if (nav.type === 'favorites') return dok.filter(d => favorites.includes(d.id))
    if (nav.type === 'recent') return recent.map(id => dok.find(d => d.id === id)).filter(Boolean) as Dok[]
    if (nav.type === 'kategori') return dok.filter(d => d.kategori === nav.value)
    if (nav.type === 'status') return dok.filter(d => d.status === nav.value)
    return dok
  }, [dok, nav, favorites, recent])

  const filtered = useMemo(() => scoped.filter(d => {
    const s = search.toLowerCase()
    return (
      (!search || d.nama_dokumen.toLowerCase().includes(s) || d.nomor_laporan.toLowerCase().includes(s) || (d.pic || '').toLowerCase().includes(s)) &&
      (!fKategori || d.kategori === fKategori) &&
      (!fStatus || d.status === fStatus)
    )
  }), [scoped, search, fKategori, fStatus])

  async function download() {
    if (!selected?.file_url) return
    const { data } = await supabase.storage.from('dokumen-reviu').createSignedUrl(selected.file_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const isPdf = selected?.file_name?.toLowerCase().endsWith('.pdf')

  return (
    <>
      <Head><title>Document Repository — DRES | Inspectorate of West Sumba Regency</title></Head>
      <Layout>
        <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-lg font-semibold text-ink-primary">Document Repository</h1>
              <p className="text-sm text-ink-tertiary">Sumber tunggal kebenaran untuk seluruh dokumen DRES.</p>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <UploadCloud className="h-4 w-4" /> Unggah Dokumen
            </Button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_320px]">
            {/* Navigation panel */}
            <Card className="flex flex-col overflow-y-auto p-2">
              <NavItem label="Semua Dokumen" icon={Inbox} active={nav.type === 'all'} count={dok.length} onClick={() => setNav({ type: 'all' })} />
              <NavItem label="Favorit" icon={Star} active={nav.type === 'favorites'} count={favorites.length} onClick={() => setNav({ type: 'favorites' })} />
              <NavItem label="Terakhir Dibuka" icon={Clock} active={nav.type === 'recent'} count={recent.length} onClick={() => setNav({ type: 'recent' })} />

              <p className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Kategori</p>
              {KATEGORI_LIST.map(k => (
                <NavItem key={k} label={k} icon={Folder} active={nav.type === 'kategori' && nav.value === k}
                  count={kategoriCounts[k] || 0} onClick={() => setNav({ type: 'kategori', value: k })} />
              ))}

              <p className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Status Alur Kerja</p>
              {STATUS_LIST.map(s => (
                <NavItem key={s} label={s} icon={Tag} active={nav.type === 'status' && nav.value === s}
                  count={statusCounts[s] || 0} onClick={() => setNav({ type: 'status', value: s })} />
              ))}
            </Card>

            {/* Document list */}
            <div className="flex min-h-0 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input icon={<Search className="h-4 w-4" />} placeholder="Cari nama dokumen, nomor, atau PIC..."
                  value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
                <Select value={fKategori} onChange={e => setFKategori(e.target.value)} className="w-auto">
                  <option value="">Semua Kategori</option>
                  {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                </Select>
                <Select value={fStatus} onChange={e => setFStatus(e.target.value)} className="w-auto">
                  <option value="">Semua Status</option>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <div className="ml-auto flex items-center gap-1 rounded-lg bg-surface-sunken p-1">
                  <button onClick={() => setView('grid')} className={cn('flex h-8 w-8 items-center justify-center rounded-md transition-colors', view === 'grid' ? 'bg-surface-raised shadow-soft-xs text-brand-600' : 'text-ink-tertiary')}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setView('list')} className={cn('flex h-8 w-8 items-center justify-center rounded-md transition-colors', view === 'list' ? 'bg-surface-raised shadow-soft-xs text-brand-600' : 'text-ink-tertiary')}>
                    <ListIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Card className="min-h-0 flex-1 overflow-y-auto p-3">
                {loading ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState title="Tidak ada dokumen" description="Coba ubah pencarian atau filter, atau unggah dokumen baru." />
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(d => (
                      <div key={d.id} className="relative" onClick={() => openDoc(d.id)}>
                        <DocumentGridCard doc={d} />
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(d.id) }}
                          className="absolute right-3 top-3 rounded-full bg-surface-raised/90 p-1.5 shadow-soft-xs"
                        >
                          <Star className={cn('h-3.5 w-3.5', favorites.includes(d.id) ? 'fill-warning text-warning' : 'text-ink-tertiary')} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filtered.map(d => (
                      <div key={d.id} onClick={() => openDoc(d.id)}
                        className={cn('group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors', selectedId === d.id ? 'bg-brand-50 dark:bg-brand-950/30' : 'hover:bg-surface-sunken')}>
                        <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-primary">{d.nama_dokumen}</p>
                          <p className="truncate text-[11px] text-ink-tertiary">{d.nomor_laporan} · {d.kategori} · {d.pic || '—'}</p>
                        </div>
                        <span className={STATUS_BADGE[d.status] || STATUS_BADGE['Belum Direviu']}>{d.status}</span>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(d.id) }} className="shrink-0 p-1">
                          <Star className={cn('h-3.5 w-3.5', favorites.includes(d.id) ? 'fill-warning text-warning' : 'text-ink-tertiary opacity-0 group-hover:opacity-100')} />
                        </button>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Preview + detail panel */}
            <Card className="hidden min-h-0 flex-col overflow-y-auto xl:flex">
              {!selected ? (
                <EmptyState icon={FileText} title="Pilih dokumen" description="Klik dokumen untuk melihat pratinjau dan detailnya di sini." className="h-full" />
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink-primary">{selected.nama_dokumen}</p>
                    <button onClick={() => setSelectedId(null)} className="text-ink-tertiary hover:text-ink-primary"><X className="h-4 w-4" /></button>
                  </div>

                  {/* Preview area */}
                  <div className="flex h-48 shrink-0 items-center justify-center border-b border-border-subtle bg-surface-sunken">
                    {selected.file_url && isPdf && signedUrl ? (
                      <iframe src={signedUrl} className="h-full w-full" title="preview" />
                    ) : selected.file_url ? (
                      <div className="flex flex-col items-center gap-2 text-ink-tertiary">
                        <FileText className="h-10 w-10" />
                        <span className="text-xs">{selected.file_name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-ink-tertiary">
                        <Inbox className="h-8 w-8" />
                        <span className="text-xs">Belum ada file terlampir</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex flex-wrap gap-2">
                      {selected.file_url && (
                        <Button size="sm" variant="secondary" onClick={download}><Download className="h-3.5 w-3.5" /> Unduh</Button>
                      )}
                      <Link href={`/dokumen/${selected.id}`}>
                        <Button size="sm" variant="outline"><ExternalLink className="h-3.5 w-3.5" /> Buka Detail Lengkap</Button>
                      </Link>
                    </div>

                    <div>
                      <span className={STATUS_BADGE[selected.status] || STATUS_BADGE['Belum Direviu']}>{selected.status}</span>
                      <div className="mt-2"><ProgressBar value={selected.progres} /></div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <PropRow icon={Hash} label="Nomor Laporan" value={selected.nomor_laporan} />
                      <PropRow icon={Tag} label="Kategori" value={selected.kategori} />
                      <PropRow icon={User} label="PIC" value={selected.pic || '—'} />
                      <PropRow icon={CalendarDays} label="Diajukan" value={fmtDate(selected.tanggal_diajukan)} />
                      <PropRow icon={CalendarDays} label="Target Selesai" value={fmtDate(selected.target_selesai)} />
                      {selected.file_size && <PropRow icon={FileText} label="Ukuran File" value={selected.file_size} />}
                    </div>

                    {selected.catatan && (
                      <div className="rounded-lg bg-surface-sunken p-3 text-xs text-ink-secondary">{selected.catatan}</div>
                    )}

                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-primary"><HistoryIcon className="h-3.5 w-3.5" /> Riwayat Aktivitas</p>
                      {riwayat.length === 0 ? (
                        <p className="text-[11px] text-ink-tertiary">Belum ada riwayat.</p>
                      ) : (
                        <ol className="space-y-2 border-l border-border-subtle pl-3">
                          {riwayat.map(r => (
                            <li key={r.id}>
                              <p className="text-[11px] text-ink-secondary">{r.keterangan}</p>
                              <p className="text-[10px] text-ink-tertiary">{new Date(r.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onDone={fetchDocs} />
      </Layout>
    </>
  )
}

function NavItem({ label, icon: Icon, active, count, onClick }: { label: string; icon: React.ElementType; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors duration-150',
        active ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40' : 'text-ink-secondary hover:bg-surface-sunken'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={cn('shrink-0 rounded-full px-1.5 text-[10px]', active ? 'bg-brand-100 text-brand-700' : 'bg-surface-sunken text-ink-tertiary')}>{count}</span>
    </button>
  )
}

function PropRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-ink-tertiary"><Icon className="h-3 w-3" /> {label}</span>
      <span className="font-medium text-ink-primary">{value}</span>
    </div>
  )
}

function UploadDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [kategori, setKategori] = useState(KATEGORI_LIST[0])
  const [pic, setPic] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setFiles([]); setPic(''); setError(''); setUploading(false)
  }

  function validate(f: File): string {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) return `Format tidak didukung: ${f.name}`
    if (f.size > MAX_SIZE) return `Ukuran melebihi 20 MB: ${f.name}`
    return ''
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const arr = Array.from(list)
    for (const f of arr) {
      const err = validate(f)
      if (err) { setError(err); return }
    }
    setError('')
    setFiles(prev => [...prev, ...arr])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  async function handleUpload() {
    if (files.length === 0) { setError('Pilih minimal satu file.'); return }
    setUploading(true); setError('')
    try {
      for (const file of files) {
        const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { error: upErr } = await supabase.storage.from('dokumen-reviu').upload(path, file, { contentType: file.type || 'application/octet-stream' })
        if (upErr) throw new Error(upErr.message)
        const file_size = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
        const { data: inserted, error: insErr } = await supabase.from('dokumen').insert({
          nomor_laporan: `AUTO-${Date.now()}`,
          nama_dokumen: file.name.replace(/\.[^/.]+$/, ''),
          kategori, pic: pic || null,
          tanggal_diajukan: new Date().toISOString().slice(0, 10),
          target_selesai: null, status: 'Belum Direviu', progres: STATUS_PROGRES['Belum Direviu'] ?? 0,
          catatan: null, file_url: path, file_name: file.name, file_size,
        }).select().single()
        if (insErr) throw new Error(insErr.message)
        if (inserted) {
          await supabase.from('riwayat').insert({ dokumen_id: inserted.id, keterangan: 'Dokumen diunggah melalui Document Repository', warna: 'x' })
        }
      }
      onDone(); reset(); onOpenChange(false)
    } catch (err: any) {
      setError('Gagal mengunggah: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={v => { onOpenChange(v); if (!v) reset() }} title="Unggah Dokumen" description="Tarik & lepas satu atau beberapa file, atau pilih dari perangkat.">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn('flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors', dragging ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' : 'border-border')}
      >
        <Upload className="h-6 w-6 text-ink-tertiary" />
        <p className="text-xs text-ink-secondary">Seret file ke sini atau klik untuk memilih</p>
        <p className="text-[11px] text-ink-tertiary">PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR — maks 20 MB</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-md bg-surface-sunken px-2 py-1 text-xs">
              <span className="truncate">{f.name}</span>
              <button onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))} className="text-ink-tertiary hover:text-danger"><X className="h-3 w-3" /></button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink-secondary">Kategori</label>
          <Select value={kategori} onChange={e => setKategori(e.target.value)}>
            {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink-secondary">PIC (opsional)</label>
          <Input value={pic} onChange={e => setPic(e.target.value)} placeholder="Nama PIC" />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-danger-strong">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
        <Button onClick={handleUpload} loading={uploading}>
          {uploading ? 'Mengunggah...' : `Unggah${files.length > 1 ? ` (${files.length})` : ''}`}
        </Button>
      </div>
    </Modal>
  )
}
