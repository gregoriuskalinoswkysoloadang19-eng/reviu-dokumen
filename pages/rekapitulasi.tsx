import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Dokumen = {
  id: string; nomor_laporan: string; nama_dokumen: string; kategori: string
  pic: string; tanggal_diajukan: string; tanggal_selesai: string | null
  status: string; progres: number; file_url: string | null; file_name: string | null; file_size: string | null
}

const SC: Record<string, string> = { Selesai: '#16a34a', 'Dalam Proses': '#2563eb', 'Perlu Revisi': '#d97706', 'Belum Direviu': '#9ca3af' }

export default function RekapPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('dokumen').select('*').order('tanggal_diajukan').then(({ data }) => {
      setDokumen(data || [])
      setLoading(false)
    })
  }, [])

  const kats = ['Perencanaan', 'Keuangan', 'Kinerja']
  const selesaiList = dokumen.filter(d => d.status === 'Selesai')

  const chartData = kats.map(k => {
    const sub = dokumen.filter(d => d.kategori === k)
    const cnt = (s: string) => sub.filter(d => d.status === s).length
    return { name: k, Selesai: cnt('Selesai'), 'Dalam Proses': cnt('Dalam Proses'), 'Perlu Revisi': cnt('Perlu Revisi'), 'Belum Direviu': cnt('Belum Direviu') }
  })

  async function handleDownload(d: Dokumen) {
    if (!d.file_url) return
    const { data } = await supabase.storage.from('dokumen-reviu').createSignedUrl(d.file_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>

  return (
    <>
      <Head><title>Rekapitulasi — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Rekapitulasi</h1>
            <p className="text-sm text-gray-500">Ringkasan progres reviu per kategori dan daftar dokumen selesai</p>
          </div>

          {/* Stacked bar chart */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Grafik rekapitulasi per kategori</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {Object.entries(SC).map(([s, c]) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-sm" style={{ background: c }}></span>{s}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Selesai" stackId="a" fill="#16a34a" />
                <Bar dataKey="Dalam Proses" stackId="a" fill="#2563eb" />
                <Bar dataKey="Perlu Revisi" stackId="a" fill="#d97706" />
                <Bar dataKey="Belum Direviu" stackId="a" fill="#d1d5db" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-kategori summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kats.map(k => {
              const sub = dokumen.filter(d => d.kategori === k)
              const sel = sub.filter(d => d.status === 'Selesai').length
              const pct = sub.length ? Math.round(sel / sub.length * 100) : 0
              return (
                <div key={k} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{k}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{sel}/{sub.length} selesai</p>
                    </div>
                    <span className="text-xl font-semibold text-green-700">{pct}%</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {Object.entries(SC).map(([s, c]) => {
                      const n = sub.filter(d => d.status === s).length
                      return n > 0 ? (
                        <span key={s} className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: c }}></span>{s}: {n}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selesai table */}
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-700">Dokumen selesai direviu ({selesaiList.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-8">No</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">No. Laporan</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Kategori</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Tgl Diajukan</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Tgl Selesai</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selesaiList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada dokumen selesai</td></tr>
                  ) : selesaiList.map((d, i) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px] truncate">{d.nama_dokumen}</td>
                      <td className="px-4 py-2.5 text-gray-500">{d.nomor_laporan}</td>
                      <td className="px-4 py-2.5 text-gray-600">{d.kategori}</td>
                      <td className="px-4 py-2.5 text-gray-500">{d.tanggal_diajukan}</td>
                      <td className="px-4 py-2.5 text-gray-500">{d.tanggal_selesai || '—'}</td>
                      <td className="px-4 py-2.5">
                        {d.file_url ? (
                          <button onClick={() => handleDownload(d)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Unduh
                          </button>
                        ) : <span className="text-gray-300">—</span>}
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
