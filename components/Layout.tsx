import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href:'/', label:'Dashboard', icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href:'/dokumen', label:'Daftar Dokumen', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href:'/register', label:'Register Dokumen', icon:'M12 4v16m8-8H4' },
  { href:'/rekapitulasi', label:'Rekapitulasi', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href:'/log/aktivitas', label:'Log Aktivitas', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href:'/ekspor', label:'Ekspor Laporan', icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  { href:'/admin/pengguna', label:'Kelola Pengguna', icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', adminOnly:true },
]

type Notif = { id:string; judul:string; pesan:string; dibaca:boolean; created_at:string; dokumen_id:string|null }

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
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

  const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', operator: 'Operator', pimpinan: 'Pimpinan' }
  const ROLE_COLOR: Record<string, string> = { admin: 'bg-purple-500', operator: 'bg-blue-500', pimpinan: 'bg-amber-500' }

  const Sidebar = () => (
    <aside className="w-60 bg-blue-900 text-white flex flex-col h-full">
      <div className="px-5 py-4 border-b border-blue-800">
        <div className="font-semibold text-sm">Monitoring Reviu Dokumen</div>
        <div className="text-blue-300 text-xs mt-0.5">Inspektorat Sumba Barat</div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.filter(item => !item.adminOnly || userRole === 'admin').map(item => {
          const active = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
              onClick={() => setMobileOpen(false)}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="flex-1">{item.label}</span>
              {item.adminOnly && <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">Admin</span>}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-full ${ROLE_COLOR[userRole] || 'bg-blue-500'} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
            {(userName.charAt(0) || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-white font-medium truncate">{userName}</div>
            <div className="text-xs text-blue-300">{ROLE_LABEL[userRole] || userRole}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-left text-xs text-blue-300 hover:text-white flex items-center gap-1.5 mt-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:flex flex-col"><Sidebar /></div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-1 rounded text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm font-medium text-gray-700 md:hidden">Monitoring Reviu</span>
          <div className="flex-1" />
          {/* Notifikasi bell */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(v => !v); if (!notifOpen) fetchNotifs() }}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {/* Dropdown notifikasi */}
            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
                  {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800">Tandai semua dibaca</button>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">Tidak ada notifikasi</div>
                  ) : notifs.map(n => (
                    <div key={n.id} onClick={() => { markRead(n.id); if (n.dokumen_id) router.push(`/dokumen/${n.dokumen_id}`); setNotifOpen(false) }}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${!n.dibaca ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.dibaca && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>}
                        <div className={!n.dibaca ? '' : 'ml-4'}>
                          <p className="text-xs font-medium text-gray-800">{n.judul}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.pesan}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
