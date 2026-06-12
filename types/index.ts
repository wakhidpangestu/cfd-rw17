export interface UMKMRegistration {
  id: string
  nama_usaha: string
  nama_pemilik: string
  jenis_produk: string
  kategori: string
  nomor_hp: string
  lokasi_lapak?: string
  deskripsi?: string
  event_date: string
  created_at: string
}

export interface UMKMKehadiran {
  id: string
  umkm_id: string
  event_date: string
  hadir: boolean
  created_at: string
}

export interface PengunjungCounter {
  id: string
  count: number
  event_date: string
  last_updated: string
}

export interface ParkiranCounter {
  id: string
  motor: number
  mobil: number
  sepeda: number
  event_date: string
  last_updated: string
}

export type KategoriUMKM =
  | 'Makanan & Minuman'
  | 'Fashion & Pakaian'
  | 'Kerajinan Tangan'
  | 'Kesehatan & Kecantikan'
  | 'Elektronik'
  | 'Tanaman & Bunga'
  | 'Lainnya'

export type VehicleType = 'motor' | 'mobil' | 'sepeda'
