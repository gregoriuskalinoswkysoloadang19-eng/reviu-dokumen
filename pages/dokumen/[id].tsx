import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Dokumen = {
  id: string; nomor_laporan: string; nama_dokumen: string; kategori: string
  pic: string; tanggal_diajukan: string; target_selesai: string | null
  tanggal_selesai: string | null; status: string; progres: number
  catatan: string | null; file_url: string | null; file_name: string | null; file_size: string | null
}
type Riwayat = { id: string; keterangan: string; warna: string; created_at: string }

const WARNA: Record<string, string> = { g: '#16a34a', b: '#2563eb', a: '#d97706', x: '#9ca3af' }

export default function DetailDokumenPage() {
  const router = useRouter()
  const { id } = router.query
  const [doc, setDoc] = useState<Dokumen | null>(null)
  const [riwayat, setRiwayat] = useState<Riwayat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [progres, setProgres] = useState(0)
  const [tglSelesai, setTglSelesai] = useState('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    const [docRes, riwRes] = await Promise.all([
      supabase.from('dokumen').select('*').eq('id', id).single(),
      supabase.from('riwayat').select('*').eq('dokumen_id', id).order('created_at', { ascending: true })
    ])
    if (docRes.data) {
      setDoc(docRes.data)
      setStatus(docRes.data.status)
      setProgres(docRes.data.progres)
      setTglSelesai(docRes.data.tanggal_selesai || '')
      setCatatan(docRes.data.catatan || '')
    }
    setRiwayat(riwRes.data || [])
    setLoading(false)
  }

  async function saveStatus() {
    if (!doc) return
    setSaving(true)
    const w = status === 'Selesai' ? 'g' : status === 'Perlu Revisi' ? 'a' : status === 'Dalam Proses' ? 'b' : 'x'
    const today = new Date().toISOString().slice(0, 10)
    await supabase.from('dokumen').update({
      status, progres, tanggal_selesai: tglSelesai || null, updated_at: new Date().toISOString()
    }).eq('id', doc.id)
    await supabase.from('riwayat').insert({ dokumen_id: doc.id, keterangan: `Status diperbarui: ${status} (${progres}%)`, warna: w })
    await fetchData()
    setSaving(false)
  }

  async function saveCatatan() {
    if (!doc) return
    setSaving(true)
    await supabase.from('dokumen').update({ catatan, updated_at: new Date().toISOString() }).eq('id', doc.id)
    await supabase.from('riwayat').insert({ dokumen_id: doc.id, keterangan: 'Catatan reviu diperbarui', warna: 'b' })
    await fetchData()
    setSaving(false)
  }

  async function handleDownload() {
    if (!doc?.file_url) return
    const { data } = await supabase.storage.from('dokumen-reviu').createSignedUrl(doc.file_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const badge = (s: string) => {
    const m: Record<string, string> = { Selesai: 'badge-selesai', 'Dalam Proses': 'badge-proses', 'Belum Direviu': 'badge-belum', 'Perlu Revisi': 'badge-revisi' }
    return <span className={m[s] || 'badge-belum'}>{s}</span>
  }

  if (loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>
  if (!doc) return <Layout><div className="text-center py-12 text-gray-500">Dokumen tidak ditemukan.</div></Layout>

  return (
    <>
      <Head><title>{doc.nama_dokumen} — Detail Reviu</title></Head>
      <Layout>
        <div className="space-y-5 max-w-3xl">
          <div className="flex items-center gap-2">
            <Link href="/dokumen" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          </div>

          {/* Header card */}
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
                { label: 'Tgl Diajukan', value: doc.tanggal_diajukan },
                { label: 'Target Selesai', value: doc.target_selesai || '—' },
                { label: 'Tgl Selesai', value: doc.tanggal_selesai || 'Belum selesai' },
                { label: 'Progres', value: `${doc.progres}%` },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-500">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* File */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">File Dokumen</h2>
            {doc.file_url ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">{doc.file_size}</p>
                </div>
                <button onClick={handleDownload} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Unduh
                </button>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 text-center">Belum ada file terupload</div>
            )}
          </div>

          {/* Update status */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Update Status Reviu</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                  {['Belum Direviu','Dalam Proses','Perlu Revisi','Selesai'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Progres (%)</label>
                <input type="number" min={0} max={100} className="input w-24" value={progres} onChange={e => setProgres(+e.target.value)} />
              </div>
              <div>
                <label className="label">Tanggal Selesai</label>
                <input type="date" className="input" value={tglSelesai} onChange={e => setTglSelesai(e.target.value)} />
              </div>
              <button onClick={saveStatus} disabled={saving} className="btn-primary">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Catatan */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Catatan Hasil Reviu</h2>
            <textarea className="input min-h-24 resize-y" value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Tulis catatan reviu..." />
            <button onClick={saveCatatan} disabled={saving} className="btn-secondary mt-2">
              {saving ? 'Menyimpan...' : 'Simpan Catatan'}
            </button>
          </div>

          {/* Riwayat */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Riwayat Aktivitas</h2>
            <div className="space-y-3">
              {riwayat.map(r => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: WARNA[r.warna] || '#9ca3af' }}></div>
                    <div className="w-px flex-1 bg-gray-100 mt-1"></div>
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-gray-700">{r.keterangan}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
