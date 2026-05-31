import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Dokumen = {
  id: string
  nomor_laporan: string
  nama_dokumen: string
  kategori: string
  status: string
  progres: number
  tanggal_diajukan: string
  tanggal_selesai: string | null
}

const STATUS_COLORS: Record<string, string> = {
  'Selesai': '#16a34a',
  'Dalam Proses': '#2563eb',
  'Perlu Revisi': '#d97706',
  'Belum Direviu': '#9ca3af',
}

export default function DashboardPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDokumen()
  }, [])

  async function fetchDokumen() {
    const { data } = await supabase.from('dokumen').select('*').order('tanggal_diajukan', { ascending: false })
    setDokumen(data || [])
    setLoading(false)
  }

  const total = dokumen.length
  const selesai = dokumen.filter(d => d.status === 'Selesai').length
  const proses = dokumen.filter(d => d.status === 'Dalam Proses').length
  const revisi = dokumen.filter(d => d.status === 'Perlu Revisi').length
  const belum = dokumen.filter(d => d.status === 'Belum Direviu').length
  const sisa = total - selesai
  const pctSelesai = total ? Math.round(selesai / total * 100) : 0

  const kategoriData = ['Perencanaan', 'Keuangan', 'Kinerja'].map(k => {
    const sub = dokumen.filter(d => d.kategori === k)
    return {
      name: k,
      Selesai: sub.filter(d => d.status === 'Selesai').length,
      'Dalam Proses': sub.filter(d => d.status === 'Dalam Proses').length,
      'Perlu Revisi': sub.filter(d => d.status === 'Perlu Revisi').length,
      'Belum Direviu': sub.filter(d => d.status === 'Belum Direviu').length,
    }
  })

  const pieData = [
    { name: 'Selesai', value: selesai },
    { name: 'Dalam Proses', value: proses },
    { name: 'Perlu Revisi', value: revisi },
    { name: 'Belum Direviu', value: belum },
  ].filter(d => d.value > 0)

  const dokumenTerbaru = dokumen.slice(0, 5)

  const getBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      'Selesai': 'badge-selesai',
      'Dalam Proses': 'badge-proses',
      'Perlu Revisi': 'badge-revisi',
      'Belum Direviu': 'badge-belum',
    }
    return map[status] || 'badge-belum'
  }

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
        <div className="space-y-6">
          {/* Page title */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Monitoring reviu dokumen perencanaan, keuangan, dan kinerja</p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Dokumen Masuk', value: total, color: 'text-blue-700' },
              { label: 'Sudah Selesai Direviu', value: selesai, color: 'text-green-700' },
              { label: 'Dalam Proses Reviu', value: proses, color: 'text-amber-700' },
              { label: 'Perlu Revisi', value: revisi, color: 'text-orange-700' },
              { label: 'Sisa Belum Direviu', value: sisa, color: 'text-red-700' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
                <p className={`text-3xl font-semibold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar chart */}
            <div className="card p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Progres reviu per kategori</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kategoriData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Selesai" fill="#16a34a" radius={[2,2,0,0]} />
                  <Bar dataKey="Dalam Proses" fill="#2563eb" radius={[2,2,0,0]} />
                  <Bar dataKey="Perlu Revisi" fill="#d97706" radius={[2,2,0,0]} />
                  <Bar dataKey="Belum Direviu" fill="#d1d5db" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie + summary */}
            <div className="card p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Distribusi status &amp; ringkasan kinerja</h2>
              <div className="flex items-center gap-4">
                <PieChart width={120} height={120}>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name]} />)}
                  </Pie>
                </PieChart>
                <div className="flex-1">
                  <div className="text-3xl font-semibold text-green-700">{pctSelesai}%</div>
                  <div className="text-xs text-gray-500 mb-3">tingkat penyelesaian</div>
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs py-0.5 border-b border-gray-100 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }}></span>
                        {d.name}
                      </span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent docs */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-700">Dokumen terbaru</h2>
              <Link href="/dokumen" className="text-xs text-blue-600 hover:text-blue-700">Lihat semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nomor</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Kategori</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Tgl Diajukan</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {dokumenTerbaru.map(d => (
                    <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-500">{d.nomor_laporan}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[180px] truncate">{d.nama_dokumen}</td>
                      <td className="px-4 py-2.5 text-gray-600">{d.kategori}</td>
                      <td className="px-4 py-2.5 text-gray-500">{d.tanggal_diajukan}</td>
                      <td className="px-4 py-2.5"><span className={getBadgeClass(d.status)}>{d.status}</span></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${d.progres}%`, background: STATUS_COLORS[d.status] }}></div>
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
        </div>
      </Layout>
    </>
  )
}
