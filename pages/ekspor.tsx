import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { STATUS_LIST, KATEGORI_LIST, STATUS_COLOR } from '@/lib/constants'

type Dok = {
  id:string; nomor_laporan:string; nama_dokumen:string; kategori:string; pic:string
  asal_opd:string|null; tanggal_diajukan:string; target_selesai:string|null
  tanggal_selesai:string|null; status:string; progres:number; catatan:string|null
}

export default function EksporPage() {
  const [dok, setDok] = useState<Dok[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [fStatus, setFStatus] = useState('')
  const [fKat, setFKat] = useState('')
  const [fTahun, setFTahun] = useState('')
  const [fTglDari, setFTglDari] = useState('')
  const [fTglSampai, setFTglSampai] = useState('')

  useEffect(() => {
    supabase.from('dokumen').select('*').order('tanggal_diajukan').then(({data}) => {
      setDok(data||[]); setLoading(false)
    })
  }, [])

  const filtered = dok.filter(d => {
    const tgl = new Date(d.tanggal_diajukan)
    return (
      (!fStatus || d.status === fStatus) &&
      (!fKat || d.kategori === fKat) &&
      (!fTahun || tgl.getFullYear().toString() === fTahun) &&
      (!fTglDari || d.tanggal_diajukan >= fTglDari) &&
      (!fTglSampai || d.tanggal_diajukan <= fTglSampai)
    )
  })

  const tahunList = Array.from(new Set(dok.map(d => new Date(d.tanggal_diajukan).getFullYear().toString()))).sort().reverse()

  function eksporCSV() {
    setExporting(true)
    const header = ['No','Nomor Laporan','Nama Dokumen','Kategori','PIC/Ketua Tim','Asal OPD','Tgl Diajukan','Target Selesai','Tgl Selesai','Status','Progres (%)','Catatan']
    const rows = filtered.map((d,i) => [
      i+1, d.nomor_laporan, `"${d.nama_dokumen}"`, d.kategori,
      `"${d.pic||''}"`, `"${d.asal_opd||''}"`,
      d.tanggal_diajukan, d.target_selesai||'', d.tanggal_selesai||'',
      d.status, d.progres, `"${(d.catatan||'').replace(/"/g,'""')}"`
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `reviu-dokumen-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    setExporting(false)
  }

  function eksporPDF() {
    setExporting(true)
    const today = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
    const filterInfo = [fStatus&&`Status: ${fStatus}`,fKat&&`Kategori: ${fKat}`,fTahun&&`Tahun: ${fTahun}`].filter(Boolean).join(' | ')

    const rows = filtered.map((d,i) => `
      <tr style="border-bottom:1px solid #e5e7eb;${i%2===0?'background:#f9fafb':''}">
        <td style="padding:6px 8px;text-align:center;font-size:11px;color:#6b7280">${i+1}</td>
        <td style="padding:6px 8px;font-size:11px">${d.nomor_laporan}</td>
        <td style="padding:6px 8px;font-size:11px;font-weight:500">${d.nama_dokumen}</td>
        <td style="padding:6px 8px;font-size:11px">${d.kategori}</td>
        <td style="padding:6px 8px;font-size:11px">${d.pic||'—'}</td>
        <td style="padding:6px 8px;font-size:11px">${d.tanggal_diajukan}</td>
        <td style="padding:6px 8px;font-size:11px">${d.target_selesai||'—'}</td>
        <td style="padding:6px 8px;font-size:11px">${d.tanggal_selesai||'—'}</td>
        <td style="padding:6px 8px;font-size:11px">
          <span style="background:${STATUS_COLOR[d.status]}20;color:${STATUS_COLOR[d.status]};padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600">${d.status}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;font-size:11px;font-weight:600">${d.progres}%</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
    <title>Laporan Monitoring Reviu Dokumen</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
      .kop { display:flex; align-items:center; gap:16px; border-bottom:3px solid #1d4ed8; padding-bottom:12px; margin-bottom:20px; }
      .kop img { width:60px; height:60px; object-fit:contain; }
      .kop-text h1 { font-size:14px; font-weight:700; color:#1e3a8a; }
      .kop-text h2 { font-size:12px; color:#374151; }
      .kop-text p { font-size:10px; color:#6b7280; }
      .judul { text-align:center; margin:16px 0; }
      .judul h3 { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
      .judul p { font-size:11px; color:#6b7280; margin-top:4px; }
      .summary { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
      .sum-card { background:#f3f4f6; border-radius:8px; padding:8px 12px; min-width:100px; }
      .sum-card .label { font-size:10px; color:#6b7280; }
      .sum-card .val { font-size:18px; font-weight:700; color:#1d4ed8; }
      table { width:100%; border-collapse:collapse; }
      th { background:#1d4ed8; color:white; padding:8px; text-align:left; font-size:11px; font-weight:600; }
      .footer { margin-top:24px; text-align:right; font-size:10px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:12px; }
      @media print { body { padding: 12px; } }
    </style></head><body>
    <div class="kop">
      <img src="/logo-sumba-barat.png" alt="Logo" onerror="this.style.display='none'"/>
      <div class="kop-text">
        <h1>INSPEKTORAT KABUPATEN SUMBA BARAT</h1>
        <h2>Sistem Monitoring Reviu Dokumen</h2>
        <p>Perencanaan · Keuangan · Kinerja</p>
      </div>
    </div>
    <div class="judul">
      <h3>Laporan Monitoring Reviu Dokumen</h3>
      <p>Dicetak: ${today}${filterInfo?' | Filter: '+filterInfo:''}</p>
    </div>
    <div class="summary">
      <div class="sum-card"><div class="label">Total Dokumen</div><div class="val" style="color:#1d4ed8">${filtered.length}</div></div>
      <div class="sum-card"><div class="label">Selesai</div><div class="val" style="color:#16a34a">${filtered.filter(d=>d.status==='Selesai').length}</div></div>
      <div class="sum-card"><div class="label">Dalam Proses</div><div class="val" style="color:#d97706">${filtered.filter(d=>d.status==='Dalam Proses').length}</div></div>
      <div class="sum-card"><div class="label">Belum Direviu</div><div class="val" style="color:#6b7280">${filtered.filter(d=>d.status==='Belum Direviu').length}</div></div>
    </div>
    <table>
      <thead><tr>
        <th style="width:28px">No</th><th>No. Laporan</th><th>Nama Dokumen</th>
        <th>Kategori</th><th>PIC</th><th>Tgl Diajukan</th>
        <th>Target Selesai</th><th>Tgl Selesai</th><th>Status</th><th style="width:44px">%</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">© ${new Date().getFullYear()} Inspektorat Kabupaten Sumba Barat · Pada Eweta Manda Elu</div>
    </body></html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => { win.print(); }, 500) }
    setExporting(false)
  }

  const selesai = filtered.filter(d=>d.status==='Selesai').length
  const proses = filtered.filter(d=>d.status==='Dalam Proses').length
  const belum = filtered.filter(d=>d.status==='Belum Direviu').length
  const overdue = filtered.filter(d=>d.target_selesai&&d.status!=='Selesai'&&new Date(d.target_selesai)<new Date()).length

  return (
    <>
      <Head><title>Ekspor Laporan — Monitoring Reviu</title></Head>
      <Layout>
        <div className="space-y-5 max-w-4xl">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Ekspor Laporan</h1>
            <p className="text-sm text-gray-500">Ekspor data dokumen ke PDF atau Excel/CSV sesuai filter</p>
          </div>

          {/* Filter */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter Data Ekspor</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <select className="input" value={fStatus} onChange={e=>setFStatus(e.target.value)}>
                <option value="">Semua Status</option>
                {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
              </select>
              <select className="input" value={fKat} onChange={e=>setFKat(e.target.value)}>
                <option value="">Semua Kategori</option>
                {KATEGORI_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
              <select className="input" value={fTahun} onChange={e=>setFTahun(e.target.value)}>
                <option value="">Semua Tahun</option>
                {tahunList.map(t=><option key={t}>{t}</option>)}
              </select>
              <div className="col-span-2 flex gap-2 items-center">
                <input type="date" className="input flex-1" value={fTglDari} onChange={e=>setFTglDari(e.target.value)}/>
                <span className="text-gray-400 text-xs flex-shrink-0">s/d</span>
                <input type="date" className="input flex-1" value={fTglSampai} onChange={e=>setFTglSampai(e.target.value)}/>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{label:'Total data',val:filtered.length,c:'text-blue-700'},{label:'Selesai',val:selesai,c:'text-green-700'},{label:'Dalam Proses',val:proses,c:'text-amber-700'},{label:'Overdue',val:overdue,c:'text-red-700'}].map(m=>(
              <div key={m.label} className="card p-4 text-center">
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className={`text-2xl font-bold ${m.c} mt-1`}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Preview tabel */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Preview Data ({filtered.length} dokumen)</h2>
              <div className="flex gap-2">
                <button onClick={eksporCSV} disabled={exporting||filtered.length===0}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 disabled:opacity-40">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Ekspor CSV/Excel
                </button>
                <button onClick={eksporPDF} disabled={exporting||filtered.length===0}
                  className="btn-primary flex items-center gap-1.5 text-xs py-1.5 disabled:opacity-40">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  Cetak PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{minWidth:'700px'}}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">No</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">No. Laporan</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Nama Dokumen</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Kategori</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Tgl Diajukan</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Memuat...</td></tr>
                  ) : filtered.slice(0,10).map((d,i) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{i+1}</td>
                      <td className="px-3 py-2 text-gray-500">{d.nomor_laporan}</td>
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[200px] truncate">{d.nama_dokumen}</td>
                      <td className="px-3 py-2 text-gray-600">{d.kategori}</td>
                      <td className="px-3 py-2"><span className="text-xs font-medium" style={{color:STATUS_COLOR[d.status]}}>{d.status}</span></td>
                      <td className="px-3 py-2 text-gray-500">{d.tanggal_diajukan}</td>
                      <td className="px-3 py-2 text-gray-500">{d.target_selesai||'—'}</td>
                    </tr>
                  ))}
                  {filtered.length > 10 && (
                    <tr><td colSpan={7} className="text-center py-3 text-gray-400 text-xs">... dan {filtered.length-10} dokumen lainnya akan ikut diekspor</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
