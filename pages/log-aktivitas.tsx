import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type LogItem = {
  id: string
  keterangan: string
  warna: string
  created_at: string
  created_by: string | null
  dokumen: {
    id: string
    nama_dokumen: string
    nomor_laporan: string
    kategori: string
  } | null
}

const WC: Record<string, string> = {
  g: '#16a34a', b: '#2563eb', a: '#d97706', x: '#9ca3af', v: '#7c3aed'
}
const WL: Record<string, string> = {
  g: 'Selesai', b: 'Diproses', a: 'Revisi', x: 'Info', v: 'Penyusunan LHR'
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fWarna, setFWarna] = useState('')
  const [fKat, setFKat] = useState('')
  const [fDari, setFDari] = useState('')
  const [fSampai, setFSampai] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('riwayat')
      .select(`id, keterangan, warna, created_at, created_by,
        dokumen:dokumen_id (id, nama_dokumen, nomor_laporan, kategori)`)
      .order('created_at', { ascending: false })
      .limit(500)
    setLogs((data as any) || [])
    setLoading(false)
  }

  const filtered = logs.filter(l => {
    const tgl = l.created_at.slice(0, 10)
    return (
      (!search || l.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        l.dokumen?.nama_dokumen.toLowerCase().includes(search.toLowerCase()) ||
        l.dokumen?.nomor_laporan.includes(search)) &&
      (!fWarna || l.warna === fWarna) &&
      (!fKat || l.dokumen?.kategori === fKat) &&
      (!fDari || tgl >= fDari) &&
      (!fSampai || tgl <= fSampai)
    )
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  function resetFilter() {
    setSearch(''); setFWarna(''); setFKat(''); setFDari(''); setFSampai(''); setPage(1)
  }

  return (
    <>
      <Head><title>Log Aktivitas — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Log Aktivitas</h1>
              <p className="text-sm text-gray-500">{filtered.length} entri aktivitas ditemukan</p>
            </div>
            <button onClick={resetFilter} className="btn-secondary text-xs">Reset Filter</button>
          </div>

          {/* Filter bar */}
          <div className="card p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <input className="input col-span-2 md:col-span-1" placeholder="Cari keterangan / dokumen..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              <select className="input" value={fWarna} onChange={e => { setFWarna(e.target.value); setPage(1) }}>
                <option value="">Semua Tipe</option>
                <option value="g">Selesai</option>
                <option value="b">Diproses</option>
                <option value="a">Revisi</option>
                <option value="v">Penyusunan LHR</option>
                <option value="x">Info</option>
              </select>
              <select className="input" value={fKat} onChange={e => { setFKat(e.target.value); setPage(1) }}>
                <option value="">Semua Kategori</option>
                <option>Perencanaan</option><option>Keuangan</option><option>Kinerja</option>
              </select>
              <div>
                <label className="label">Dari tanggal</label>
                <input type="date" className="input" value={fDari} onChange={e => { setFDari(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="label">Sampai tanggal</label>
                <input type="date" className="input" value={fSampai} onChange={e => { setFSampai(e.target.value); setPage(1) }} />
              </div>
            </div>
          </div>

          {/* Log table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-8">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-36">Waktu</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">Tipe</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Keterangan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-44">Dokumen</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Memuat...</div>
                    </td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada aktivitas ditemukan</td></tr>
                  ) : paginated.map((l, i) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div className="text-gray-400">{new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: WC[l.warna] || '#9ca3af' }}></span>
                          <span style={{ color: WC[l.warna] || '#9ca3af' }} className="font-medium">{WL[l.warna] || 'Info'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{l.keterangan}</td>
                      <td className="px-4 py-2.5">
                        {l.dokumen ? (
                          <div>
                            <div className="font-medium text-gray-800 truncate max-w-[160px]" title={l.dokumen.nama_dokumen}>{l.dokumen.nama_dokumen}</div>
                            <div className="text-gray-400">{l.dokumen.nomor_laporan}</div>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{l.dokumen?.kategori || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Halaman {page} dari {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
