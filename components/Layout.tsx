import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dokumen', label: 'Daftar Dokumen', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/register', label: 'Register Dokumen', icon: 'M12 4v16m8-8H4' },
  { href: '/rekapitulasi', label: 'Rekapitulasi', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('nama, role').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) { setUserName(data.nama); setUserRole(data.role) }
            else { setUserName(user.email || ''); setUserRole('operator') }
          })
      }
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const roleLabel: Record<string, string> = { admin: 'Administrator', operator: 'Operator', pimpinan: 'Pimpinan' }

  const Sidebar = () => (
    <aside className="w-60 bg-blue-900 text-white flex flex-col h-full">
      <div className="px-5 py-5 border-b border-blue-800">
        <div className="font-semibold text-sm leading-tight">Monitoring Reviu Dokumen</div>
        <div className="text-blue-300 text-xs mt-0.5">Inspektorat Sumba Barat</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = router.pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
              onClick={() => setMobileOpen(false)}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="text-xs text-blue-300 mb-0.5">{userName}</div>
        <div className="text-xs text-blue-400">{roleLabel[userRole] || userRole}</div>
        <button onClick={handleLogout} className="mt-3 text-xs text-blue-300 hover:text-white transition-colors flex items-center gap-1.5">
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setMobileOpen(true)} className="p-1 rounded text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">Monitoring Reviu</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
