import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
  ArrowLeft, Pencil, FileText, Download, CheckCircle2, UploadCloud, Paperclip,
  Maximize2, ClipboardList, MessageSquare, History as HistoryIcon,
  BadgeCheck, FileWarning, Save,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  Card, CardHeader, CardTitle, CardContent, Badge, Button, Select, Textarea,
  Skeleton, ProgressRing, WorkflowStepper, stagesFromProgress, ActivityTimeline,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui'

type Dok = {
  id: string; nomor_laporan: string; nama_dokumen: string; kategori: string; pic: string
  tanggal_diajukan: string; target_selesai: string | null; tanggal_selesai: string | null
  status: string; progres: number; catatan: string | null
  file_url: string | null; file_name: string | null; file_size: string | null
  laporan_url: string | null; laporan_name: string | null; laporan_size: string | null
}
type Riw = { id: string; keterangan: string; warna: string; created_at: string }

const STATUS_PROGRES: Record<string, number> = {
  'Belum Direviu': 0, 'Perlu Revisi': 25, 'Dalam Proses': 50,
  'Penyusunan Laporan Hasil Reviu': 75, 'Selesai': 100,
}
const STATUS_LIST = ['Belum Direviu', 'Dalam Proses', 'Perlu Revisi', 'Penyusunan Laporan Hasil Reviu', 'Selesai']
const STATUS_COLOR: Record<string, string> = {
  'Belum Direviu': '#9ca3af', 'Perlu Revisi': '#d97706', 'Dalam Proses': '#2563eb',
  'Penyusunan Laporan Hasil Reviu': '#7c3aed', 'Selesai': '#16a34a',
}
const STATUS_TONE: Record<string, 'neutral' | 'info' | 'warning' | 'success'> = {
  'Belum Direviu': 'neutral', 'Dalam Proses': 'info', 'Perlu Revisi': 'warning',
  'Penyusunan Laporan Hasil Reviu': 'info', 'Selesai': 'success',
}

function isPdf(name: string | null) {
  return !!name && name.toLowerCase().endsWith('.pdf')
}

