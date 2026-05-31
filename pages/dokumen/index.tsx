import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type Dokumen = {
  id: string
  nomor_laporan: string
  nama_dokumen: string
  kategori: string
  pic: string
  tanggal_diajukan: string
  target_selesai: string | null
  tanggal_selesai: string | null
  status: string
  progres: number
  catatan: string | null
  file_url: string | null
  file_name: string | null
  file_size: string | null
}

const STATUS_COLOR: Record<string, string> = {
  Selesai: '#16a34a', 'Dalam Proses': '#2563eb', 'Perlu Revisi': '#d97706', 'Belum Direviu': '#9ca3af'
}

export default function DokumenPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterKat, setFilterKat] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data } = await supabase.from('dokumen').select('*').order('tanggal_diajukan', { ascending: false })
    setDokumen(data || [])
    setLoading(false)
  }

  const badge = (s: string) => {
    const m: Record<string, string> = { Selesai: 'badge-selesai', 'Dalam Proses': 'badge-proses', 'Belum Direviu': 'badge-belum', 'Perlu Revisi': 'badge-revisi' }
    return <span className={m[s] || 'badge-belum'}>{s}</span>
  }

  const filtered = dokumen.filter(d =>
    (!search || d.nama_dokumen.toLowerCase().includes(search.toLowerCase()) || d.nomor_laporan.includes(search)) &&
    (!filterStatus || d.status === filterStatus) &&
    (!filterKat || d.kategori === filterKat)
  )

  async function handleDownload(d: Dokumen) {
    if (!d.file_url) return
    const { data } = await supabase.storage.from('dokumen-reviu').createSignedUrl(d.file_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <>
      <Head><title>Daftar Dokumen — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Daftar Dokumen</h1>
              <p className="text-sm text-gray-500">{dokumen.length} dokumen terdaftar</p>
            </div>
            <Link href="/register" className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Register Dokumen
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              className="input flex-1 min-w-48 max-w-xs"
              placeholder="Cari nama dokumen atau nomor..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select className="input w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {['Selesai','Dalam Proses','Perlu Revisi','Belum Direviu'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="input w-40" value={filterKat} onChange={e => setFilterKat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {['Perencanaan','Keuangan','Kinerja'].map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-8">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">No. Laporan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Kategori</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tgl Diajukan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tgl Selesai</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Progres</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">File</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={10} className="text-center py-12 text-gray-400">Memuat data...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-12 text-gray-400">Tidak ada dokumen ditemukan</td></tr>
                  ) : filtered.map((d, i) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px]">
                        <div className="truncate" title={d.nama_dokumen}>{d.nama_dokumen}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{d.nomor_laporan}</td>
                      <td className="px-4 py-3 text-gray-600">{d.kategori}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.tanggal_diajukan}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.tanggal_selesai || '—'}</td>
                      <td className="px-4 py-3">{badge(d.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${d.progres}%`, background: STATUS_COLOR[d.status] }}></div>
                          </div>
                          <span className="text-gray-500">{d.progres}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.file_url ? (
                          <button onClick={() => handleDownload(d)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                            title={d.file_name || 'Unduh'}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Unduh
                          </button>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dokumen/${d.id}`} className="text-blue-600 hover:text-blue-700 font-medium">Detail</Link>
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
