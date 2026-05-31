import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    nomor_laporan: '',
    nama_dokumen: '',
    kategori: 'Perencanaan',
    pic: '',
    tanggal_diajukan: new Date().toISOString().slice(0, 10),
    target_selesai: '',
    catatan: '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nama_dokumen || !form.nomor_laporan) { setError('Nama dokumen dan nomor laporan wajib diisi.'); return }
    setLoading(true); setError('')

    let file_url = null, file_name = null, file_size = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadErr } = await supabase.storage.from('dokumen-reviu').upload(path, file)
      if (uploadErr) { setError('Gagal upload file: ' + uploadErr.message); setLoading(false); return }
      file_url = path
      file_name = file.name
      file_size = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
    }

    const { data: inserted, error: insertErr } = await supabase.from('dokumen').insert({
      ...form,
      target_selesai: form.target_selesai || null,
      status: 'Belum Direviu',
      progres: 0,
      file_url, file_name, file_size,
    }).select().single()

    if (insertErr) { setError('Gagal menyimpan: ' + insertErr.message); setLoading(false); return }

    if (inserted) {
      await supabase.from('riwayat').insert({
        dokumen_id: inserted.id,
        keterangan: 'Dokumen diregistrasi dan diajukan ke Inspektorat Kabupaten Sumba Barat',
        warna: 'x'
      })
    }

    router.push('/dokumen')
  }

  return (
    <>
      <Head><title>Register Dokumen — Monitoring Reviu</title></Head>
      <Layout>
        <div className="max-w-2xl space-y-5">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Register Dokumen Reviu</h1>
            <p className="text-sm text-gray-500">Daftarkan dokumen baru untuk direviu oleh Inspektorat</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nama Dokumen <span className="text-red-500">*</span></label>
                <input className="input" value={form.nama_dokumen} onChange={e => set('nama_dokumen', e.target.value)}
                  placeholder="Contoh: Laporan Keuangan Semester I 2025" required />
              </div>
              <div>
                <label className="label">Nomor Laporan <span className="text-red-500">*</span></label>
                <input className="input" value={form.nomor_laporan} onChange={e => set('nomor_laporan', e.target.value)}
                  placeholder="001/REV/2025" required />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.kategori} onChange={e => set('kategori', e.target.value)}>
                  <option>Perencanaan</option>
                  <option>Keuangan</option>
                  <option>Kinerja</option>
                </select>
              </div>
              <div>
                <label className="label">Tanggal Diajukan ke Inspektorat</label>
                <input type="date" className="input" value={form.tanggal_diajukan} onChange={e => set('tanggal_diajukan', e.target.value)} />
              </div>
              <div>
                <label className="label">Target Selesai Reviu</label>
                <input type="date" className="input" value={form.target_selesai} onChange={e => set('target_selesai', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="label">PIC / Unit Pemilik Dokumen</label>
                <input className="input" value={form.pic} onChange={e => set('pic', e.target.value)}
                  placeholder="Nama bidang atau unit yang mengirim dokumen" />
              </div>

              {/* File upload */}
              <div className="md:col-span-2">
                <label className="label">Upload File Dokumen</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-blue-700">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Klik untuk pilih file</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, XLSX (maks. 10 MB)</p>
                    </div>
                  )}
                  <input id="file-input" type="file" accept=".pdf,.doc,.docx,.xlsx,.xls"
                    className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label">Catatan Awal</label>
                <textarea className="input min-h-20 resize-y" value={form.catatan} onChange={e => set('catatan', e.target.value)}
                  placeholder="Instruksi atau keterangan reviu awal..." />
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Menyimpan...' : 'Simpan & Register'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
