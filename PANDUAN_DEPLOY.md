# Panduan Deploy Aplikasi Monitoring Reviu Dokumen
## Inspektorat Kabupaten Sumba Barat

Estimasi waktu: **30–45 menit** | Biaya: **Gratis**

---

## Gambaran Umum

```
GitHub (kode)  →  Vercel (hosting)  ←→  Supabase (database + file)
```

---

## LANGKAH 1 — Persiapkan GitHub

1. Buka https://github.com dan buat akun (gratis)
2. Klik **New repository** (tombol hijau)
3. Nama repository: `reviu-dokumen-sumba-barat`
4. Pilih **Private** (agar kode tidak publik)
5. Klik **Create repository**
6. Upload semua file dari folder `reviu-app` ke repository ini
   - Klik **uploading an existing file**
   - Drag & drop semua file

---

## LANGKAH 2 — Setup Supabase (Database)

### 2a. Buat akun & project
1. Buka https://supabase.com → klik **Start your project**
2. Daftar dengan akun Google atau email
3. Klik **New project**
4. Isi:
   - **Name**: `reviu-dokumen`
   - **Database Password**: buat password kuat, **simpan baik-baik!**
   - **Region**: pilih `Southeast Asia (Singapore)`
5. Klik **Create new project** — tunggu 1–2 menit

### 2b. Jalankan SQL schema
1. Di sidebar Supabase, klik **SQL Editor**
2. Klik **New query**
3. Buka file `database_schema.sql` dari folder yang diunduh
4. Copy semua isinya, paste ke SQL Editor
5. Klik **Run** (atau tekan Ctrl+Enter)
6. Pastikan muncul pesan "Success"

### 2c. Buat user login pertama
1. Di sidebar, klik **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
3. Isi email dan password untuk akun Admin
4. Setelah dibuat, catat UUID user (klik user tersebut)
5. Kembali ke **SQL Editor**, jalankan:
```sql
INSERT INTO public.users (id, email, nama, role)
VALUES (
  'UUID_DARI_LANGKAH_4_DI_ATAS',
  'admin@sumbabarat.go.id',
  'Administrator',
  'admin'
);
```

### 2d. Catat API Keys
1. Di sidebar, klik **Project Settings** → **API**
2. Catat dua nilai ini (akan dipakai di Vercel):
   - **Project URL**: `https://xxxxxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (string panjang)

---

## LANGKAH 3 — Deploy ke Vercel

1. Buka https://vercel.com → daftar dengan akun GitHub
2. Klik **Add New Project**
3. Import repository `reviu-dokumen-sumba-barat` dari GitHub
4. Sebelum deploy, klik **Environment Variables** dan tambahkan:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL dari langkah 2d |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dari langkah 2d |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `dokumen-reviu` |

5. Klik **Deploy** — tunggu 2–3 menit
6. Setelah selesai, Vercel memberikan URL seperti:
   `https://reviu-dokumen-sumba-barat.vercel.app`

**Aplikasi sudah online dan bisa diakses dari mana saja!**

---

## LANGKAH 4 — Domain Kustom (Opsional)

Jika ingin domain seperti `reviu.sumbabarat.go.id`:
1. Di Vercel → **Settings** → **Domains**
2. Tambahkan domain yang diinginkan
3. Ikuti instruksi untuk mengatur DNS di pengelola domain

---

## Menambah User Baru

Untuk menambah operator atau pimpinan:
1. Supabase → **Authentication** → **Users** → **Add user**
2. Isi email & password
3. Jalankan SQL:
```sql
INSERT INTO public.users (id, email, nama, role)
VALUES ('UUID_USER_BARU', 'email@domain.com', 'Nama Lengkap', 'operator');
-- Role: 'admin' | 'operator' | 'pimpinan'
```

---

## Troubleshooting

**Halaman putih setelah login**
→ Periksa environment variables di Vercel sudah benar

**Error "Invalid API key"**
→ Pastikan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi dengan benar

**Upload file gagal**
→ Periksa storage bucket `dokumen-reviu` sudah dibuat (otomatis via SQL schema)

**Database tidak terisi**
→ Jalankan ulang `database_schema.sql` di SQL Editor Supabase

---

## Struktur File Aplikasi

```
reviu-app/
├── pages/
│   ├── index.tsx          ← Dashboard
│   ├── login.tsx          ← Halaman login
│   ├── register.tsx       ← Form register dokumen baru
│   ├── rekapitulasi.tsx   ← Halaman rekapitulasi
│   └── dokumen/
│       ├── index.tsx      ← Daftar semua dokumen
│       └── [id].tsx       ← Detail & update dokumen
├── components/
│   └── Layout.tsx         ← Sidebar + navigation
├── lib/
│   └── supabase.ts        ← Koneksi database
├── styles/
│   └── globals.css        ← Styling global
├── database_schema.sql    ← Script SQL untuk Supabase
├── .env.example           ← Template environment variables
└── package.json           ← Dependensi aplikasi
```

---

*Dibuat untuk Inspektorat Kabupaten Sumba Barat*
