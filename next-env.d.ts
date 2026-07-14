import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import {
  FileText, Loader2 as LoaderIcon, RefreshCcw, CheckCircle2, FileClock,
  AlertTriangle, TrendingUp, FilePlus2, BarChart3, Download, ListChecks,
  CalendarClock, UserCheck, Activity, Award, ClipboardList,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { WARNA_RIWAYAT } from '@/lib/constants'
import { Card, CardHeader, CardTitle, CardContent, Skeleton, EmptyState, ProgressBar } from '@/components/ui'
import StatCard from '@/components/ui/StatCard'
import { DocumentRow, type DocLite } from '@/components/DocumentCard'

type Dok = DocLite & {
  tanggal_diajukan: string
  target_selesai: string | null
  tanggal_selesai: string | null
  file_url: string | null
}

type Riwayat = { id: string; dokumen_id: string; keterangan: string; warna: string; created_at: string }

const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', operator: 'Operator', pimpinan: 'Pimpinan' }
const PIE_COLORS = ['#16a34a', '#7c3aed', '#2563eb', '#d97706', '#9ca3af']

function greetingFor(hour: number) {
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default function DashboardPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [riwayat, setRiwayat] = useState<Riwayat[]>([])
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => new Date())

  useEffect(() => {
    async function load() {
      const [{ data: userRes }, { data: docs }, { data: hist }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('dokumen').select('*').order('created_at', { ascending: false }),
        supabase.from('riwayat').select('*').order('created_at', { ascending: false }).limit(8),
      ])
      if (userRes?.user) {
        const { data: profile } = await supabase.from('users').select('nama,role').eq('id', userRes.user.id).single()
        if (profile) { setUserName(profile.nama); setUserRole(profile.role) }
        else setUserName(userRes.user.email || '')
      }
      setDok(docs || [])
      setRiwayat(hist || [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = dok.length
    const belum = dok.filter(d => d.status === 'Belum Direviu').length
    const proses = dok.filter(d => d.status === 'Dalam Proses').length
    const revisi = dok.filter(d => d.status === 'Perlu Revisi').length
    const penyusunan = dok.filter(d => d.status === 'Penyusunan Laporan Hasil Reviu').length
    const selesai = dok.filter(d => d.status === 'Selesai').length
    const overdue = dok.filter(d => d.target_selesai && d.status !== 'Selesai' && new Date(d.target_selesai) < now)
    const pctSelesai = total ? Math.round((selesai / total) * 100) : 0

    const thisMonth = now.getMonth(), thisYear = now.getFullYear()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const inMonth = (dateStr: string, m: number, y: number) => {
      const d = new Date(dateStr); return d.getMonth() === m && d.getFullYear() === y
    }
    const totalThisMonth = dok.filter(d => inMonth(d.tanggal_diajukan, thisMonth, thisYear)).length
    const totalLastMonth = dok.filter(d => inMonth(d.tanggal_diajukan, lastMonthDate.getMonth(), lastMonthDate.getFullYear())).length
    const selesaiThisMonth = dok.filter(d => d.tanggal_selesai && inMonth(d.tanggal_selesai, thisMonth, thisYear)).length
    const selesaiLastMonth = dok.filter(d => d.tanggal_selesai && inMonth(d.tanggal_selesai, lastMonthDate.getMonth(), lastMonthDate.getFullYear())).length

    return {
      total, belum, proses, revisi, penyusunan, selesai, overdue, pctSelesai,
      totalTrend: pctChange(totalThisMonth, totalLastMonth),
      selesaiTrend: pctChange(selesaiThisMonth, selesaiLastMonth),
      totalThisMonth, selesaiThisMonth,
    }
  }, [dok, now])

  const upcomingDeadlines = useMemo(() => {
    return dok
      .filter(d => d.target_selesai && d.status !== 'Selesai')
      .map(d => ({ ...d, diff: Math.ceil((new Date(d.target_selesai!).getTime() - now.getTime()) / 86400000) }))
      .filter(d => d.diff <= 7)
      .sort((a, b) => a.diff - b.diff)
  }, [dok, now])

  const todaysTasks = useMemo(() => {
    return dok.filter(d => {
      if (!d.target_selesai || d.status === 'Selesai') return false
      const t = new Date(d.target_selesai)
      return t.toDateString() === now.toDateString() || (t < now)
    }).slice(0, 6)
  }, [dok, now])

  const myDocuments = useMemo(
    () => (userName ? dok.filter(d => d.pic === userName) : []),
    [dok, userName]
  )

  const trenBulanan = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      name: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      Masuk: dok.filter(x => { const t = new Date(x.tanggal_diajukan); return t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear() }).length,
      Selesai: dok.filter(x => x.tanggal_selesai && new Date(x.tanggal_selesai).getMonth() === d.getMonth() && new Date(x.tanggal_selesai).getFullYear() === d.getFullYear()).length,
    }
  }), [dok, now])

  const kategoriData = useMemo(() => ['Perencanaan', 'Keuangan', 'Kinerja'].map(k => ({
    name: k,
    Selesai: dok.filter(d => d.kategori === k && d.status === 'Selesai').length,
    'Dalam Proses': dok.filter(d => d.kategori === k && d.status === 'Dalam Proses').length,
    'Perlu Revisi': dok.filter(d => d.kategori === k && d.status === 'Perlu Revisi').length,
    'Belum Direviu': dok.filter(d => d.kategori === k && d.status === 'Belum Direviu').length,
  })), [dok])

  const pieData = useMemo(() => ([
    { name: 'Selesai', value: stats.selesai },
    { name: 'Penyusunan LHR', value: stats.penyusunan },
    { name: 'Dalam Proses', value: stats.proses },
    { name: 'Perlu Revisi', value: stats.revisi },
    { name: 'Belum Direviu', value: stats.belum },
  ].filter(d => d.value > 0)), [stats])

  const teamProductivity = useMemo(() => {
    const byPic: Record<string, { Selesai: number; Aktif: number }> = {}
    dok.forEach(d => {
      const pic = d.pic || 'Belum Ditentukan'
      byPic[pic] = byPic[pic] || { Selesai: 0, Aktif: 0 }
      if (d.status === 'Selesai') byPic[pic].Selesai++
      else byPic[pic].Aktif++
    })
    return Object.entries(byPic)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => (b.Selesai + b.Aktif) - (a.Selesai + a.Aktif))
      .slice(0, 6)
  }, [dok])

  const avgProcessingDays = useMemo(() => {
    const done = dok.filter(d => d.tanggal_selesai)
    if (!done.length) return null
    const totalDays = done.reduce((sum, d) => {
      const start = new Date(d.tanggal_diajukan).getTime()
      const end = new Date(d.tanggal_selesai!).getTime()
      return sum + Math.max(0, (end - start) / 86400000)
    }, 0)
    return Math.round(totalDays / done.length)
  }, [dok])

  const docsById = useMemo(() => Object.fromEntries(dok.map(d => [d.id, d])), [dok])

  return (
    <>
      <Head><title>Dashboard — DRES | Inspectorate of West Sumba Regency</title></Head>
      <Layout>
        <div className="space-y-6 pb-4">
          {/* Greeting header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {loading ? (
                <Skeleton className="h-7 w-64 rounded-md" />
              ) : (
                <h1 className="font-display text-xl font-semibold text-ink-primary">
                  {greetingFor(now.getHours())}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
                </h1>
              )}
              <p className="mt-1 text-sm text-ink-tertiary">
                {userRole && <span className="mr-1.5 font-medium text-ink-secondary">{ROLE_LABEL[userRole] || userRole} ·</span>}
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}Berikut ringkasan beban kerja Anda hari ini.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/register" className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 px-4 text-sm font-medium text-white shadow-soft-sm transition-all duration-200 hover:brightness-105 hover:shadow-soft-md">
                <FilePlus2 className="h-4 w-4" /> Register Dokumen
              </Link>
              <Link href="/dokumen" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 text-sm font-medium text-ink-primary transition-colors duration-200 hover:bg-surface-sunken">
                <FileText className="h-4 w-4" /> Semua Dokumen
              </Link>
            </div>
          </div>

          {/* Overdue banner */}
          {!loading && stats.overdue.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-subtle p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger-strong" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-danger-strong">{stats.overdue.length} dokumen melewati tenggat waktu</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {stats.overdue.slice(0, 4).map(d => (
                    <Link key={d.id} href={`/dokumen/${d.id}`} className="max-w-[220px] truncate rounded-md bg-white/60 px-2 py-1 text-xs font-medium text-danger-strong hover:bg-white dark:bg-black/10">
                      {d.nama_dokumen}
                    </Link>
                  ))}
                  {stats.overdue.length > 4 && <span className="self-center text-xs text-danger-strong">+{stats.overdue.length - 4} lainnya</span>}
                </div>
              </div>
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <StatCard loading={loading} label="Total Dokumen" value={stats.total} icon={FileText} tone="brand"
              trend={{ value: stats.totalTrend }} description={`${stats.totalThisMonth} masuk bulan ini`} href="/dokumen" />
            <StatCard loading={loading} label="Belum Direviu" value={stats.belum} icon={FileClock} tone="neutral"
              description="Menunggu tindak lanjut" />
            <StatCard loading={loading} label="Dalam Proses (Reviu)" value={stats.proses} icon={LoaderIcon} tone="info"
              description="Sedang direviu tim" />
            <StatCard loading={loading} label="Perlu Revisi" value={stats.revisi} icon={RefreshCcw} tone="warning"
              description="Menunggu perbaikan" />
            <StatCard loading={loading} label="Penyusunan Laporan" value={stats.penyusunan} icon={ClipboardList} tone="brand"
              description="Tahap evaluasi akhir" />
            <StatCard loading={loading} label="Selesai" value={stats.selesai} icon={CheckCircle2} tone="success"
              trend={{ value: stats.selesaiTrend }} description={`${stats.selesaiThisMonth} selesai bulan ini`} />
            <StatCard loading={loading} label="Overdue" value={stats.overdue.length} icon={AlertTriangle} tone="danger"
              description="Lewat tenggat waktu" />
            <StatCard loading={loading} label="Progres Bulanan" value={`${stats.pctSelesai}%`} icon={TrendingUp} tone="brand"
              description="Tingkat penyelesaian keseluruhan" />
          </div>

          {/* Main grid: left = tasks & documents, right = activity & performance */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              {/* Today's tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-1.5"><ListChecks className="h-4 w-4 text-brand-600" /> Tugas Hari Ini</CardTitle>
                  </div>
                  {todaysTasks.length > 0 && <span className="rounded-full bg-danger-subtle px-2 py-0.5 text-[11px] font-medium text-danger-strong">{todaysTasks.length}</span>}
                </CardHeader>
                <CardContent className="p-2">
                  {loading ? (
                    <div className="space-y-2 p-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
                  ) : todaysTasks.length === 0 ? (
                    <EmptyState title="Tidak ada tugas mendesak" description="Semua dokumen dalam kondisi terkendali hari ini." />
                  ) : (
                    <div className="space-y-1">
                      {todaysTasks.map(d => <DocumentRow key={d.id} doc={d} overdue={new Date(d.target_selesai!) < now} />)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming deadlines */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-brand-600" /> Tenggat Mendekat (7 Hari)</CardTitle>
                  <Link href="/dokumen" className="text-xs font-medium text-brand-600 hover:text-brand-700">Lihat semua →</Link>
                </CardHeader>
                <CardContent className="p-2">
                  {loading ? (
                    <div className="space-y-2 p-3">{[1, 2].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
                  ) : upcomingDeadlines.length === 0 ? (
                    <EmptyState title="Tidak ada tenggat dalam 7 hari" description="Jadwal Anda aman untuk saat ini." />
                  ) : (
                    <div className="space-y-1">
                      {upcomingDeadlines.slice(0, 6).map(d => <DocumentRow key={d.id} doc={d} overdue={d.diff < 0} />)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My assigned documents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5"><UserCheck className="h-4 w-4 text-brand-600" /> Dokumen Ditugaskan ke Saya</CardTitle>
                  <span className="text-xs text-ink-tertiary">{myDocuments.length} dokumen</span>
                </CardHeader>
                <CardContent className="p-2">
                  {loading ? (
                    <div className="space-y-2 p-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
                  ) : myDocuments.length === 0 ? (
                    <EmptyState title="Belum ada dokumen yang ditugaskan" description="Dokumen dengan PIC atas nama Anda akan tampil di sini." />
                  ) : (
                    <div className="space-y-1">
                      {myDocuments.slice(0, 6).map(d => <DocumentRow key={d.id} doc={d} overdue={!!d.target_selesai && d.status !== 'Selesai' && new Date(d.target_selesai) < now} />)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charts: monthly trend + category progress */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Tren Dokumen Bulanan</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? <Skeleton className="h-40 w-full rounded-lg" /> : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={trenBulanan}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Masuk" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="Selesai" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Progres Reviu per Kategori</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? <Skeleton className="h-40 w-full rounded-lg" /> : (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={kategoriData} barSize={14}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="Selesai" fill="#16a34a" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="Dalam Proses" fill="#2563eb" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="Perlu Revisi" fill="#d97706" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="Belum Direviu" fill="#d1d5db" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Team productivity */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-1.5"><Award className="h-4 w-4 text-brand-600" /> Produktivitas Tim (per PIC)</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-40 w-full rounded-lg" /> : teamProductivity.length === 0 ? (
                    <EmptyState title="Belum ada data PIC" description="Tetapkan PIC pada dokumen untuk melihat produktivitas tim." />
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(160, teamProductivity.length * 36)}>
                      <BarChart data={teamProductivity} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip />
                        <Bar dataKey="Selesai" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Aktif" stackId="a" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Status distribution */}
              <Card>
                <CardHeader><CardTitle>Distribusi Status</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-40 w-full rounded-lg" /> : stats.total === 0 ? (
                    <EmptyState title="Belum ada dokumen" description="Data akan muncul setelah dokumen pertama diregistrasi." />
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <PieChart width={150} height={150}>
                          <Pie data={pieData} cx={70} cy={70} innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={2}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </div>
                      <div className="mb-3 text-center">
                        <span className="font-display text-2xl font-semibold text-success-strong">{stats.pctSelesai}%</span>
                        <span className="ml-1 text-xs text-ink-tertiary">selesai</span>
                      </div>
                      <div className="space-y-1">
                        {pieData.map((d, i) => (
                          <div key={d.name} className="flex items-center justify-between border-b border-border-subtle py-1 text-xs last:border-0">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i] }} />
                              <span className="truncate text-ink-secondary">{d.name}</span>
                            </span>
                            <span className="font-semibold text-ink-primary">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Performance summary */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-brand-600" /> Ringkasan Kinerja</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-ink-secondary">Tingkat penyelesaian</span>
                      <span className="font-semibold text-ink-primary">{stats.pctSelesai}%</span>
                    </div>
                    <ProgressBar value={stats.pctSelesai} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-surface-sunken p-3">
                      <p className="font-display text-lg font-semibold text-ink-primary">{avgProcessingDays ?? '—'}</p>
                      <p className="text-[11px] text-ink-tertiary">Rata-rata hari proses</p>
                    </div>
                    <div className="rounded-lg bg-surface-sunken p-3">
                      <p className="font-display text-lg font-semibold text-ink-primary">{stats.overdue.length}</p>
                      <p className="text-[11px] text-ink-tertiary">Tugas terlambat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader><CardTitle>Aksi Cepat</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {[
                    { href: '/register', label: 'Register Dokumen', icon: FilePlus2 },
                    { href: '/dokumen', label: 'Daftar Dokumen', icon: FileText },
                    { href: '/rekapitulasi', label: 'Rekapitulasi', icon: BarChart3 },
                    { href: '/ekspor', label: 'Ekspor Laporan', icon: Download },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      className="flex flex-col items-start gap-2 rounded-lg border border-border p-3 text-xs font-medium text-ink-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-soft-sm dark:hover:bg-brand-950/30">
                      <a.icon className="h-4 w-4" />
                      {a.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Activity timeline */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-brand-600" /> Linimasa Aktivitas</CardTitle>
                  <Link href="/log/aktivitas" className="text-xs font-medium text-brand-600 hover:text-brand-700">Semua →</Link>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                  ) : riwayat.length === 0 ? (
                    <EmptyState title="Belum ada aktivitas" description="Aktivitas dokumen akan tercatat di sini." />
                  ) : (
                    <ol className="relative space-y-4 border-l border-border-subtle pl-4">
                      {riwayat.map(r => (
                        <li key={r.id} className="relative">
                          <span
                            className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface-raised"
                            style={{ background: WARNA_RIWAYAT[r.warna] || '#9ca3af' }}
                          />
                          <p className="text-xs text-ink-primary">{r.keterangan}</p>
                          {docsById[r.dokumen_id] && (
                            <Link href={`/dokumen/${r.dokumen_id}`} className="text-[11px] font-medium text-brand-600 hover:text-brand-700">
                              {docsById[r.dokumen_id].nama_dokumen}
                            </Link>
                          )}
                          <p className="mt-0.5 text-[11px] text-ink-tertiary">
                            {new Date(r.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
