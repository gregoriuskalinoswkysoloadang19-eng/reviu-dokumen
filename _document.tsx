import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

const STATUS_PROGRES: Record<string, number> = {
  'Belum Direviu': 0,
  'Perlu Revisi': 25,
  'Dalam Proses': 50,
  'Penyusunan Laporan Hasil Reviu': 75,
  'Selesai': 100,
}
const STATUS_LIST = ['Belum Direviu','Dalam Proses','Perlu Revisi','Penyusunan Laporan Hasil Reviu','Selesai']
const STATUS_COLOR: Record<string,string> = {
  'Belum Direviu':'#9ca3af',
  'Perlu Revisi':'#d97706',
  'Dalam Proses':'#2563eb',
  'Penyusunan Laporan Hasil Reviu':'#7c3aed',
  'Selesai':'#16a34a',
}
const MAX_SIZE = 20 * 1024 * 1024

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [fileError, setFileError] = useState('')
  const [form, setForm] = useState({
    nomor_laporan:'', nama_dokumen:'', kategori:'Perencanaan', pic:'',
    tanggal_diajukan: new Date().toISOString().slice(0,10),
    target_selesai:'', status:'Belum Direviu', catatan:''
  })

  function set(k:string,v:string){setForm(f=>({...f,[k]:v}))}

  function validateFile(f:File):string {
    const ext = '.'+f.name.split('.').pop()?.toLowerCase()
    const allowed = ['.pdf','.doc','.docx','.xlsx','.xls','.zip','.rar']
    if(!allowed.includes(ext)) return `Format tidak didukung. Gunakan: ${allowed.join(', ')}`
    if(f.size>MAX_SIZE) return `Ukuran file maksimal 20 MB (file ini: ${(f.size/1024/1024).toFixed(1)} MB)`
    return ''
  }

  function handleFileChange(e:React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]||null
    setFile(f); setFileError(f ? validateFile(f) : '')
  }

  const progresOtomatis = STATUS_PROGRES[form.status] ?? 0

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault()
    if(!form.nama_dokumen||!form.nomor_laporan){setError('Nama dokumen dan nomor laporan wajib diisi.');return}
    if(file && fileError){setError(fileError);return}
    setLoading(true); setError('')

    let file_url=null, file_name=null, file_size=null
    if(file) {
      const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
      const {error:upErr}=await supabase.storage.from('dokumen-reviu').upload(path,file,{contentType:file.type||'application/octet-stream'})
      if(upErr){setError('Gagal upload file: '+upErr.message);setLoading(false);return}
      file_url=path; file_name=file.name
      file_size=file.size>1024*1024?`${(file.size/1024/1024).toFixed(1)} MB`:`${Math.round(file.size/1024)} KB`
    }

    const {data:inserted,error:insertErr}=await supabase.from('dokumen').insert({
      ...form, progres: progresOtomatis,
      target_selesai: form.target_selesai||null,
      laporan_url:null, laporan_name:null, laporan_size:null,
      file_url, file_name, file_size,
    }).select().single()

    if(insertErr){setError('Gagal menyimpan: '+insertErr.message);setLoading(false);return}
    if(inserted) {
      await supabase.from('riwayat').insert({
        dokumen_id:inserted.id,
        keterangan:'Dokumen diregistrasi dan diajukan ke Inspektorat Kabupaten Sumba Barat',
        warna:'x'
      })
    }
    router.push('/dokumen')
  }

  return (
    <>
      <Head><title>Register Dokumen — DRES | Inspectorate of West Sumba Regency</title></Head>
      <Layout>
        <div className="max-w-2xl space-y-5">
          <Link href="/dokumen" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Register Dokumen Reviu</h1>
            <p className="text-sm text-gray-500">Daftarkan dokumen untuk direviu Inspektorat Kabupaten Sumba Barat</p>
          </div>
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nama Dokumen <span className="text-red-500">*</span></label>
                <input className="input" value={form.nama_dokumen} onChange={e=>set('nama_dokumen',e.target.value)} placeholder="Contoh: Laporan Keuangan Semester I 2025" required/>
              </div>
              <div>
                <label className="label">Nomor Laporan <span className="text-red-500">*</span></label>
                <input className="input" value={form.nomor_laporan} onChange={e=>set('nomor_laporan',e.target.value)} placeholder="001/REV/2025" required/>
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.kategori} onChange={e=>set('kategori',e.target.value)}>
                  <option>Perencanaan</option><option>Keuangan</option><option>Kinerja</option>
                </select>
              </div>

              {/* Status + Progres Otomatis */}
              <div>
                <label className="label">Status Awal</label>
                <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Progres <span className="text-xs text-gray-400 font-normal">(otomatis)</span></label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{width:`${progresOtomatis}%`, background:STATUS_COLOR[form.status]}}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10">{progresOtomatis}%</span>
                </div>
              </div>

              <div>
                <label className="label">Tanggal Diajukan ke Inspektorat</label>
                <input type="date" className="input" value={form.tanggal_diajukan} onChange={e=>set('tanggal_diajukan',e.target.value)}/>
              </div>
              <div>
                <label className="label">Target Selesai Reviu</label>
                <input type="date" className="input" value={form.target_selesai} onChange={e=>set('target_selesai',e.target.value)}/>
              </div>
              <div className="md:col-span-2">
                <label className="label">PIC / Unit Pemilik Dokumen</label>
                <input className="input" value={form.pic} onChange={e=>set('pic',e.target.value)} placeholder="Nama bidang atau unit pengirim"/>
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  Upload File Dokumen
                  <span className="text-gray-400 font-normal ml-1">(PDF, DOCX, XLSX, ZIP, RAR — maks. 20 MB)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${fileError?'border-red-300 bg-red-50':'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                  onClick={()=>document.getElementById('file-input')?.click()}
                >
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  {file ? (
                    <div>
                      <p className={`text-sm font-medium ${fileError?'text-red-600':'text-blue-700'}`}>{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{(file.size/1024).toFixed(0)} KB · {file.name.split('.').pop()?.toUpperCase()}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Klik untuk pilih file</p>
                      <p className="text-xs text-gray-400 mt-0.5">Mendukung: PDF · DOCX · XLSX · ZIP · RAR</p>
                    </div>
                  )}
                  <input id="file-input" type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.zip,.rar" className="hidden" onChange={handleFileChange}/>
                </div>
                {fileError && <p className="text-xs text-red-600 mt-1.5">⚠ {fileError}</p>}
                {file && !fileError && <p className="text-xs text-green-600 mt-1.5">✓ File valid, siap diupload</p>}
              </div>

              <div className="md:col-span-2">
                <label className="label">Catatan Awal</label>
                <textarea className="input min-h-20 resize-y" value={form.catatan} onChange={e=>set('catatan',e.target.value)} placeholder="Instruksi atau keterangan reviu awal..."/>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <Link href="/dokumen" className="btn-secondary">Batal</Link>
              <button type="submit" disabled={loading||!!fileError} className="btn-primary disabled:opacity-40">
                {loading?'Menyimpan...':'Simpan & Register'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
