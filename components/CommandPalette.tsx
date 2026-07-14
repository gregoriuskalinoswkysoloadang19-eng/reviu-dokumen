import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  LayoutDashboard, FileText, FilePlus2, BarChart3, History, Download, Users2,
  FolderOpen, Search, CornerDownLeft, ArrowUp, ArrowDown, FileSearch, Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Command = {
  id: string
  label: string
  hint?: string
  group: 'Navigasi' | 'Aksi Cepat' | 'Dokumen'
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
}

const NAV_COMMANDS: Omit<Command, 'onSelect'>[] = [
  { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigasi', icon: LayoutDashboard },
  { id: 'nav-repo', label: 'Document Repository', group: 'Navigasi', icon: FolderOpen },
  { id: 'nav-dokumen', label: 'Daftar Dokumen', group: 'Navigasi', icon: FileText },
  { id: 'nav-register', label: 'Register Dokumen', group: 'Navigasi', icon: FilePlus2 },
  { id: 'nav-rekap', label: 'Rekapitulasi', group: 'Navigasi', icon: BarChart3 },
  { id: 'nav-log', label: 'Log Aktivitas', group: 'Navigasi', icon: History },
  { id: 'nav-ekspor', label: 'Ekspor Laporan', group: 'Navigasi', icon: Download },
  { id: 'nav-pengguna', label: 'Kelola Pengguna', group: 'Navigasi', icon: Users2 },
]

const NAV_HREF: Record<string, string> = {
  'nav-dashboard': '/', 'nav-repo': '/repositori', 'nav-dokumen': '/dokumen',
  'nav-register': '/register', 'nav-rekap': '/rekapitulasi', 'nav-log': '/log/aktivitas',
  'nav-ekspor': '/ekspor', 'nav-pengguna': '/admin/pengguna',
}

const ACTION_COMMANDS: Omit<Command, 'onSelect'>[] = [
  { id: 'act-upload', label: 'Upload Dokumen Baru', hint: 'Buka Repository lalu unggah', group: 'Aksi Cepat', icon: FilePlus2 },
  { id: 'act-review', label: 'Tambah Review', hint: 'Register dokumen untuk direviu', group: 'Aksi Cepat', icon: FileSearch },
]

type DocHit = { id: string; nama_dokumen: string; nomor_laporan: string; status: string }

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [docHits, setDocHits] = useState<DocHit[]>([])
  const [searching, setSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setDocHits([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Debounced document search against the existing `dokumen` table —
  // read-only, no schema or API changes.
  useEffect(() => {
    if (!open || query.trim().length < 2) { setDocHits([]); return }
    setSearching(true)
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from('dokumen')
        .select('id,nama_dokumen,nomor_laporan,status')
        .or(`nama_dokumen.ilike.%${query}%,nomor_laporan.ilike.%${query}%`)
        .limit(6)
      setDocHits(data || [])
      setSearching(false)
    }, 250)
    return () => clearTimeout(handle)
  }, [query, open])

  const commands: Command[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const nav = NAV_COMMANDS
      .filter((c) => !q || c.label.toLowerCase().includes(q))
      .map((c) => ({ ...c, onSelect: () => { router.push(NAV_HREF[c.id]); onClose() } }))
    const actions = ACTION_COMMANDS
      .filter((c) => !q || c.label.toLowerCase().includes(q))
      .map((c) => ({ ...c, onSelect: () => { router.push(c.id === 'act-upload' ? '/repositori' : '/register'); onClose() } }))
    const docs: Command[] = docHits.map((d) => ({
      id: `doc-${d.id}`,
      label: d.nama_dokumen,
      hint: `${d.nomor_laporan} · ${d.status}`,
      group: 'Dokumen' as const,
      icon: FileText,
      onSelect: () => { router.push(`/dokumen/${d.id}`); onClose() },
    }))
    return [...nav, ...actions, ...docs]
  }, [query, docHits, router, onClose])

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    for (const c of commands) { (groups[c.group] ||= []).push(c) }
    return groups
  }, [commands])

  useEffect(() => setActiveIndex(0), [commands.length, query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, commands.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); commands[activeIndex]?.onSelect() }
    else if (e.key === 'Escape') { onClose() }
  }

  if (!open) return null

  let runningIndex = -1

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-xl rounded-2xl border border-border bg-surface-raised shadow-soft-xl overflow-hidden animate-scale-in"
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-subtle">
          <Search className="w-[18px] h-[18px] text-ink-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari dokumen, menu, atau aksi cepat..."
            className="flex-1 bg-transparent outline-none text-sm text-ink-primary placeholder:text-ink-tertiary"
          />
          {searching && <Loader2 className="w-4 h-4 animate-spin text-ink-tertiary" />}
          <kbd className="text-[10px] font-medium text-ink-tertiary bg-surface-sunken border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto py-2">
          {commands.length === 0 && (
            <div className="py-10 text-center text-sm text-ink-tertiary">Tidak ada hasil untuk &quot;{query}&quot;</div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="px-2 mb-1">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{group}</div>
              {items.map((cmd) => {
                runningIndex += 1
                const isActive = runningIndex === activeIndex
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onMouseEnter={() => setActiveIndex(runningIndex)}
                    onClick={cmd.onSelect}
                    className={cn(
                      'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors',
                      isActive ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-surface-sunken'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-brand-600' : 'text-ink-tertiary')} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-ink-primary truncate">{cmd.label}</span>
                      {cmd.hint && <span className="block text-xs text-ink-tertiary truncate">{cmd.hint}</span>}
                    </span>
                    {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 h-10 border-t border-border-subtle text-[11px] text-ink-tertiary">
          <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigasi</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Pilih</span>
          <span className="ml-auto">DRES Command Palette</span>
        </div>
      </div>
    </div>
  )
}
