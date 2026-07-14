import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
type Riw = {id:string; keterangan:string; warna:string; created_at:string}

const STATUS_PROGRES: Record<string,number> = {
  'Belum Direviu':0,'Perlu Revisi':25,'Dalam Proses':50,
  'Penyusunan Laporan Hasil Reviu':75,'Selesai':100
}
const STATUS_LIST = ['Belum Direviu','Dalam Proses','Perlu Revisi','Penyusunan Laporan Hasil Reviu','Selesai']
const STATUS_COLOR: Record<string,string> = {
  'Belum Direviu':'#9ca3af','Perlu Revisi':'#d97706','Dalam Proses':'#2563eb',
  'Penyusunan Laporan Hasil Reviu':'#7c3aed','Selesai':'#16a34a'
}
const WC:Record<string,string>={g:'#16a34a',b:'#2563eb',a:'#d97706',x:'#9ca3af',v:'#7c3aed'}

export default function DetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [doc, setDoc] = useState<Dok|null>(null)
  const [riw, setRiw] = useState<Riw[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [tglSelesai, setTglSelesai] = useState('')
  const [catatan, setCatatan] = useState('')
  const [laporanFile, setLaporanFile] = useState<File|null>(null)

  useEffect(()=>{ if(id) fetchData() },[id])

  async function fetchData() {
    const [dr,rr]=await Promise.all([
      supabase.from('dokumen').select('*').eq('id',id).single(),
      supabase.from('riwayat').select('*').eq('dokumen_id',id).order('created_at',{ascending:true})
    ])
    if(dr.data){
      setDoc(dr.data); setStatus(dr.data.status)
      setTglSelesai(dr.data.tanggal_selesai||''); setCatatan(dr.data.catatan||'')
    }
    setRiw(rr.data||[]); setLoading(false)
  }

  async function dl(url:string, bucket:string) {
    const {data}=await supabase.storage.from(bucket).createSignedUrl(url,60)
    if(data?.signedUrl) window.open(data.signedUrl,'_blank')
  }

  async function saveStatus() {
    if(!doc) return; setSaving(true)
    const progresOtomatis = STATUS_PROGRES[status] ?? 0
    const w = status==='Selesai'?'g':status==='Penyusunan Laporan Hasil Reviu'?'v':status==='Perlu Revisi'?'a':status==='Dalam Proses'?'b':'x'
    await supabase.from('dokumen').update({
      status, progres:progresOtomatis,
      tanggal_selesai:tglSelesai||null,
      updated_at:new Date().toISOString()
    }).eq('id',doc.id)
    await supabase.from('riwayat').insert({
      dokumen_id:doc.id,
      keterangan:`Status diperbarui: ${status} (${progresOtomatis}%)`,
      warna:w
    })
    await fetchData(); setSaving(false)
  }

  async function saveCatatan() {
    if(!doc) return; setSaving(true)
    await supabase.from('dokumen').update({catatan,updated_at:new Date().toISOString()}).eq('id',doc.id)
    await supabase.from('riwayat').insert({dokumen_id:doc.id,keterangan:'Catatan reviu diperbarui',warna:'b'})
    await fetchData(); setSaving(false)
  }

  async function uploadLaporan() {
    if(!doc||!laporanFile) return
    setUploading(true)
    const path=`${Date.now()}_${laporanFile.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const {error:upErr}=await supabase.storage.from('laporan-reviu').upload(path,laporanFile)
    if(upErr){alert('Gagal upload: '+upErr.message);setUploading(false);return}
    const sz=laporanFile.size>1024*1024?`${(laporanFile.size/1024/1024).toFixed(1)} MB`:`${Math.round(laporanFile.size/1024)} KB`
    await supabase.from('dokumen').update({
      laporan_url:path,laporan_name:laporanFile.name,laporan_size:sz,
      updated_at:new Date().toISOString()
    }).eq('id',doc.id)
    await supabase.from('riwayat').insert({
      dokumen_id:doc.id,keterangan:`Laporan hasil reviu diupload: ${laporanFile.name}`,warna:'g'
    })
    setLaporanFile(null); await fetchData(); setUploading(false)
  }

  const badge=(s:string)=>{
    const m:Record<string,string>={
      Selesai:'badge-selesai','Dalam Proses':'badge-proses',
      'Belum Direviu':'badge-belum','Perlu Revisi':'badge-revisi',
      'Penyusunan Laporan Hasil Reviu':'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700'
    }
    return <span className={m[s]||'badge-belum'}>{s}</span>
  }

  const progresOtomatis = STATUS_PROGRES[status] ?? 0

  if(loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>
  if(!doc) return <Layout><div className="text-center py-12 text-gray-500">Dokumen tidak ditemukan.</div></Layout>

  return (
    <>
      <Head><title>{doc.nama_dokumen} — Detail Reviu</title></Head>
      <Layout>
        <div className="space-y-5 max-w-3xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link href="/dokumen" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
            <Link href={`/dokumen/edit/${doc.id}`} className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Dokumen
            </Link>
          </div>

          {/* Header */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-base font-semibold text-gray-900">{doc.nama_dokumen}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{doc.nomor_laporan} · {doc.kategori} · PIC: {doc.pic}</p>
              </div>
              {badge(doc.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
              {[
                {label:'Tgl Diajukan',value:doc.tanggal_diajukan},
                {label:'Target Selesai',value:doc.target_selesai||'—'},
                {label:'Tgl Selesai Reviu',value:doc.tanggal_selesai||'Belum selesai'},
                {label:'Progres',value:`${doc.progres}%`},
              ].map(f=>(
                <div key={f.label}>
                  <p className="text-xs text-gray-500">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* File Dokumen Asli */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">File Dokumen Asli</h2>
            {doc.file_url ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <svg className="w-7 h-7 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">{doc.file_size}</p>
                </div>
                <button onClick={()=>dl(doc.file_url!,'dokumen-reviu')} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Unduh Dokumen
                </button>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 text-center">Belum ada file dokumen</div>
            )}
          </div>

          {/* Laporan Hasil Reviu */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Laporan Hasil Reviu</h2>
            {doc.laporan_url ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100 mb-3">
                <svg className="w-7 h-7 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.laporan_name}</p>
                  <p className="text-xs text-gray-500">{doc.laporan_size}</p>
                </div>
                <button onClick={()=>dl(doc.laporan_url!,'laporan-reviu')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Unduh Laporan
                </button>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400 text-center mb-3">Belum ada laporan hasil reviu</div>
            )}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Upload laporan hasil reviu (PDF, DOCX, ZIP — maks 20MB)</p>
              <div className="flex gap-2 flex-wrap items-center">
                <label className="flex-1 min-w-48">
                  <div className="border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs text-gray-500 text-center">
                    {laporanFile
                      ? <span className="text-blue-700 font-medium">{laporanFile.name} ({(laporanFile.size/1024).toFixed(0)} KB)</span>
                      : '📎 Pilih file laporan...'}
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx,.xlsx,.zip,.rar" className="hidden" onChange={e=>setLaporanFile(e.target.files?.[0]||null)}/>
                </label>
                <button onClick={uploadLaporan} disabled={!laporanFile||uploading} className="btn-primary text-xs py-2 px-4 disabled:opacity-40">
                  {uploading?'Mengupload...':'Upload Laporan'}
                </button>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Update Status Reviu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
                  {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Progres <span className="text-xs text-gray-400 font-normal">(otomatis)</span></label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{width:`${progresOtomatis}%`,background:STATUS_COLOR[status]}}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10">{progresOtomatis}%</span>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="label">Tanggal Selesai</label>
              <input type="date" className="input max-w-xs" value={tglSelesai} onChange={e=>setTglSelesai(e.target.value)}/>
            </div>
            {/* Legenda status */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              {STATUS_LIST.map(s=>(
                <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:STATUS_COLOR[s]}}></span>
                  {s} = {STATUS_PROGRES[s]}%
                </span>
              ))}
            </div>
            <button onClick={saveStatus} disabled={saving} className="btn-primary">{saving?'Menyimpan...':'Simpan Status'}</button>
          </div>

          {/* Catatan */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Catatan Hasil Reviu</h2>
            <textarea className="input min-h-24 resize-y" value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Tulis catatan reviu..."/>
            <button onClick={saveCatatan} disabled={saving} className="btn-secondary mt-2 text-xs">{saving?'Menyimpan...':'Simpan Catatan'}</button>
          </div>

          {/* Riwayat */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Riwayat Aktivitas</h2>
            <div className="space-y-3">
              {riw.map(r=>(
                <div key={r.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:WC[r.warna]||'#9ca3af'}}></div>
                    <div className="w-px flex-1 bg-gray-100 mt-1"></div>
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-gray-700">{r.keterangan}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                </div>
              ))}
              {riw.length===0 && <p className="text-sm text-gray-400">Belum ada riwayat.</p>}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
