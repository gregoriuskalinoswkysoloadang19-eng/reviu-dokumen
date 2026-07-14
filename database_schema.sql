-- ============================================================
-- SCHEMA DATABASE — Sistem Monitoring Reviu Dokumen
-- Inspektorat Kabupaten Sumba Barat
-- Jalankan script ini di Supabase > SQL Editor
-- ============================================================

-- 1. Tabel users (profil tambahan selain auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'pimpinan')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel dokumen
CREATE TABLE IF NOT EXISTS public.dokumen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_laporan TEXT NOT NULL,
  nama_dokumen TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('Perencanaan', 'Keuangan', 'Kinerja')),
  pic TEXT,
  tanggal_diajukan DATE NOT NULL,
  target_selesai DATE,
  tanggal_selesai DATE,
  status TEXT NOT NULL DEFAULT 'Belum Direviu'
    CHECK (status IN ('Belum Direviu', 'Dalam Proses', 'Perlu Revisi', 'Selesai')),
  progres INTEGER NOT NULL DEFAULT 0 CHECK (progres >= 0 AND progres <= 100),
  catatan TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel riwayat aktivitas
CREATE TABLE IF NOT EXISTS public.riwayat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dokumen_id UUID NOT NULL REFERENCES public.dokumen(id) ON DELETE CASCADE,
  keterangan TEXT NOT NULL,
  warna TEXT NOT NULL DEFAULT 'x' CHECK (warna IN ('g', 'b', 'a', 'x')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat ENABLE ROW LEVEL SECURITY;

-- Users: bisa baca sendiri
CREATE POLICY "users_read_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Dokumen: semua user login bisa baca & tulis
CREATE POLICY "dokumen_select" ON public.dokumen FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "dokumen_insert" ON public.dokumen FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "dokumen_update" ON public.dokumen FOR UPDATE USING (auth.role() = 'authenticated');

-- Riwayat: semua user login bisa baca & tulis
CREATE POLICY "riwayat_select" ON public.riwayat FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "riwayat_insert" ON public.riwayat FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET untuk file dokumen
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('dokumen-reviu', 'dokumen-reviu', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'dokumen-reviu' AND auth.role() = 'authenticated');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dokumen-reviu' AND auth.role() = 'authenticated');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'dokumen-reviu' AND auth.role() = 'authenticated');

-- ============================================================
-- DATA AWAL: 15 DOKUMEN SAMPLE
-- (Hapus blok ini jika tidak ingin data sample)
-- ============================================================

INSERT INTO public.dokumen (nomor_laporan, nama_dokumen, kategori, pic, tanggal_diajukan, target_selesai, tanggal_selesai, status, progres, catatan) VALUES
('001/REV/2025','Rencana Kerja Anggaran (RKA)','Perencanaan','Biro Perencanaan','2025-01-10','2025-01-20','2025-01-17','Selesai',100,'Dokumen sesuai format. Konsistensi kode program perlu dijaga.'),
('002/REV/2025','Dokumen Pelaksanaan Anggaran (DIPA)','Keuangan','Biro Keuangan','2025-01-15','2025-01-25','2025-01-22','Selesai',100,'DIPA terverifikasi. Kesesuaian dengan RKA terkonfirmasi.'),
('003/REV/2025','Laporan Keuangan Semester I','Keuangan','Biro Keuangan','2025-02-01','2025-02-15','2025-02-10','Selesai',100,'Laporan akurat. Beberapa kode akun perlu penyesuaian.'),
('004/REV/2025','Laporan Keuangan Semester II','Keuangan','Biro Keuangan','2025-07-05','2025-07-20',NULL,'Dalam Proses',55,'Verifikasi saldo akhir. Menunggu rekonsiliasi bagian aset.'),
('005/REV/2025','LKj Triwulan I','Kinerja','Biro Organisasi','2025-04-02','2025-04-12','2025-04-09','Selesai',100,'LKj lengkap. Capaian IKU terdokumentasi.'),
('006/REV/2025','LKj Triwulan II','Kinerja','Biro Organisasi','2025-07-01','2025-07-15',NULL,'Perlu Revisi',40,'Bukti dukung IKU belum lengkap. Dikembalikan untuk revisi.'),
('007/REV/2025','LKj Tahunan','Kinerja','Biro Organisasi','2025-02-15','2025-02-28','2025-02-25','Selesai',100,'Disetujui. Rekomendasi: perbaikan metodologi IKU.'),
('008/REV/2025','Rencana Strategis (Renstra)','Perencanaan','Biro Perencanaan','2025-01-05','2025-01-18','2025-01-15','Selesai',100,'Selaras dengan RPJMN. Tidak ada catatan signifikan.'),
('009/REV/2025','Rencana Kerja (Renja)','Perencanaan','Biro Perencanaan','2025-02-10','2025-02-22','2025-02-20','Selesai',100,'Konsisten dengan Renstra. Alokasi sesuai prioritas.'),
('010/REV/2025','Laporan Realisasi Anggaran','Keuangan','Biro Keuangan','2025-07-12','2025-07-26',NULL,'Dalam Proses',30,'Pengecekan data pendukung. Data Juni masih menunggu.'),
('011/REV/2025','Laporan Aset Tetap','Keuangan','Biro Umum','2025-07-08','2025-07-22',NULL,'Belum Direviu',0,NULL),
('012/REV/2025','Laporan Barang Milik Negara (BMN)','Keuangan','Biro Umum','2025-07-09','2025-07-23',NULL,'Belum Direviu',0,NULL),
('013/REV/2025','Evaluasi Program Prioritas','Kinerja','Biro Organisasi','2025-07-10','2025-07-24',NULL,'Belum Direviu',0,NULL),
('014/REV/2025','Laporan Monitoring dan Evaluasi','Kinerja','Biro Organisasi','2025-07-15','2025-07-29',NULL,'Dalam Proses',20,'Pengumpulan data realisasi dari unit kerja.'),
('015/REV/2025','Laporan Keuangan Tahunan (Audited)','Keuangan','Biro Keuangan','2025-07-18','2025-08-01',NULL,'Belum Direviu',0,NULL);
