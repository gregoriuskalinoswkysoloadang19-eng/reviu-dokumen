// Status workflow dengan progres otomatis
export const STATUS_LIST = [
  'Belum Direviu',
  'Dalam Proses',
  'Perlu Revisi',
  'Penyusunan Laporan Hasil Reviu',
  'Selesai',
] as const

export const STATUS_PROGRES: Record<string, number> = {
  'Belum Direviu': 0,
  'Perlu Revisi': 25,
  'Dalam Proses': 50,
  'Penyusunan Laporan Hasil Reviu': 75,
  'Selesai': 100,
}

export const STATUS_COLOR: Record<string, string> = {
  'Belum Direviu': '#9ca3af',
  'Perlu Revisi': '#d97706',
  'Dalam Proses': '#2563eb',
  'Penyusunan Laporan Hasil Reviu': '#7c3aed',
  'Selesai': '#16a34a',
}

export const STATUS_BADGE: Record<string, string> = {
  'Selesai': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  'Dalam Proses': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  'Belum Direviu': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700',
  'Perlu Revisi': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800',
  'Penyusunan Laporan Hasil Reviu': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700',
}

export const KATEGORI_LIST = ['Perencanaan', 'Keuangan', 'Kinerja']

export const WARNA_RIWAYAT: Record<string, string> = {
  g: '#16a34a', b: '#2563eb', a: '#d97706', x: '#9ca3af', v: '#7c3aed', r: '#dc2626'
}
