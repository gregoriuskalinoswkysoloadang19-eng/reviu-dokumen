import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Dok = {
  id:string; nomor_laporan:string; nama_dokumen:string; kategori:string; pic:string
  tanggal_diajukan:string; target_selesai:string|null; tanggal_selesai:string|null
  status:string; progres:number; catatan:string|null
  file_url:string|null; file_name:string|null; file_size:string|null
  laporan_url:string|null; laporan_name:string|null; laporan_size:string|null
}

const SC:Record<string,string>={Selesai:'#16a34a','Dalam Proses':'#2563eb','Perlu Revisi':'#d97706','Belum Direviu':'#9ca3af'}

export default function DokumenPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fKat, setFKat] = useState('')
  const [deleting, setDeleting] = useState<string|null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(()=>{fetchData()},[])

  async function fetchData() {
    setLoading(true)
    const {data, error}=await supabase.from('dokumen').select('*').order('created_at',{ascending:false})
    if(error) console.error('Fetch error:', error)
    setDok(data||[])
    setLoading(false)
  }

  const badge=(s:string)=>{
    const m:Record<string,string>={Selesai:'badge-selesai','Dalam Proses':'badge-proses','Belum Direviu':'badge-belum','Perlu Revisi':'badge-revisi'}
    return <span className={m[s]||'badge-belum'}>{s}</span>
  }

  const filtered=dok.filter(d=>
    (!search||d.nama_dokumen.toLowerCase().includes(search.toLowerCase())||d.nomor_laporan.includes(search))&&
    (!fStatus||d.status===fStatus)&&(!fKat||d.kategori===fKat)
  )

  async function dlFile(url:string, bucket:string) {
    const {data}=await supabase.storage.from(bucket).createSignedUrl(url,60)
    if(data?.signedUrl) window.open(data.signedUrl,'_blank')
  }

  async function handleDelete(d:Dok) {
    if(!confirm(`Hapus dokumen "${d.nama_dokumen}"?\n\nTindakan ini tidak dapat dibatalkan.`)) return
    setDeleting(d.id)
    setDeleteError('')
    try {
      // Hapus file dari storage jika ada
      if(d.file_url) {
        await supabase.storage.from('dokumen-reviu').remove([d.file_url])
      }
      if(d.laporan_url) {
        await supabase.storage.from('laporan-reviu').remove([d.laporan_url])
      }
      // Hapus riwayat dulu (foreign key)
      const {error: rErr} = await supabase.from('riwayat').delete().eq('dokumen_id', d.id)
      if(rErr) throw new Error('Gagal hapus riwayat: ' + rErr.message)
      // Hapus dokumen
      const {error: dErr} = await supabase.from('dokumen').delete().eq('id', d.id)
      if(dErr) throw new Error('Gagal hapus dokumen: ' + dErr.message)
      // Refresh data
      await fetchData()
    } catch(err: any) {
      setDeleteError(err.message || 'Gagal menghapus dokumen')
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Head><title>Daftar Dokumen — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Daftar Dokumen</h1>
              <p className="text-sm text-gray-500">{dok.length} dokumen terdaftar</p>
            </div>
            <Link href="/register" className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Register Dokumen
            </Link>
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
              <span>{deleteError}</span>
              <button onClick={()=>setDeleteError('')} className="text-red-400 hover:text-red-600 ml-3">✕</button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <input className="input flex-1 min-w-48 max-w-xs" placeholder="Cari nama / nomor..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="input w-44" value={fStatus} onChange={e=>setFStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {['Selesai','Dalam Proses','Perlu Revisi','Belum Direviu'].map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="input w-40" value={fKat} onChange={e=>setFKat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {['Perencanaan','Keuangan','Kinerja'].map(k=><option key={k}>{k}</option>)}
            </select>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{tableLayout:'fixed',minWidth:'960px'}}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-7">No</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-44">Nama Dokumen</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">No. Laporan</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Kategori</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Tgl Diajukan</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Tgl Selesai</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Status</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-20">Progres</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-16">Dok</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-16">Laporan</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={11} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Memuat...</div>
                    </td></tr>
                  ) : filtered.length===0 ? (
                    <tr><td colSpan={11} className="text-center py-12 text-gray-400">
                      {dok.length===0 ? <>Belum ada dokumen. <Link href="/register" className="text-blue-600 underline">Register sekarang</Link></> : 'Tidak ada dokumen ditemukan'}
                    </td></tr>
                  ) : filtered.map((d,i)=>(
                    <tr key={d.id} className={`hover:bg-gray-50 ${deleting===d.id?'opacity-40':''}`}>
                      <td className="px-3 py-2.5 text-gray-400">{i+1}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800"><div className="truncate" title={d.nama_dokumen}>{d.nama_dokumen}</div></td>
                      <td className="px-3 py-2.5 text-gray-500 truncate">{d.nomor_laporan}</td>
                      <td className="px-3 py-2.5 text-gray-600">{d.kategori}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_selesai||'—'}</td>
                      <td className="px-3 py-2.5">{badge(d.status)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${d.progres}%`,background:SC[d.status]}}></div>
                          </div>
                          <span className="text-gray-500">{d.progres}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {d.file_url
                          ? <button onClick={()=>dlFile(d.file_url!,'dokumen-reviu')} className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                            </button>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {d.laporan_url
                          ? <button onClick={()=>dlFile(d.laporan_url!,'laporan-reviu')} className="text-green-600 hover:text-green-800 flex items-center gap-0.5 font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                            </button>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Link href={`/dokumen/${d.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Detail</Link>
                          <span className="text-gray-200">|</span>
                          <Link href={`/dokumen/edit/${d.id}`} className="text-amber-600 hover:text-amber-800 font-medium">Edit</Link>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={()=>handleDelete(d)}
                            disabled={!!deleting}
                            className="text-red-500 hover:text-red-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {deleting===d.id?'Menghapus...':'Hapus'}
                          </button>
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
