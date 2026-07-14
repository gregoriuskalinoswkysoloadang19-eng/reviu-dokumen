import { useEffect, useState } from 'react'
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

export default function EditDokumenPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nomor_laporan:'', nama_dokumen:'', kategori:'Perencanaan', pic:'',
    tanggal_diajukan:'', target_selesai:'', tanggal_selesai:'',
    status:'Belum Direviu', catatan:''
  })

  useEffect(()=>{
    if(!id) return
    supabase.from('dokumen').select('*').eq('id',id).single().then(({data})=>{
      if(data) setForm({
        nomor_laporan: data.nomor_laporan||'',
        nama_dokumen: data.nama_dokumen||'',
        kategori: data.kategori||'Perencanaan',
        pic: data.pic||'',
        tanggal_diajukan: data.tanggal_diajukan||'',
        target_selesai: data.target_selesai||'',
        tanggal_selesai: data.tanggal_selesai||'',
        status: data.status||'Belum Direviu',
        catatan: data.catatan||'',
      })
      setLoading(false)
    })
  },[id])

  function set(k:string,v:string){setForm(f=>({...f,[k]:v}))}

  function handleStatusChange(newStatus: string) {
    setForm(f=>({
      ...f,
      status: newStatus,
      tanggal_selesai: newStatus === 'Selesai' && !f.tanggal_selesai
        ? new Date().toISOString().slice(0,10)
        : newStatus !== 'Selesai' ? '' : f.tanggal_selesai
    }))
  }

  const progresOtomatis = STATUS_PROGRES[form.status] ?? 0

  async function handleSave(e:React.FormEvent){
    e.preventDefault()
    if(!form.nama_dokumen||!form.nomor_laporan){setError('Nama dan nomor laporan wajib diisi');return}
    setSaving(true); setError('')
    const w = form.status==='Selesai'?'g':form.status==='Penyusunan Laporan Hasil Reviu'?'g':form.status==='Perlu Revisi'?'a':form.status==='Dalam Proses'?'b':'x'
    const {error:err}=await supabase.from('dokumen').update({
      ...form,
      progres: progresOtomatis,
      target_selesai: form.target_selesai||null,
      tanggal_selesai: form.tanggal_selesai||null,
      updated_at: new Date().toISOString()
    }).eq('id',id)
    if(err){setError('Gagal menyimpan: '+err.message);setSaving(false);return}
    await supabase.from('riwayat').insert({
      dokumen_id:id,
      keterangan:`Status diperbarui: ${form.status} (${progresOtomatis}%)`,
      warna: w
    })
    router.push('/dokumen')
  }

  if(loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>

  return (
    <>
      <Head><title>Edit Dokumen — Monitoring Reviu</title></Head>
      <Layout>
        <div className="max-w-2xl space-y-5">
          <Link href="/dokumen" className="text-sm text-gray-500 hover:text-gray-700">← Kembali ke Daftar</Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Edit Dokumen</h1>
            <p className="text-sm text-gray-500">Perbarui data dokumen yang sudah diregistrasi</p>
          </div>
          <form onSubmit={handleSave} className="card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nama Dokumen <span className="text-red-500">*</span></label>
                <input className="input" value={form.nama_dokumen} onChange={e=>set('nama_dokumen',e.target.value)} required/>
              </div>
              <div>
                <label className="label">Nomor Laporan <span className="text-red-500">*</span></label>
                <input className="input" value={form.nomor_laporan} onChange={e=>set('nomor_laporan',e.target.value)} required/>
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.kategori} onChange={e=>set('kategori',e.target.value)}>
                  <option>Perencanaan</option><option>Keuangan</option><option>Kinerja</option>
                </select>
              </div>
              <div>
                <label className="label">Tanggal Diajukan</label>
                <input type="date" className="input" value={form.tanggal_diajukan} onChange={e=>set('tanggal_diajukan',e.target.value)}/>
              </div>
              <div>
                <label className="label">Target Selesai</label>
                <input type="date" className="input" value={form.target_selesai} onChange={e=>set('target_selesai',e.target.value)}/>
              </div>

              {/* Status + Progres Otomatis */}
              <div>
                <label className="label">Status Reviu</label>
                <select className="input" value={form.status} onChange={e=>handleStatusChange(e.target.value)}>
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
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Belum Direviu = 0% · Perlu Revisi = 25% · Dalam Proses = 50% · Penyusunan LHR = 75% · Selesai = 100%
                </p>
              </div>

              <div>
                <label className="label">Tanggal Selesai Reviu</label>
                <input type="date" className="input" value={form.tanggal_selesai} onChange={e=>set('tanggal_selesai',e.target.value)}/>
                {form.status==='Selesai' && !form.tanggal_selesai && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Isi tanggal selesai untuk status Selesai</p>
                )}
              </div>
              <div>
                <label className="label">PIC / Unit Pemilik</label>
                <input className="input" value={form.pic} onChange={e=>set('pic',e.target.value)}/>
              </div>
              <div className="md:col-span-2">
                <label className="label">Catatan</label>
                <textarea className="input min-h-20 resize-y" value={form.catatan} onChange={e=>set('catatan',e.target.value)}/>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <Link href="/dokumen" className="btn-secondary">Batal</Link>
              <button type="submit" disabled={saving} className="btn-primary">{saving?'Menyimpan...':'Simpan Perubahan'}</button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