export default function DetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [doc, setDoc] = useState<Dok | null>(null)
  const [riw, setRiw] = useState<Riw[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [tglSelesai, setTglSelesai] = useState('')
  const [catatan, setCatatan] = useState('')
  const [laporanFile, setLaporanFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => { if (id) fetchData() }, [id])

  async function fetchData() {
    const [dr, rr] = await Promise.all([
      supabase.from('dokumen').select('*').eq('id', id).single(),
      supabase.from('riwayat').select('*').eq('dokumen_id', id).order('created_at', { ascending: true }),
    ])
    if (dr.data) {
      setDoc(dr.data); setStatus(dr.data.status)
      setTglSelesai(dr.data.tanggal_selesai || ''); setCatatan(dr.data.catatan || '')
      if (dr.data.file_url && isPdf(dr.data.file_name)) {
        const { data } = await supabase.storage.from('dokumen-reviu').createSignedUrl(dr.data.file_url, 3600)
        setPreviewUrl(data?.signedUrl || null)
      } else {
        setPreviewUrl(null)
      }
    }
    setRiw(rr.data || [])
    setLoading(false)
  }

  async function dl(url: string, bucket: string) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function saveStatus() {
    if (!doc) return; setSaving(true)
    const progresOtomatis = STATUS_PROGRES[status] ?? 0
    const w = status === 'Selesai' ? 'g' : status === 'Penyusunan Laporan Hasil Reviu' ? 'v' : status === 'Perlu Revisi' ? 'a' : status === 'Dalam Proses' ? 'b' : 'x'
    await supabase.from('dokumen').update({
      status, progres: progresOtomatis,
      tanggal_selesai: tglSelesai || null,
      updated_at: new Date().toISOString(),
    }).eq('id', doc.id)
    await supabase.from('riwayat').insert({
      dokumen_id: doc.id,
      keterangan: `Status diperbarui: ${status} (${progresOtomatis}%)`,
      warna: w,
    })
    await fetchData(); setSaving(false)
  }

  async function saveCatatan() {
    if (!doc) return; setSaving(true)
    await supabase.from('dokumen').update({ catatan, updated_at: new Date().toISOString() }).eq('id', doc.id)
    await supabase.from('riwayat').insert({ dokumen_id: doc.id, keterangan: 'Catatan reviu diperbarui', warna: 'b' })
    await fetchData(); setSaving(false)
  }

  async function uploadLaporan() {
    if (!doc || !laporanFile) return
    setUploading(true)
    const path = `${Date.now()}_${laporanFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: upErr } = await supabase.storage.from('laporan-reviu').upload(path, laporanFile)
    if (upErr) { alert('Gagal upload: ' + upErr.message); setUploading(false); return }
    const sz = laporanFile.size > 1024 * 1024 ? `${(laporanFile.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(laporanFile.size / 1024)} KB`
    await supabase.from('dokumen').update({
      laporan_url: path, laporan_name: laporanFile.name, laporan_size: sz,
      updated_at: new Date().toISOString(),
    }).eq('id', doc.id)
    await supabase.from('riwayat').insert({
      dokumen_id: doc.id, keterangan: `Laporan hasil reviu diupload: ${laporanFile.name}`, warna: 'g',
    })
    setLaporanFile(null); await fetchData(); setUploading(false)
  }

  const stages = useMemo(() => (doc ? stagesFromProgress(doc.progres, doc.status) : []), [doc])
  const timelineEntries = useMemo(
    () => riw.slice().reverse().map((r) => ({ id: r.id, keterangan: r.keterangan, warna: r.warna, created_at: r.created_at, actor: doc?.pic })),
    [riw, doc?.pic]
  )

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          <Skeleton className="h-[520px] rounded-2xl" />
          <div className="space-y-5">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </Layout>
    )
  }
  if (!doc) {
    return (
      <Layout>
        <div className="text-center py-16 text-ink-tertiary">Dokumen tidak ditemukan.</div>
      </Layout>
    )
  }

  return (
    <>
      <Head><title>{doc.nama_dokumen} — Reviewer Workspace</title></Head>
      <Layout>
        <div className="space-y-5">
          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link href="/dokumen" className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Dokumen
            </Link>
            <Link href={`/dokumen/edit/${doc.id}`}>
              <Button variant="secondary" size="sm"><Pencil className="w-3.5 h-3.5" /> Edit Dokumen</Button>
            </Link>
          </div>

          {/* Document header */}
          <Card>
            <CardContent className="!py-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h1 className="font-display text-lg font-semibold text-ink-primary truncate">{doc.nama_dokumen}</h1>
                  <p className="text-sm text-ink-tertiary mt-0.5">{doc.nomor_laporan} · {doc.kategori} · PIC: {doc.pic}</p>
                </div>
                <Badge tone={STATUS_TONE[doc.status] || 'neutral'} className="text-[13px] px-3 py-1">{doc.status}</Badge>
              </div>

              {/* Progress Tracker: Upload → Review → Evaluasi → Final Approval */}
              <div className="mt-5 pt-5 border-t border-border-subtle flex items-center gap-6 flex-wrap">
                <ProgressRing value={doc.progres} size={84} strokeWidth={7} color={STATUS_COLOR[doc.status]} sublabel="selesai" />
                <div className="flex-1 min-w-[260px]">
                  <WorkflowStepper stages={stages} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-border-subtle">
                {[
                  { label: 'Tgl Diajukan', value: doc.tanggal_diajukan },
                  { label: 'Target Selesai', value: doc.target_selesai || '—' },
                  { label: 'Tgl Selesai Reviu', value: doc.tanggal_selesai || 'Belum selesai' },
                  { label: 'Progres', value: `${doc.progres}%` },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-ink-tertiary">{f.label}</p>
                    <p className="text-sm font-medium text-ink-primary mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Workspace: Preview (left) + tabs (right) in one screen */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">
            {/* Document preview */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand-500" /> Dokumen Asli</CardTitle>
                {doc.file_url && (
                  <div className="flex items-center gap-1.5">
                    {previewUrl && (
                      <a href={previewUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md text-ink-tertiary hover:bg-surface-sunken hover:text-ink-primary" title="Perbesar / layar penuh">
                        <Maximize2 className="w-4 h-4" />
                      </a>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => dl(doc.file_url!, 'dokumen-reviu')}>
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="!p-0">
                {!doc.file_url ? (
                  <div className="p-10 text-center text-sm text-ink-tertiary">Belum ada file dokumen</div>
                ) : previewUrl ? (
                  <iframe src={previewUrl} className="w-full h-[560px] bg-surface-sunken" title="Pratinjau dokumen" />
                ) : (
                  <div className="p-6 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-info-subtle text-info flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-primary truncate">{doc.file_name}</p>
                      <p className="text-xs text-ink-tertiary">{doc.file_size} · Pratinjau tersedia untuk file PDF</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unified workspace tabs: Checklist/Approval · Catatan · Riwayat */}
            <Card>
              <Tabs defaultValue="approval">
                <CardHeader className="!pb-0 !border-b-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="approval" className="flex-1"><BadgeCheck className="w-3.5 h-3.5 inline mr-1" />Status &amp; Approval</TabsTrigger>
                    <TabsTrigger value="catatan" className="flex-1"><MessageSquare className="w-3.5 h-3.5 inline mr-1" />Catatan</TabsTrigger>
                    <TabsTrigger value="riwayat" className="flex-1"><HistoryIcon className="w-3.5 h-3.5 inline mr-1" />Riwayat</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="approval" className="!mt-4 space-y-4">
                    <div>
                      <label className="label">Status Reviu</label>
                      <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div>
                      <label className="label">Tanggal Selesai</label>
                      <input type="date" className="input" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {STATUS_LIST.map((s) => (
                        <span key={s} className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s] }} />
                          {s} = {STATUS_PROGRES[s]}%
                        </span>
                      ))}
                    </div>
                    <Button onClick={saveStatus} disabled={saving} loading={saving} className="w-full">
                      <CheckCircle2 className="w-4 h-4" /> Simpan &amp; Perbarui Status
                    </Button>

                    <div className="pt-4 mt-4 border-t border-border-subtle">
                      <h3 className="text-xs font-semibold text-ink-secondary mb-2 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" /> Laporan Hasil Reviu
                      </h3>
                      {doc.laporan_url ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-success/20 bg-success-subtle mb-3">
                          <FileWarning className="w-5 h-5 text-success flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-primary truncate">{doc.laporan_name}</p>
                            <p className="text-xs text-ink-tertiary">{doc.laporan_size}</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => dl(doc.laporan_url!, 'laporan-reviu')}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border border-dashed border-border text-xs text-ink-tertiary text-center mb-3">
                          Belum ada laporan hasil reviu
                        </div>
                      )}
                      <label className="block">
                        <div className="border border-dashed border-border rounded-lg px-3 py-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors text-xs text-ink-tertiary text-center flex items-center justify-center gap-2">
                          <UploadCloud className="w-4 h-4" />
                          {laporanFile ? (
                            <span className="text-brand-600 font-medium">{laporanFile.name} ({(laporanFile.size / 1024).toFixed(0)} KB)</span>
                          ) : 'Pilih file laporan (PDF, DOCX, ZIP — maks 20MB)'}
                        </div>
                        <input type="file" accept=".pdf,.doc,.docx,.xlsx,.zip,.rar" className="hidden" onChange={(e) => setLaporanFile(e.target.files?.[0] || null)} />
                      </label>
                      <Button onClick={uploadLaporan} disabled={!laporanFile || uploading} loading={uploading} variant="secondary" size="sm" className="w-full mt-2">
                        Upload Laporan
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="catatan" className="!mt-4">
                    <Textarea
                      className="min-h-32 resize-y"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tulis catatan reviu..."
                    />
                    <Button onClick={saveCatatan} disabled={saving} loading={saving} variant="secondary" size="sm" className="mt-2">
                      <Save className="w-3.5 h-3.5" /> Simpan Catatan
                    </Button>
                  </TabsContent>

                  <TabsContent value="riwayat" className="!mt-4 max-h-[420px] overflow-y-auto pr-1">
                    <ActivityTimeline entries={timelineEntries} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  )
}
