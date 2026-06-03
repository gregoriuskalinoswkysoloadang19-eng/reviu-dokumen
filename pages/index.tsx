import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { STATUS_COLOR, STATUS_BADGE } from '@/lib/constants'

type Dok = {
  id:string; nomor_laporan:string; nama_dokumen:string; kategori:string
  status:string; progres:number; tanggal_diajukan:string
  target_selesai:string|null; tanggal_selesai:string|null
  pic:string|null; file_url:string|null; laporan_url:string|null
}

export default function DashboardPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('dokumen').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setDok(data || []); setLoading(false) })
  }, [])

  const total = dok.length
  const selesai = dok.filter(d => d.status === 'Selesai').length
  const proses = dok.filter(d => d.status === 'Dalam Proses').length
  const revisi = dok.filter(d => d.status === 'Perlu Revisi').length
  const penyusunan = dok.filter(d => d.status === 'Penyusunan Laporan Hasil Reviu').length
  const belum = dok.filter(d => d.status === 'Belum Direviu').length
  const sisa = total - selesai
  const pct = total ? Math.round(selesai / total * 100) : 0

  const today = new Date()
  const overdue = dok.filter(d => d.target_selesai && d.status !== 'Selesai' && new Date(d.target_selesai) < today)
  const h1 = dok.filter(d => {
    if (!d.target_selesai || d.status === 'Selesai') return false
    const diff = Math.ceil((new Date(d.target_selesai).getTime() - today.getTime()) / 86400000)
    return diff >= 0 && diff <= 1
  })
  const h3 = dok.filter(d => {
    if (!d.target_selesai || d.status === 'Selesai') return false
    const diff = Math.ceil((new Date(d.target_selesai).getTime() - today.getTime()) / 86400000)
    return diff >= 0 && diff <= 3
  })
  const h7 = dok.filter(d => {
    if (!d.target_selesai || d.status === 'Selesai') return false
    const diff = Math.ceil((new Date(d.target_selesai).getTime() - today.getTime()) / 86400000)
    return diff >= 0 && diff <= 7
  })

  // Grafik per kategori
  const katData = ['Perencanaan', 'Keuangan', 'Kinerja'].map(k => ({
    name: k,
    Selesai: dok.filter(d => d.kategori === k && d.status === 'Selesai').length,
    'Dalam Proses': dok.filter(d => d.kategori === k && d.status === 'Dalam Proses').length,
    'Perlu Revisi': dok.filter(d => d.kategori === k && d.status === 'Perlu Revisi').length,
    'Belum Direviu': dok.filter(d => d.kategori === k && d.status === 'Belum Direviu').length,
  }))

  // Tren bulanan (6 bulan terakhir)
  const trenData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const bln = d.getMonth(); const thn = d.getFullYear()
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    return {
      name: label,
      Masuk: dok.filter(x => { const t = new Date(x.tanggal_diajukan); return t.getMonth()===bln && t.getFullYear()===thn }).length,
      Selesai: dok.filter(x => { if(!x.tanggal_selesai) return false; const t = new Date(x.tanggal_selesai); return t.getMonth()===bln && t.getFullYear()===thn }).length,
    }
  })

  // Pie data
  const pieData = [
    { name: 'Selesai', value: selesai },
    { name: 'Penyusunan LHR', value: penyusunan },
    { name: 'Dalam Proses', value: proses },
    { name: 'Perlu Revisi', value: revisi },
    { name: 'Belum Direviu', value: belum },
  ].filter(d => d.value > 0)

  const PIE_COLORS = ['#16a34a','#7c3aed','#2563eb','#d97706','#9ca3af']

  const diffDays = (tgl: string) => Math.ceil((new Date(tgl).getTime() - today.getTime()) / 86400000)

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  return (
    <>
      <Head><title>Dashboard — Monitoring Reviu Dokumen</title></Head>
      <Layout>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Inspektorat Kabupaten Sumba Barat · Monitoring Reviu Dokumen</p>
            </div>
            <Link href="/register" className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Register Dokumen
            </Link>
          </div>

          {/* Banner kosong */}
          {total === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Belum ada dokumen.</strong> Mulai dengan <Link href="/register" className="underline font-medium">mendaftarkan dokumen baru</Link>.
            </div>
          )}

          {/* Alert overdue & deadline */}
          {overdue.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-800 mb-2">⚠️ {overdue.length} dokumen melewati deadline!</p>
              <div className="flex flex-wrap gap-2">
                {overdue.slice(0,3).map(d => (
                  <Link key={d.id} href={`/dokumen/${d.id}`}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200 truncate max-w-[200px]">
                    {d.nama_dokumen}
                  </Link>
                ))}
                {overdue.length > 3 && <span className="text-xs text-red-600">+{overdue.length-3} lainnya</span>}
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label:'Total Masuk', value:total, color:'text-blue-700', bg:'bg-blue-50' },
              { label:'Selesai Direviu', value:selesai, color:'text-green-700', bg:'bg-green-50' },
              { label:'Dalam Proses', value:proses, color:'text-blue-600', bg:'bg-blue-50' },
              { label:'Penyusunan LHR', value:penyusunan, color:'text-purple-700', bg:'bg-purple-50' },
              { label:'Perlu Revisi', value:revisi, color:'text-amber-700', bg:'bg-amber-50' },
              { label:'Overdue', value:overdue.length, color:'text-red-700', bg:'bg-red-50' },
            ].map(m => (
              <div key={m.label} className={`card p-4 ${m.bg}`}>
                <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
                <p className={`text-3xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar chart */}
            <div className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Progres per Kategori</h2>
              {total === 0 ? <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Belum ada data</div> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={katData} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="name" tick={{fontSize:11}}/>
                    <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                    <Tooltip/>
                    <Bar dataKey="Selesai" fill="#16a34a" radius={[2,2,0,0]}/>
                    <Bar dataKey="Dalam Proses" fill="#2563eb" radius={[2,2,0,0]}/>
                    <Bar dataKey="Perlu Revisi" fill="#d97706" radius={[2,2,0,0]}/>
                    <Bar dataKey="Belum Direviu" fill="#d1d5db" radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie + ringkasan */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Distribusi Status</h2>
              {total === 0 ? <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Belum ada data</div> : (
                <>
                  <div className="flex justify-center">
                    <PieChart width={140} height={140}>
                      <Pie data={pieData} cx={65} cy={65} innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-green-700">{pct}%</span>
                    <span className="text-xs text-gray-500 ml-1">selesai</span>
                  </div>
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs py-0.5 border-b border-gray-50 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:PIE_COLORS[i]}}></span>
                        <span className="truncate max-w-[120px]">{d.name}</span>
                      </span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Tren bulanan */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Tren Bulanan (6 Bulan Terakhir)</h2>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trenData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/>
                <Line type="monotone" dataKey="Masuk" stroke="#2563eb" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="Selesai" stroke="#16a34a" strokeWidth={2} dot={{r:3}}/>
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-4 h-0.5 bg-blue-600 rounded"></span>Dokumen Masuk</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-4 h-0.5 bg-green-600 rounded"></span>Selesai Direviu</span>
            </div>
          </div>

          {/* Deadline mendekat */}
          {h7.length > 0 && (
            <div className="card">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">⏰ Deadline Mendekat</h2>
                <div className="flex gap-2 text-xs">
                  {h1.length > 0 && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">H-1: {h1.length}</span>}
                  {h3.length > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">H-3: {h3.length}</span>}
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">H-7: {h7.length}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {h7.slice(0,5).map(d => {
                  const diff = diffDays(d.target_selesai!)
                  const urgent = diff <= 1
                  const warn = diff <= 3
                  return (
                    <Link key={d.id} href={`/dokumen/${d.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.nama_dokumen}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.nomor_laporan} · {d.kategori}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${urgent?'bg-red-100 text-red-700':warn?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>
                          {diff === 0 ? 'Hari ini!' : `H-${diff}`}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{d.target_selesai}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dokumen terbaru */}
          {total > 0 && (
            <div className="card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Dokumen Terbaru</h2>
                <Link href="/dokumen" className="text-xs text-blue-600 hover:text-blue-700">Lihat semua →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No','Nama Dokumen','Kategori','PIC','Tgl Diajukan','Status','Progres'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dok.slice(0, 5).map((d, i) => (
                      <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px]">
                          <Link href={`/dokumen/${d.id}`} className="hover:text-blue-600 truncate block">{d.nama_dokumen}</Link>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{d.kategori}</td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-[100px] truncate">{d.pic||'—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                        <td className="px-4 py-2.5">
                          <span className={STATUS_BADGE[d.status]||'badge-belum'}>{d.status}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{width:`${d.progres}%`,background:STATUS_COLOR[d.status]}}></div>
                            </div>
                            <span className="text-gray-500">{d.progres}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
