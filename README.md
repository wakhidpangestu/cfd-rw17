# CFD & Bazar UMKM RW 17

Website resmi CFD dan Bazar UMKM RW 17 — modern, mobile-first, berbasis Next.js + Supabase.

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS + custom glass/emboss CSS
- **Animasi**: Framer Motion
- **PDF Export**: jsPDF + jspdf-autotable
- **Deploy**: Vercel

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Buat project Supabase
- Pergi ke [supabase.com](https://supabase.com) → New Project
- Copy **Project URL** dan **anon key**

### 3. Jalankan schema SQL
Buka Supabase → SQL Editor → paste isi file `lib/schema.sql` → Run

### 4. Environment variables
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
CRON_SECRET=rahasia_random_string_kamu
```

### 5. Jalankan dev
```bash
npm run dev
```

---

## Halaman

| Halaman | URL | Keterangan |
|---------|-----|------------|
| Homepage | `/` | Publik, halaman utama |
| Daftar UMKM | `/hidden/umkm` | Tersembunyi, formulir pendaftaran |
| Counter Pengunjung | `/hidden/pengunjung` | Tersembunyi, tap counter |
| Counter Parkiran | `/hidden/parkiran` | Tersembunyi, 3 jenis kendaraan |

> Halaman `/hidden/*` tidak terlink dari homepage manapun. Bagikan URL-nya manual ke petugas.

---

## Auto Reset

Data **tidak dihapus** — sistem otomatis filter berdasarkan tanggal hari ini.
Setiap hari baru = tampilan mulai dari 0, tapi semua histori tetap ada di Supabase.

Tabel rekap di homepage menampilkan semua data historis per tanggal acara.

---

## Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Tambahkan environment variables di Vercel dashboard → Settings → Environment Variables.

Untuk cron midnight reset, tambahkan `CRON_SECRET` di env vars Vercel.

---

## Instagram & TikTok Feed (Realtime)

Untuk feed realtime:
1. **Instagram**: Daftar di [Meta Developers](https://developers.facebook.com) → Instagram Basic Display API
2. **TikTok**: [TikTok for Developers](https://developers.tiktok.com) → Content Posting API

Saat ini feed menggunakan placeholder. Ganti komponen `SocialFeedSection` di `app/page.tsx` dengan API call ke endpoint Instagram/TikTok setelah dapat access token.

---

## Kustomisasi

- **Nama & lokasi**: Edit teks di `app/page.tsx`
- **Social media links**: Cari `href="https://instagram.com"` dan `href="https://tiktok.com"` di `app/page.tsx`
- **Warna tema**: Edit `--green-primary` di `app/globals.css`
- **Jam cron**: Edit `vercel.json` → schedule `"0 17 * * *"` = jam 17:00 UTC = 00:00 WIB
# cfd-rw17
