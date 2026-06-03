import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { STATUS_LIST, STATUS_COLOR, STATUS_BADGE, KATEGORI_LIST } from '@/lib/constants'

type Dok = {
  id:string; nomor_laporan:string; nama_dokumen:string; kategori:string; pic:string; anggota_tim:string|null
  tanggal_diajukan:string; target_selesai:string|null; tanggal_selesai:string|null
  status:string; progres:number; file_url:string|null; file_name:string|null
  laporan_url:string|null; laporan_name:string|null; asal_opd:string|null
}

export default function DokumenPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string|null>(null)
  const [deleteError, setDeleteError] = useState('')
  // Filters
  const [search, setSearch] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fKat, setFKat] = useState('')
  const [fPic, setFPic] = useState('')
  const [fOpd, setFOpd] = useState('')
  const [fTahun, setFTahun] = useState('')
  const [fBulan, setFBulan] = useState('')
  const [fTglDari, setFTglDari] = useState('')
  const [fTglSampai, setFTglSampai] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('dokumen').select('*').order('created_at', { ascending: false })
    setDok(data || [])
    setLoading(false)
  }

  async function dlFile(url: string, bucket: string) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(d: Dok) {
    const konfirmasi = window.confirm(`⚠️ Hapus dokumen:\n"${d.nama_dokumen}"\n\nTindakan ini tidak dapat dibatalkan. Lanjutkan?`)
    if (!konfirmasi) return
    setDeleting(d.id); setDeleteError('')
    try {
      if (d.file_url) await supabase.storage.from('dokumen-reviu').remove([d.file_url])
      if (d.laporan_url) await supabase.storage.from('laporan-reviu').remove([d.laporan_url])
      const { error: rErr } = await supabase.from('riwayat').delete().eq('dokumen_id', d.id)
      if (rErr) throw new Error(rErr.message)
      const { error: dErr } = await supabase.from('dokumen').delete().eq('id', d.id)
      if (dErr) throw new Error(dErr.message)
      await fetchData()
    } catch (err: any) {
      setDeleteError('Gagal hapus: ' + err.message)
    } finally { setDeleting(null) }
  }

  function resetFilter() {
    setSearch(''); setFStatus(''); setFKat(''); setFPic(''); setFOpd('')
    setFTahun(''); setFBulan(''); setFTglDari(''); setFTglSampai('')
  }

  const activeFilters = [search,fStatus,fKat,fPic,fOpd,fTahun,fBulan,fTglDari,fTglSampai].filter(Boolean).length

  const filtered = dok.filter(d => {
    const tgl = new Date(d.tanggal_diajukan)
    return (
      (!search || d.nama_dokumen.toLowerCase().includes(search.toLowerCase()) || d.nomor_laporan.includes(search) || (d.pic||'').toLowerCase().includes(search.toLowerCase())) &&
      (!fStatus || d.status === fStatus) &&
      (!fKat || d.kategori === fKat) &&
      (!fPic || (d.pic||'').toLowerCase().includes(fPic.toLowerCase())) &&
      (!fOpd || (d.asal_opd||'').toLowerCase().includes(fOpd.toLowerCase())) &&
      (!fTahun || tgl.getFullYear().toString() === fTahun) &&
      (!fBulan || (tgl.getMonth()+1).toString().padStart(2,'0') === fBulan) &&
      (!fTglDari || d.tanggal_diajukan >= fTglDari) &&
      (!fTglSampai || d.tanggal_diajukan <= fTglSampai)
    )
  })

  const tahunList = Array.from(new Set(dok.map(d => new Date(d.tanggal_diajukan).getFullYear().toString()))).sort().reverse()

  const isOverdue = (d: Dok) => d.target_selesai && d.status !== 'Selesai' && new Date(d.target_selesai) < new Date()

  return (
    <>
      <Head><title>Daftar Dokumen — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Daftar Dokumen</h1>
              <p className="text-sm text-gray-500">{filtered.length} dari {dok.length} dokumen</p>
            </div>
            <div className="flex gap-2">
              <Link href="/ekspor" className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Ekspor
              </Link>
              <Link href="/register" className="btn-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Register
              </Link>
            </div>
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex justify-between">
              <span>{deleteError}</span>
              <button onClick={() => setDeleteError('')} className="text-red-400 ml-3">✕</button>
            </div>
          )}

          {/* Filter Panel */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter & Pencarian</span>
              {activeFilters > 0 && (
                <button onClick={resetFilter} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Reset ({activeFilters} aktif)
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input className="input col-span-2 md:col-span-2" placeholder="Cari nama, nomor, PIC..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="input" value={fStatus} onChange={e => setFStatus(e.target.value)}>
                <option value="">Semua Status</option>
                {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="input" value={fKat} onChange={e => setFKat(e.target.value)}>
                <option value="">Semua Kategori</option>
                {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
              </select>
              <input className="input" placeholder="Filter PIC..." value={fPic} onChange={e => setFPic(e.target.value)} />
              <input className="input" placeholder="Filter Asal OPD..." value={fOpd} onChange={e => setFOpd(e.target.value)} />
              <select className="input" value={fTahun} onChange={e => setFTahun(e.target.value)}>
                <option value="">Semua Tahun</option>
                {tahunList.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="input" value={fBulan} onChange={e => setFBulan(e.target.value)}>
                <option value="">Semua Bulan</option>
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m,i) => (
                  <option key={m} value={m}>{['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][i]}</option>
                ))}
              </select>
              <div className="col-span-2 flex gap-2 items-center">
                <input type="date" className="input flex-1" value={fTglDari} onChange={e => setFTglDari(e.target.value)} title="Dari tanggal"/>
                <span className="text-gray-400 text-xs">s/d</span>
                <input type="date" className="input flex-1" value={fTglSampai} onChange={e => setFTglSampai(e.target.value)} title="Sampai tanggal"/>
              </div>
            </div>
            {/* Active filter badges */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {search && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Cari: {search}</span>}
                {fStatus && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Status: {fStatus}</span>}
                {fKat && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Kat: {fKat}</span>}
                {fPic && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">PIC: {fPic}</span>}
                {fOpd && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">OPD: {fOpd}</span>}
                {fTahun && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Tahun: {fTahun}</span>}
                {fBulan && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Bulan: {fBulan}</span>}
                {fTglDari && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Dari: {fTglDari}</span>}
                {fTglSampai && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">S/d: {fTglSampai}</span>}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{minWidth:'1000px'}}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-7">No</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">No. Laporan</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-22">Kategori</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-28">PIC / Ketua Tim</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Tgl Diajukan</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">Target Selesai</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-28">Status</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-20">Progres</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-20">File Dokumen</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-24">File LHR</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={12} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Memuat...</div>
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-12 text-gray-400">
                      {dok.length === 0 ? <>Belum ada dokumen. <Link href="/register" className="text-blue-600 underline">Register sekarang</Link></> : 'Tidak ada dokumen sesuai filter'}
                    </td></tr>
                  ) : filtered.map((d, i) => (
                    <tr key={d.id} className={`hover:bg-gray-50 ${deleting === d.id ? 'opacity-40' : ''} ${isOverdue(d) ? 'bg-red-50/50' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-400">{i+1}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[180px]">
                        <div className="truncate" title={d.nama_dokumen}>{d.nama_dokumen}</div>
                        {isOverdue(d) && <span className="text-xs text-red-500 font-normal">⚠ Melewati deadline</span>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{d.nomor_laporan}</td>
                      <td className="px-3 py-2.5 text-gray-600">{d.kategori}</td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[112px]">
                        <div className="truncate" title={d.pic}>{d.pic||'—'}</div>
                        {d.anggota_tim && <div className="text-gray-400 text-xs truncate" title={d.anggota_tim}>{d.anggota_tim}</div>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={isOverdue(d) ? 'text-red-600 font-medium' : 'text-gray-500'}>{d.target_selesai||'—'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={STATUS_BADGE[d.status]||'badge-belum'}>{d.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${d.progres}%`,background:STATUS_COLOR[d.status]}}></div>
                          </div>
                          <span className="text-gray-500">{d.progres}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {d.file_url
                          ? <button onClick={() => dlFile(d.file_url!, 'dokumen-reviu')} className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                            </button>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {d.laporan_url
                          ? <button onClick={() => dlFile(d.laporan_url!, 'laporan-reviu')} className="text-green-600 hover:text-green-800 flex items-center gap-0.5 font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Unduh
                            </button>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link href={`/dokumen/${d.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Detail</Link>
                          <span className="text-gray-200">|</span>
                          <Link href={`/dokumen/edit/${d.id}`} className="text-amber-600 hover:text-amber-800 font-medium">Edit</Link>
                          <span className="text-gray-200">|</span>
                          <button onClick={() => handleDelete(d)} disabled={!!deleting}
                            className="text-red-500 hover:text-red-700 font-medium disabled:opacity-40">
                            {deleting === d.id ? '...' : 'Hapus'}
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
