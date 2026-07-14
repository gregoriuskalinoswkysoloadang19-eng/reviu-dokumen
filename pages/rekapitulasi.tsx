import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { STATUS_COLOR, STATUS_BADGE, KATEGORI_LIST } from '@/lib/constants'

type Dok = {
  id:string; nomor_laporan:string; nama_dokumen:string; kategori:string
  pic:string|null; tanggal_diajukan:string; tanggal_selesai:string|null
  target_selesai:string|null; status:string; progres:number
  file_url:string|null; laporan_url:string|null; file_name:string|null; laporan_name:string|null
}

const SC = STATUS_COLOR

export default function RekapPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('dokumen').select('*').order('tanggal_diajukan').then(({ data }) => {
      setDok(data || [])
      setLoading(false)
    })
  }, [])

  async function dlFile(url: string, bucket: string) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const selesaiList = dok.filter(d => d.status === 'Selesai')

  const chartData = KATEGORI_LIST.map(k => {
    const sub = dok.filter(d => d.kategori === k)
    return {
      name: k,
      Selesai: sub.filter(d => d.status === 'Selesai').length,
      'Dalam Proses': sub.filter(d => d.status === 'Dalam Proses').length,
      'Penyusunan LHR': sub.filter(d => d.status === 'Penyusunan Laporan Hasil Reviu').length,
      'Perlu Revisi': sub.filter(d => d.status === 'Perlu Revisi').length,
      'Belum Direviu': sub.filter(d => d.status === 'Belum Direviu').length,
    }
  })

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  return (
    <>
      <Head><title>Rekapitulasi — DRES | Inspectorate of West Sumba Regency</title></Head>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Rekapitulasi</h1>
              <p className="text-sm text-gray-500">Ringkasan progres reviu per kategori</p>
            </div>
            <Link href="/ekspor" className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Ekspor Laporan
            </Link>
          </div>

          {/* Bar chart */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Rekapitulasi per Kategori</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {[['#16a34a','Selesai'],['#7c3aed','Penyusunan LHR'],['#2563eb','Dalam Proses'],['#d97706','Perlu Revisi'],['#d1d5db','Belum Direviu']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{background:c}}></span>{l}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}} allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="Selesai" stackId="a" fill="#16a34a"/>
                <Bar dataKey="Penyusunan LHR" stackId="a" fill="#7c3aed"/>
                <Bar dataKey="Dalam Proses" stackId="a" fill="#2563eb"/>
                <Bar dataKey="Perlu Revisi" stackId="a" fill="#d97706"/>
                <Bar dataKey="Belum Direviu" stackId="a" fill="#d1d5db" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per kategori summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KATEGORI_LIST.map(k => {
              const sub = dok.filter(d => d.kategori === k)
              const sel = sub.filter(d => d.status === 'Selesai').length
              const pct = sub.length ? Math.round(sel / sub.length * 100) : 0
              const statusCount: Record<string,number> = {}
              sub.forEach(d => statusCount[d.status] = (statusCount[d.status]||0)+1)
              return (
                <div key={k} className="card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{k}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{sel}/{sub.length} selesai</p>
                    </div>
                    <span className="text-2xl font-bold text-green-700">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}></div>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(statusCount).map(([s,n]) => (
                      <div key={s} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:SC[s]||'#9ca3af'}}></span>
                          <span className="text-gray-600 truncate max-w-[140px]">{s}</span>
                        </span>
                        <span className="font-semibold text-gray-700">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabel dokumen selesai */}
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Dokumen Selesai Direviu ({selesaiList.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{minWidth:'700px'}}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-8">No</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-24">No. Laporan</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-22">Kategori</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-24">PIC</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-24">Tgl Diajukan</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-24">Tgl Selesai</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-20">File Dok</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-20">File LHR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selesaiList.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">Belum ada dokumen selesai direviu</td></tr>
                  ) : selesaiList.map((d, i) => {
                    // Validasi: tanggal selesai tidak boleh lebih awal dari tanggal diajukan
                    const tglAnomali = d.tanggal_selesai && d.tanggal_selesai < d.tanggal_diajukan
                    return (
                      <tr key={d.id} className={`hover:bg-gray-50 ${tglAnomali ? 'bg-amber-50' : ''}`}>
                        <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[180px]">
                          <Link href={`/dokumen/${d.id}`} className="hover:text-blue-600 truncate block">{d.nama_dokumen}</Link>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{d.nomor_laporan}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.kategori}</td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-[96px] truncate">{d.pic||'—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={tglAnomali ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                            {d.tanggal_selesai||'—'}
                          </span>
                          {tglAnomali && <span className="block text-xs text-amber-500">⚠ Cek tanggal</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {d.file_url
                            ? <button onClick={()=>dlFile(d.file_url!,'dokumen-reviu')} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                              </button>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {d.laporan_url
                            ? <button onClick={()=>dlFile(d.laporan_url!,'laporan-reviu')} className="text-green-600 hover:text-green-800 flex items-center gap-1 font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                              </button>
                            : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
