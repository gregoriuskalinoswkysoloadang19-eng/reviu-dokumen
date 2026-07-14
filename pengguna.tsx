import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      dokumen: {
        Row: {
          id: string
          nomor_laporan: string
          nama_dokumen: string
          kategori: 'Perencanaan' | 'Keuangan' | 'Kinerja'
          pic: string
          tanggal_diajukan: string
          target_selesai: string | null
          tanggal_selesai: string | null
          status: 'Belum Direviu' | 'Dalam Proses' | 'Perlu Revisi' | 'Selesai'
          progres: number
          catatan: string | null
          file_url: string | null
          file_name: string | null
          file_size: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['dokumen']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dokumen']['Insert']>
      }
      riwayat: {
        Row: {
          id: string
          dokumen_id: string
          keterangan: string
          warna: 'g' | 'b' | 'a' | 'x'
          created_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['riwayat']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['riwayat']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          nama: string
          role: 'admin' | 'operator' | 'pimpinan'
          created_at: string
        }
      }
    }
  }
}
