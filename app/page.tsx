'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Instagram, Youtube, Music2, MapPin, Users, Store,
  ChevronDown, ExternalLink, Calendar, TrendingUp, Car, Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { UMKMRegistration, PengunjungCounter, ParkiranCounter } from '@/types'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// ============ COMPONENTS ============

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 10}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            opacity: 0.4 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg">
      <ParticleField />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-emerald-400/8 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-card-green emboss px-4 py-2 mb-8 text-sm text-green-300"
        >
          <MapPin size={14} />
          <span>RW 17 · Setiap Minggu Pagi</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display font-bold leading-tight mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="text-white block text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light">Selamat Datang di</span>
          <span className="gradient-text text-glow block my-2 py-1">CFD & Bazar UMKM</span>
          <span className="text-white/90 block text-2xl sm:text-4xl md:text-5xl font-semibold">RW 17</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm sm:text-lg md:text-xl text-white/50 mb-10 font-light max-w-2xl mx-auto px-4"
        >
          Ruang Gerak, Ruang Juang, Ruang Warga.
          <br />
          <span className="text-green-400/80">Bersama membangun ekonomi lokal.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto px-4"
        >
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white shadow-lg glow-green w-full sm:w-auto"
          >
            <Instagram size={18} />
            Follow Instagram
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white/80 hover:text-white hover:border-green-500/40 transition-all w-full sm:w-auto"
          >
            <Music2 size={18} />
            TikTok Kami
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <motion.div
          style={{ opacity }}
          className="flex flex-col items-center gap-2 text-white/30 text-xs"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </section>
  )
}
function SocialFeedSection() {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'tiktok'>('all')

  const posts = [
    {
      id: 1,
      platform: 'instagram',
      type: 'video',
      caption: 'Keseruan CFD pagi ini di RW 17! 🌿 #CFD #RW17',
      likes: 124,
      emoji: '🌿',
      localUrl: '/videos/post1.mp4',
      url: 'https://www.instagram.com/reel/DS90gZAD4hK/?igsh=MTI1aHgyZ2cycjcxZg=='
    },
    {
      id: 2,
      platform: 'instagram',
      type: 'video',
      caption: 'Live dari bazar UMKM minggu ini! 🛒 #UMKMRW17',
      likes: 215,
      emoji: '🛒',
      localUrl: '/videos/post2.mp4',
      url: 'https://www.instagram.com/reel/DDHaQ24y_xq/?igsh=cms2bXg3bjE5bWZt'
    },
    {
      id: 3,
      platform: 'instagram',
      type: 'video',
      caption: 'Kuliner lokal pilihan warga 🍜 #UMKM',
      likes: 189,
      emoji: '🍜',
      localUrl: '/videos/post3.mp4',
      url: 'https://www.instagram.com/reel/DJbeqZ0TXDY/?igsh=MW4xaGppbm9ybXVtMw=='
    },
    {
      id: 4,
      platform: 'tiktok',
      type: 'video',
      caption: 'Kemeriahan jalan sehat dan senam bersama warga RW 17! 💪 #TikTokCFD',
      likes: 342,
      emoji: '💪',
      localUrl: '/videos/post4.mp4',
      url: 'https://vt.tiktok.com/ZSQPaoNYs/'
    },
    {
      id: 5,
      platform: 'tiktok',
      type: 'video',
      caption: 'Rekomendasi jajanan CFD yang wajib dicoba! 🥞 #JajananCFD',
      likes: 412,
      emoji: '🥞',
      localUrl: '/videos/post5.mp4',
      url: 'https://vt.tiktok.com/ZSQPmAXSF/'
    },
    {
      id: 6,
      platform: 'tiktok',
      type: 'video',
      caption: 'Semangat gotong royong warga setelah CFD! ✨ #RW17Clean',
      likes: 275,
      emoji: '✨',
      localUrl: '/videos/post6.mp4',
      url: 'https://vt.tiktok.com/ZSQPmgc1Y/'
    },
  ]

  const filteredPosts = platformFilter === 'all'
    ? posts
    : posts.filter((post) => post.platform === platformFilter)

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 text-green-400 text-sm font-medium mb-3">
            <Instagram size={16} />
            <span>Feed Sosial Media</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Ikuti Keseruan Kami
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Momen terbaik dari setiap acara CFD & Bazar UMKM RW 17
          </p>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-3 justify-center mb-8 reveal">
          {[
            { id: 'all', label: 'Semua', icon: Instagram },
            { id: 'instagram', label: 'Instagram', icon: Instagram },
            { id: 'tiktok', label: 'TikTok', icon: Music2 },
          ].map((tab) => {
            const isActive = platformFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setPlatformFilter(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? 'border-green-500/60 bg-green-500/15 text-green-300'
                    : 'glass-card border-white/8 text-white/70 hover:text-white hover:border-green-500/40'
                }`}
              >
                {tab.id !== 'all' && <tab.icon size={15} />}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-xs sm:max-w-md md:max-w-none mx-auto reveal">
          {filteredPosts.map((post) => (
            <motion.a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card emboss relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 hover:border-green-500/30 transition-all hover:scale-[1.01] duration-300 block group"
            >
              {/* Native Video Player */}
              <video
                src={post.localUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white text-xs font-semibold line-clamp-3 mb-2">{post.caption}</p>
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span className="flex items-center gap-1 text-red-400">
                    <span>❤</span>
                    <span className="text-white font-medium">{post.likes}</span>
                  </span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-semibold text-white">
                    {post.platform}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  )
}

function SocialLinksSection() {
  const links = [
    { platform: 'Instagram', handle: '@cfd_rw17', url: 'https://instagram.com', icon: Instagram, color: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/20' },
    { platform: 'TikTok', handle: '@cfdrw17', url: 'https://tiktok.com', icon: Music2, color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/20' },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 reveal">
          <h2 className="font-display text-3xl font-bold text-white mb-2">Temukan Kami</h2>
          <p className="text-white/40">Ikuti untuk update terbaru setiap acara</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm sm:max-w-none mx-auto reveal">
          {links.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass-card ${link.border} emboss p-4 sm:p-5 flex flex-row items-center gap-4 group hover:scale-[1.02] transition-all`}
            >
              <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                <link.icon size={22} className="text-white/80" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-semibold text-white">{link.platform}</div>
                <div className="text-sm text-white/40">{link.handle}</div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <ExternalLink size={16} className="text-white/30 group-hover:text-white/70 transition-colors" />
                <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors font-medium tracking-wide">Buka</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ ALL-TIME STATISTICS MODAL ============
function AllTimeStatsModal({
  isOpen,
  onClose,
  umkmData,
  visitorData,
  parkingData,
}: {
  isOpen: boolean
  onClose: () => void
  umkmData: UMKMRegistration[]
  visitorData: PengunjungCounter[]
  parkingData: ParkiranCounter[]
}) {
  const [activeTab, setActiveTab] = useState<'umkm' | 'kendaraan'>('umkm')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  if (!isOpen) return null

  const totalEvents = visitorData.length
  const totalVisitors = visitorData.reduce((sum, v) => sum + v.count, 0)
  const totalUMKM = umkmData.length

  const totalMotor = parkingData.reduce((sum, p) => sum + p.motor, 0)
  const totalMobil = parkingData.reduce((sum, p) => sum + p.mobil, 0)
  const totalSepeda = parkingData.reduce((sum, p) => sum + p.sepeda, 0)
  const totalVehicles = totalMotor + totalMobil + totalSepeda

  const filteredUMKM = umkmData.filter((item) => {
    const q = search.toLowerCase()
    return (
      item.nama_usaha.toLowerCase().includes(q) ||
      item.nama_pemilik.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      (item.jenis_produk && item.jenis_produk.toLowerCase().includes(q))
    )
  })

  async function handleExport() {
    setExporting(true)
    try {
      const { exportAllTimePDF } = await import('@/lib/pdf-export')
      exportAllTimePDF(umkmData, visitorData, parkingData)
    } catch (e) {
      console.error(e)
      alert('Gagal mengekspor PDF.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-4xl bg-[#050e08]/95 border border-green-500/20 rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl scrollbar-thin"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
          <div>
            <h3 className="font-display font-bold text-xl md:text-2xl text-white">
              📊 Laporan & Statistik All-Time
            </h3>
            <p className="text-white/40 text-xs sm:text-sm mt-0.5">
              Akumulasi data seluruh pelaksanaan CFD & Bazar UMKM RW 17
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="glass-card-green hover:bg-green-500/20 text-green-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-green-500/30 transition-all shadow-md active:scale-95"
            >
              <Download size={15} />
              {exporting ? 'Membuat PDF...' : 'Cetak PDF Laporan'}
            </button>
            <button
              onClick={onClose}
              className="glass-card px-4 py-2 hover:bg-white/5 text-white/60 hover:text-white rounded-xl text-xs sm:text-sm transition-all"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Acara', value: `${totalEvents} Kali`, emoji: '📅', color: 'text-green-400' },
            { label: 'Total Pengunjung', value: totalVisitors.toLocaleString('id-ID'), emoji: '👥', color: 'text-emerald-400' },
            { label: 'UMKM Terdaftar', value: `${totalUMKM} Merchant`, emoji: '🛒', color: 'text-green-300' },
            { label: 'Total Kendaraan', value: totalVehicles.toLocaleString('id-ID'), emoji: '🚗', color: 'text-cyan-400' },
          ].map((card) => (
            <div key={card.label} className="glass-card emboss p-4 text-center">
              <div className="text-xl mb-1">{card.emoji}</div>
              <div className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">{card.label}</div>
              <div className={`font-display text-lg md:text-xl font-bold mt-1 ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-6 gap-4">
          <button
            onClick={() => setActiveTab('umkm')}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === 'umkm' ? 'text-green-400' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Daftar UMKM ({filteredUMKM.length})
            {activeTab === 'umkm' && (
              <motion.div layoutId="modal-tab-indicator" className="absolute bottom-0 inset-x-0 h-0.5 bg-green-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('kendaraan')}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === 'kendaraan' ? 'text-green-400' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Statistik Kendaraan
            {activeTab === 'kendaraan' && (
              <motion.div layoutId="modal-tab-indicator" className="absolute bottom-0 inset-x-0 h-0.5 bg-green-500" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'umkm' ? (
            <motion.div
              key="umkm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari nama usaha, pemilik, kategori, atau produk..."
                  className="input-glass text-sm animate-pulse-once"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  {filteredUMKM.length === 0 ? (
                    <div className="text-center py-12 text-white/30 text-sm">
                      Tidak ada merchant UMKM yang cocok.
                    </div>
                  ) : (
                    <table className="glass-table w-full text-left">
                      <thead>
                        <tr>
                          <th className="w-10 text-center">#</th>
                          <th className="w-24">Tanggal</th>
                          <th>Nama Usaha</th>
                          <th>Pemilik</th>
                          <th>Kategori</th>
                          <th>Lokasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUMKM.map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center text-white/30">{index + 1}</td>
                            <td className="text-white/50 text-xs">
                              {format(new Date(item.event_date + 'T00:00:00'), 'dd-MM-yyyy')}
                            </td>
                            <td className="font-semibold text-white">{item.nama_usaha}</td>
                            <td>{item.nama_pemilik}</td>
                            <td>
                              <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                                {item.kategori}
                              </span>
                            </td>
                            <td className="text-xs text-white/60">{item.lokasi_lapak || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="kendaraan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Visual custom bar chart */}
              <div className="glass-card emboss p-6 space-y-5">
                <h4 className="font-semibold text-white text-sm">Distribusi Persentase Kendaraan (All-Time)</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Motor 🏍', count: totalMotor, color: 'from-green-500 to-green-600', text: 'text-green-400' },
                    { label: 'Mobil 🚗', count: totalMobil, color: 'from-emerald-400 to-emerald-500', text: 'text-emerald-400' },
                    { label: 'Sepeda 🚲', count: totalSepeda, color: 'from-cyan-400 to-cyan-500', text: 'text-cyan-400' },
                  ].map((v) => {
                    const ratio = totalVehicles > 0 ? (v.count / totalVehicles) * 100 : 0
                    return (
                      <div key={v.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/70">{v.label}</span>
                          <span className={v.text}>
                            {v.count.toLocaleString('id-ID')} Unit ({Math.round(ratio)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ratio}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${v.color} rounded-full`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Data Table */}
              <div className="glass-card overflow-hidden">
                <table className="glass-table w-full text-left">
                  <thead>
                    <tr>
                      <th>Jenis Kendaraan</th>
                      <th className="text-center">Total Unit</th>
                      <th className="text-center">Rata-rata / Acara</th>
                      <th className="text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-white">Sepeda Motor 🏍</td>
                      <td className="text-center">{totalMotor.toLocaleString('id-ID')}</td>
                      <td className="text-center">{Math.round(totalMotor / (totalEvents || 1))} Unit</td>
                      <td className="text-center text-green-400">{totalVehicles > 0 ? Math.round((totalMotor / totalVehicles) * 100) : 0}%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-white">Mobil 🚗</td>
                      <td className="text-center">{totalMobil.toLocaleString('id-ID')}</td>
                      <td className="text-center">{Math.round(totalMobil / (totalEvents || 1))} Unit</td>
                      <td className="text-center text-emerald-400">{totalVehicles > 0 ? Math.round((totalMobil / totalVehicles) * 100) : 0}%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-white">Sepeda 🚲</td>
                      <td className="text-center">{totalSepeda.toLocaleString('id-ID')}</td>
                      <td className="text-center">{Math.round(totalSepeda / (totalEvents || 1))} Unit</td>
                      <td className="text-center text-cyan-400">{totalVehicles > 0 ? Math.round((totalSepeda / totalVehicles) * 100) : 0}%</td>
                    </tr>
                    <tr className="border-t border-white/10 font-bold bg-white/3">
                      <td className="text-white">TOTAL KENDARAAN</td>
                      <td className="text-center text-white">{totalVehicles.toLocaleString('id-ID')}</td>
                      <td className="text-center text-white">{Math.round(totalVehicles / (totalEvents || 1))} Unit</td>
                      <td className="text-center text-white">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function RekapSection() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [events, setEvents] = useState<{ date: string; umkm: number; pengunjung: number; kendaraan: number }[]>([])
  const [loading, setLoading] = useState(true)

  const [rawUmkm, setRawUmkm] = useState<UMKMRegistration[]>([])
  const [rawVisitors, setRawVisitors] = useState<PengunjungCounter[]>([])
  const [rawParking, setRawParking] = useState<ParkiranCounter[]>([])
  const [showAllTimeModal, setShowAllTimeModal] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all data including kehadiran for accurate per-event UMKM count
        const [umkmRes, pengunjungRes, parkiranRes, kehadiranRes] = await Promise.all([
          supabase.from('umkm_registrations').select('*').order('created_at', { ascending: false }),
          supabase.from('pengunjung_counter').select('*').order('event_date', { ascending: false }),
          supabase.from('parkiran_counter').select('*').order('event_date', { ascending: false }),
          supabase.from('umkm_kehadiran').select('umkm_id, event_date, hadir'),
        ])

        if (umkmRes.data) setRawUmkm(umkmRes.data)
        if (pengunjungRes.data) setRawVisitors(pengunjungRes.data)
        if (parkiranRes.data) setRawParking(parkiranRes.data)

        // Count UMKM hadir per event_date from kehadiran table
        const umkmHadirCount: Record<string, number> = {}
        kehadiranRes.data?.forEach((k) => {
          if (k.hadir) {
            umkmHadirCount[k.event_date] = (umkmHadirCount[k.event_date] || 0) + 1
          }
        })

        // Collect all unique event dates (from pengunjung + parkiran + kehadiran)
        const allDates = new Set<string>()
        pengunjungRes.data?.forEach((r) => allDates.add(r.event_date))
        parkiranRes.data?.forEach((r) => allDates.add(r.event_date))
        kehadiranRes.data?.forEach((r) => allDates.add(r.event_date))

        const rows = Array.from(allDates)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => {
            const pengunjung = pengunjungRes.data?.find((r) => r.event_date === date)
            const parkiran = parkiranRes.data?.find((r) => r.event_date === date)
            return {
              date,
              umkm: umkmHadirCount[date] || 0,
              pengunjung: pengunjung?.count || 0,
              kendaraan: parkiran ? parkiran.motor + parkiran.mobil + parkiran.sepeda : 0,
            }
          })

        setEvents(rows)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 text-green-400 text-sm font-medium mb-3">
            <TrendingUp size={16} />
            <span>Rekap Acara</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Statistik Setiap Acara
          </h2>
          <p className="text-white/40">Data peserta CFD dan penjual UMKM dari setiap pelaksanaan</p>
          
          <button
            onClick={() => setShowAllTimeModal(true)}
            className="mt-6 inline-flex items-center gap-2 btn-shimmer px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <TrendingUp size={16} />
            Lihat Laporan & Statistik All-Time
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 reveal">
          {[
            { label: 'Total Acara', value: events.length, icon: Calendar, color: 'text-green-400' },
            { label: 'Total Pengunjung', value: events.reduce((s, e) => s + e.pengunjung, 0), icon: Users, color: 'text-emerald-400' },
            { label: 'Total UMKM', value: events.reduce((s, e) => s + e.umkm, 0), icon: Store, color: 'text-green-300' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card emboss p-4 text-center">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-2`} />
              <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card emboss overflow-hidden reveal">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <Store size={40} className="mx-auto mb-3 opacity-30" />
                <p>Belum ada data acara</p>
              </div>
            ) : (
              <table className="glass-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">Tanggal Acara</th>
                    <th className="text-center">UMKM / Penjual</th>
                    <th className="text-center">Pengunjung CFD</th>
                    <th className="text-center">Kendaraan</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, i) => (
                    <tr key={event.date}>
                      <td className="text-white/30 text-xs">{i + 1}</td>
                      <td>
                        <div className="font-medium text-white">
                          {format(new Date(event.date + 'T00:00:00'), "dd MMM yyyy", { locale: idLocale })}
                        </div>
                        <div className="text-xs text-white/30">
                          {format(new Date(event.date + 'T00:00:00'), "EEEE", { locale: idLocale })}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                          <Store size={12} />
                          {event.umkm}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                          <Users size={12} />
                          {event.pengunjung}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 bg-green-600/10 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                          <Car size={12} />
                          {event.kendaraan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAllTimeModal && (
          <AllTimeStatsModal
            isOpen={showAllTimeModal}
            onClose={() => setShowAllTimeModal(false)}
            umkmData={rawUmkm}
            visitorData={rawVisitors}
            parkingData={rawParking}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="font-display font-bold text-green-400 text-lg">CFD & UMKM RW 17</div>
          <div className="text-white/30 text-sm">Setiap Minggu Pagi · Ruang Warga</div>
        </div>
        <div className="text-white/20 text-xs text-center">
          © {new Date().getFullYear()} RW 17 · Dibuat dengan ❤️ untuk warga
        </div>
      </div>
    </footer>
  )
}

// ============ SCROLL REVEAL HOOK ============
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
        } else {
          e.target.classList.remove('visible')
        }
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ============ PAGE ============
export default function HomePage() {
  useScrollReveal()

  return (
    <main>
      <HeroSection />
      <SocialFeedSection />
      <SocialLinksSection />
      <RekapSection />
      <Footer />
    </main>
  )
}
