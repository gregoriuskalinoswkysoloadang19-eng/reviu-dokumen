import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Dok = { id:string; nomor_laporan:string; nama_dokumen:string; kategori:string; status:string; progres:number; tanggal_diajukan:string; tanggal_selesai:string|null; file_url:string|null; file_name:string|null; laporan_url:string|null; laporan_name:string|null }
const SC:Record<string,string> = { 'Selesai':'#16a34a','Dalam Proses':'#2563eb','Perlu Revisi':'#d97706','Belum Direviu':'#9ca3af' }

export default function DashboardPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('dokumen').select('*').order('created_at',{ascending:false}).then(({data}) => {
      setDok(data||[])
      setLoading(false)
    })
  }, [])

  const total=dok.length, selesai=dok.filter(d=>d.status==='Selesai').length
  const proses=dok.filter(d=>d.status==='Dalam Proses').length
  const revisi=dok.filter(d=>d.status==='Perlu Revisi').length
  const belum=dok.filter(d=>d.status==='Belum Direviu').length
  const sisa=total-selesai
  const pct=total?Math.round(selesai/total*100):0

  const katData=['Perencanaan','Keuangan','Kinerja'].map(k=>({
    name:k,
    Selesai:dok.filter(d=>d.kategori===k&&d.status==='Selesai').length,
    'Dalam Proses':dok.filter(d=>d.kategori===k&&d.status==='Dalam Proses').length,
    'Perlu Revisi':dok.filter(d=>d.kategori===k&&d.status==='Perlu Revisi').length,
    'Belum Direviu':dok.filter(d=>d.kategori===k&&d.status==='Belum Direviu').length,
  }))

  const pieData=[
    {name:'Selesai',value:selesai},{name:'Dalam Proses',value:proses},
    {name:'Perlu Revisi',value:revisi},{name:'Belum Direviu',value:belum},
  ].filter(d=>d.value>0)

  const badge=(s:string)=>{
    const m:Record<string,string>={Selesai:'badge-selesai','Dalam Proses':'badge-proses','Belum Direviu':'badge-belum','Perlu Revisi':'badge-revisi'}
    return <span className={m[s]||'badge-belum'}>{s}</span>
  }

  async function dlFile(url:string, bucket='dokumen-reviu') {
    const {data}=await supabase.storage.from(bucket).createSignedUrl(url,60)
    if(data?.signedUrl) window.open(data.signedUrl,'_blank')
  }

  if(loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>

  return (
    <>
      <Head><title>Dashboard — Monitoring Reviu Dokumen</title></Head>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Inspektorat Kabupaten Sumba Barat · Perencanaan, Keuangan &amp; Kinerja</p>
          </div>

          {total===0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Belum ada dokumen.</strong> Mulai dengan <Link href="/register" className="underline font-medium">mendaftarkan dokumen baru</Link> atau jalankan SQL data sample di Supabase.
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {label:'Total Dokumen Masuk',value:total,color:'text-blue-700'},
              {label:'Sudah Selesai Direviu',value:selesai,color:'text-green-700'},
              {label:'Dalam Proses Reviu',value:proses,color:'text-amber-700'},
              {label:'Perlu Revisi',value:revisi,color:'text-orange-700'},
              {label:'Sisa Belum Direviu',value:sisa,color:'text-red-700'},
            ].map(m=>(
              <div key={m.label} className="card p-4">
                <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
                <p className={`text-3xl font-semibold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Progres reviu per kategori</h2>
              {total===0 ? <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada data</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={katData} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="name" tick={{fontSize:12}}/>
                    <YAxis tick={{fontSize:12}} allowDecimals={false}/>
                    <Tooltip/>
                    <Bar dataKey="Selesai" fill="#16a34a" radius={[2,2,0,0]}/>
                    <Bar dataKey="Dalam Proses" fill="#2563eb" radius={[2,2,0,0]}/>
                    <Bar dataKey="Perlu Revisi" fill="#d97706" radius={[2,2,0,0]}/>
                    <Bar dataKey="Belum Direviu" fill="#d1d5db" radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Distribusi status &amp; ringkasan kinerja</h2>
              {total===0 ? <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada data</div> : (
                <div className="flex items-center gap-4">
                  <PieChart width={120} height={120}>
                    <Pie data={pieData} cx={55} cy={55} innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={2}>
                      {pieData.map((e,i)=><Cell key={i} fill={SC[e.name]}/>)}
                    </Pie>
                  </PieChart>
                  <div className="flex-1">
                    <div className="text-3xl font-semibold text-green-700">{pct}%</div>
                    <div className="text-xs text-gray-500 mb-3">tingkat penyelesaian</div>
                    {[{n:'Selesai',v:selesai},{n:'Dalam Proses',v:proses},{n:'Perlu Revisi',v:revisi},{n:'Belum Direviu',v:belum}].map(d=>(
                      <div key={d.n} className="flex items-center justify-between text-xs py-0.5 border-b border-gray-100 last:border-0">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:SC[d.n]}}></span>{d.n}</span>
                        <span className="font-medium">{d.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent docs */}
          {total>0 && (
            <div className="card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-700">Dokumen terbaru</h2>
                <Link href="/dokumen" className="text-xs text-blue-600 hover:text-blue-700">Lihat semua →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No','Nama Dokumen','Kategori','Tgl Diajukan','Status','Progres','Dok','Laporan'].map(h=>(
                        <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dok.slice(0,5).map((d,i)=>(
                      <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px] truncate">{d.nama_dokumen}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.kategori}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                        <td className="px-4 py-2.5">{badge(d.status)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{width:`${d.progres}%`,background:SC[d.status]}}></div>
                            </div>
                            <span className="text-gray-500">{d.progres}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {d.file_url
                            ? <button onClick={()=>dlFile(d.file_url!)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Dok</button>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {d.laporan_url
                            ? <button onClick={()=>dlFile(d.laporan_url!,'laporan-reviu')} className="text-green-600 hover:text-green-700 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Lap</button>
                            : <span className="text-gray-300">—</span>}
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
