import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Log = {
  id:string; keterangan:string; warna:string; created_at:string; dokumen_id:string|null
  dokumen?: { nama_dokumen:string; nomor_laporan:string }
  created_by_user?: { nama:string; email:string }
  created_by:string|null
}

const WC:Record<string,string>={g:'#16a34a',b:'#2563eb',a:'#d97706',x:'#9ca3af',v:'#7c3aed',r:'#dc2626'}
const WLabel:Record<string,string>={g:'Selesai',b:'Proses',a:'Revisi',x:'Info',v:'Penyusunan',r:'Hapus'}

export default function LogAktivitas() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fWarna, setFWarna] = useState('')
  const [fTgl, setFTgl] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 30

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('riwayat')
      .select(`*, dokumen:dokumen_id(nama_dokumen, nomor_laporan)`)
      .order('created_at', { ascending: false })
      .limit(500)
    setLogs(data || [])
    setLoading(false)
  }

  const filtered = logs.filter(l => {
    const tgl = l.created_at.slice(0,10)
    return (
      (!search || l.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        (l.dokumen?.nama_dokumen||'').toLowerCase().includes(search.toLowerCase())) &&
      (!fWarna || l.warna === fWarna) &&
      (!fTgl || tgl === fTgl)
    )
  })

  const paginated = filtered.slice(page * PER_PAGE, (page+1) * PER_PAGE)
  const totalPage = Math.ceil(filtered.length / PER_PAGE)

  return (
    <>
      <Head><title>Log Aktivitas — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-5">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Log Aktivitas</h1>
            <p className="text-sm text-gray-500">Audit trail semua perubahan dokumen · {filtered.length} entri</p>
          </div>

          {/* Filter */}
          <div className="card p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="input col-span-1 md:col-span-1" placeholder="Cari aktivitas atau nama dokumen..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}/>
              <select className="input" value={fWarna} onChange={e=>{setFWarna(e.target.value);setPage(0)}}>
                <option value="">Semua Jenis</option>
                <option value="g">✅ Selesai</option>
                <option value="b">🔵 Dalam Proses</option>
                <option value="a">🟡 Perlu Revisi</option>
                <option value="v">🟣 Penyusunan LHR</option>
                <option value="x">⚪ Info/Lainnya</option>
              </select>
              <input type="date" className="input" value={fTgl} onChange={e=>{setFTgl(e.target.value);setPage(0)}} title="Filter tanggal"/>
            </div>
          </div>

          {/* Log timeline */}
          <div className="card p-5">
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Tidak ada log aktivitas</div>
            ) : (
              <>
                <div className="space-y-0">
                  {paginated.map((log, i) => (
                    <div key={log.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-4 flex-shrink-0 ring-2 ring-white"
                          style={{background:WC[log.warna]||'#9ca3af'}}></div>
                        {i < paginated.length-1 && <div className="w-px flex-1 bg-gray-100 mt-1"></div>}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{log.keterangan}</p>
                            {log.dokumen && (
                              <Link href={`/dokumen/${log.dokumen_id}`}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-0.5 block truncate">
                                📄 {log.dokumen.nomor_laporan} — {log.dokumen.nama_dokumen}
                              </Link>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{background:WC[log.warna]||'#9ca3af'}}>
                              {WLabel[log.warna]||'Info'}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPage > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                    <span className="text-xs text-gray-500">Halaman {page+1} dari {totalPage}</span>
                    <div className="flex gap-2">
                      <button onClick={()=>setPage(p=>p-1)} disabled={page===0} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">← Sebelumnya</button>
                      <button onClick={()=>setPage(p=>p+1)} disabled={page>=totalPage-1} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Berikutnya →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
