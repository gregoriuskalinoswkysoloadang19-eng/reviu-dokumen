import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard, FileText, FilePlus2, BarChart3, History, Download, Users2,
  Bell, Menu, PanelLeftClose, PanelLeftOpen, LogOut, Search, FolderOpen,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import ThemeSwitch from '@/components/ui/ThemeSwitch'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu'
import Footer from '@/components/Footer'

// Single navigation group today — structured so Review, Evaluation, Repository
// and other future modules can each become their own group without touching
// the render logic below.
const NAV_GROUPS = [
  {
    label: 'Menu Utama',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
      { href: '/repositori', label: 'Document Repository', icon: FolderOpen, adminOnly: false },
      { href: '/dokumen', label: 'Daftar Dokumen', icon: FileText, adminOnly: false },
      { href: '/register', label: 'Register Dokumen', icon: FilePlus2, adminOnly: false },
      { href: '/rekapitulasi', label: 'Rekapitulasi', icon: BarChart3, adminOnly: false },
      { href: '/log/aktivitas', label: 'Log Aktivitas', icon: History, adminOnly: false },
      { href: '/ekspor', label: 'Ekspor Laporan', icon: Download, adminOnly: false },
      { href: '/admin/pengguna', label: 'Kelola Pengguna', icon: Users2, adminOnly: true },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

type Notif = { id: string; judul: string; pesan: string; dibaca: boolean; created_at: string; dokumen_id: string | null }

const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', operator: 'Operator', pimpinan: 'Pimpinan' }

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const stored = window.localStorage.getItem('dres-sidebar-collapsed')
    if (stored) setCollapsed(stored === '1')

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('nama,role').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) { setUserName(data.nama); setUserRole(data.role) }
            else { setUserName(user.email || ''); setUserRole('operator') }
          })
      }
    })
    fetchNotifs()
  }, [])

  async function fetchNotifs() {
    const { data } = await supabase.from('notifikasi').select('*').order('created_at', { ascending: false }).limit(20)
    if (data) { setNotifs(data); setUnread(data.filter((n: Notif) => !n.dibaca).length) }
  }

  async function markRead(id: string) {
    await supabase.from('notifikasi').update({ dibaca: true }).eq('id', id)
    fetchNotifs()
  }

  async function markAllRead() {
    await supabase.from('notifikasi').update({ dibaca: true }).eq('dibaca', false)
    fetchNotifs()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function toggleCollapsed() {
    setCollapsed((v) => {
      window.localStorage.setItem('dres-sidebar-collapsed', v ? '0' : '1')
      return !v
    })
  }

  const crumbs = useMemo(() => {
    const current = ALL_ITEMS.find(
      (item) => router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
    )
    if (!current || current.href === '/') return [{ label: 'Dashboard', href: '/' }]
    return [{ label: 'DRES', href: '/' }, { label: current.label, href: current.href }]
  }, [router.pathname])

  const pageTitle = useMemo(() => {
    const current = ALL_ITEMS.find(
      (item) => router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
    )
    return current?.label || 'DRES'
  }, [router.pathname])

  const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
    <aside
      className={cn('flex flex-col h-full text-white transition-all duration-250', collapsed ? 'w-[76px]' : 'w-64')}
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className={cn('flex items-center gap-2.5 px-4 h-16 border-b border-white/10 flex-shrink-0', collapsed && 'justify-center px-0')}>
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sumba-barat.png" alt="Logo Kabupaten Sumba Barat" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-semibold text-[13px] leading-snug">Document Review &amp; Evaluation System</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && <div className="px-2 mb-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{group.label}</div>}
            <div className="space-y-0.5">
              {group.items.filter((item) => !item.adminOnly || userRole === 'admin').map((item) => {
                const active = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      collapsed && 'justify-center px-0',
                      active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                    onClick={onNavigate}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent-400" />}
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.adminOnly && <Badge tone="brand" className="!bg-white/15 !text-white">Admin</Badge>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn('w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors', collapsed && 'justify-center px-0')}>
              <Avatar name={userName || 'U'} size="sm" />
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <div className="text-xs font-medium truncate">{userName}</div>
                  <div className="text-[10px] text-white/50">{ROLE_LABEL[userRole] || userRole}</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onSelect={handleLogout} className="text-danger data-[highlighted]:text-danger">
              <LogOut className="w-4 h-4" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        onClick={toggleCollapsed}
        className="hidden md:flex items-center justify-center h-9 border-t border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-canvas)' }}>
      <div className="hidden md:flex flex-col flex-shrink-0 shadow-glass z-20">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 animate-slide-up">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky top navigation */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-16 glass-panel border-b border-border-subtle flex-shrink-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-ink-secondary hover:bg-surface-sunken">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block min-w-0">
            <div className="text-sm font-display font-semibold text-ink-primary truncate">{pageTitle}</div>
            <Breadcrumb items={crumbs} />
          </div>

          <div className="flex-1" />

          {/* Global search — visual placeholder, wired up in a later phase */}
          <div className="relative hidden sm:block" title="Pencarian global — segera hadir">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              disabled
              placeholder="Cari dokumen, pengguna..."
              className="h-9 w-52 lg:w-72 pl-9 pr-14 rounded-lg text-sm bg-surface-sunken border border-transparent text-ink-tertiary placeholder:text-ink-tertiary cursor-not-allowed"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-tertiary bg-surface-raised border border-border rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>

          <ThemeSwitch />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) fetchNotifs() }}
              className="relative p-2 rounded-lg text-ink-secondary hover:bg-surface-sunken transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 rounded-xl border border-border bg-surface-raised shadow-soft-lg z-50 overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <span className="text-sm font-semibold text-ink-primary">Notifikasi</span>
                  {unread > 0 && <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700">Tandai semua dibaca</button>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-ink-tertiary">Tidak ada notifikasi</div>
                  ) : notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { markRead(n.id); if (n.dokumen_id) router.push(`/dokumen/${n.dokumen_id}`); setNotifOpen(false) }}
                      className={cn('px-4 py-3 cursor-pointer hover:bg-surface-sunken transition-colors', !n.dibaca && 'bg-info-subtle/40')}
                    >
                      <div className="flex items-start gap-2">
                        {!n.dibaca && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                        <div className={!n.dibaca ? '' : 'ml-4'}>
                          <p className="text-xs font-medium text-ink-primary">{n.judul}</p>
                          <p className="text-xs text-ink-tertiary mt-0.5">{n.pesan}</p>
                          <p className="text-[11px] text-ink-tertiary/70 mt-0.5">
                            {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  )
}
