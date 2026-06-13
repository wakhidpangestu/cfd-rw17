'use client'

import { useState, useRef, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Store, User, Phone, MapPin, Package, FileText, ChevronRight, Check,
  Download, Trash2, RefreshCw, Pencil, CheckCircle2, XCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { UMKMRegistration, UMKMKehadiran, KategoriUMKM } from '@/types'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const KATEGORI_LIST: KategoriUMKM[] = [
  'Makanan & Minuman',
  'Fashion & Pakaian',
  'Kerajinan Tangan',
  'Kesehatan & Kecantikan',
  'Elektronik',
  'Tanaman & Bunga',
  'Lainnya',
]

const STEPS = [
  { id: 1, title: 'Nama Usaha', field: 'nama_usaha', icon: Store, placeholder: 'Contoh: Warung Bu Sari', type: 'text' },
  { id: 2, title: 'Nama Pemilik', field: 'nama_pemilik', icon: User, placeholder: 'Nama lengkap pemilik usaha', type: 'text' },
  { id: 3, title: 'Nomor HP', field: 'nomor_hp', icon: Phone, placeholder: '08xxxxxxxxxx', type: 'tel' },
  { id: 4, title: 'Kategori Usaha', field: 'kategori', icon: Package, placeholder: '', type: 'select' },
  { id: 5, title: 'Jenis Produk', field: 'jenis_produk', icon: Package, placeholder: 'Contoh: Nasi Goreng, Baju Batik, dll', type: 'text' },
  { id: 6, title: 'Lokasi Lapak', field: 'lokasi_lapak', icon: MapPin, placeholder: 'Contoh: Blok A No. 3', type: 'text' },
  { id: 7, title: 'Deskripsi (Opsional)', field: 'deskripsi', icon: FileText, placeholder: 'Ceritakan sedikit tentang usaha Anda...', type: 'textarea' },
]

type FormData = {
  nama_usaha: string
  nama_pemilik: string
  nomor_hp: string
  kategori: string
  jenis_produk: string
  lokasi_lapak: string
  deskripsi: string
}

const EMPTY_FORM: FormData = {
  nama_usaha: '', nama_pemilik: '', nomor_hp: '', kategori: '',
  jenis_produk: '', lokasi_lapak: '', deskripsi: ''
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 mb-8">
      <motion.div
        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ onReset, isEdit }: { onReset: () => void; isEdit: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-10"
    >
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6 glow-green">
        <Check size={36} className="text-green-400" />
      </div>
      <h3 className="font-display text-2xl font-bold text-white mb-2">
        {isEdit ? 'Berhasil Diperbarui!' : 'Berhasil Terdaftar!'}
      </h3>
      <p className="text-white/50 mb-8 text-sm">
        {isEdit
          ? 'Data UMKM telah berhasil diperbarui.'
          : 'Data UMKM tersimpan permanen. Absen kehadiran setiap hari bazar!'}
      </p>
      <button
        onClick={onReset}
        className="btn-shimmer px-8 py-3.5 rounded-full font-semibold text-white flex items-center gap-2 mx-auto"
      >
        <RefreshCw size={16} />
        {isEdit ? 'Kembali' : 'Daftar Lagi'}
      </button>
    </motion.div>
  )
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 60

interface SwipeCardProps {
  umkm: UMKMRegistration
  index: number
  today: string
  kehadiran: UMKMKehadiran | undefined
  onEdit: (r: UMKMRegistration) => void
  onDelete: (id: string) => void
  onSetHadir: (umkmId: string, hadir: boolean) => void
}

const SwipeCard = memo(function SwipeCard({ umkm, index, today, kehadiran, onEdit, onDelete, onSetHadir }: SwipeCardProps) {
  const x = useMotionValue(0)
  const [swipeState, setSwipeState] = useState<'idle' | 'left' | 'right'>('idle')

  const REVEAL = 125 // snap width in pixels
  const SWIPE_THRESHOLD = 60

  const handleDragEnd = (event: any, info: any) => {
    const currentX = x.get()
    const velocity = info.velocity.x

    let targetX = 0
    let newState: 'idle' | 'left' | 'right' = 'idle'

    if (currentX > SWIPE_THRESHOLD || velocity > 300) {
      targetX = REVEAL
      newState = 'right'
    } else if (currentX < -SWIPE_THRESHOLD || velocity < -300) {
      targetX = -REVEAL
      newState = 'left'
    }

    setSwipeState(newState)
    animate(x, targetX, { type: 'spring', stiffness: 400, damping: 40 })
  }

  const close = () => {
    setSwipeState('idle')
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 })
  }

  const attendanceStatus = kehadiran === undefined
    ? null       // not marked yet
    : kehadiran.hadir
      ? true     // hadir
      : false    // tidak hadir

  // Transform opacity and scale of background action buttons dynamically during swipe
  const leftOpacity = useTransform(x, [-120, -20, 0], [1, 1, 0])
  const leftScale = useTransform(x, [-120, -20, 0], [1, 1, 0])

  const rightOpacity = useTransform(x, [0, 20, 120], [0, 1, 1])
  const rightScale = useTransform(x, [0, 20, 120], [0, 1, 1])

  return (
    <div className="relative overflow-hidden rounded-xl select-none">
      {/* ── Left background (edit/delete) — reveals when swiped LEFT (x is negative) ── */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4 gap-2 rounded-xl bg-transparent"
        style={{
          pointerEvents: swipeState === 'left' ? 'auto' : 'none',
        }}
      >
        <motion.button
          onClick={() => { close(); onEdit(umkm) }}
          style={{ opacity: leftOpacity, scale: leftScale }}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg"
        >
          <Pencil size={16} />
          <span className="text-[8px] font-bold mt-0.5">Edit</span>
        </motion.button>
        <motion.button
          onClick={() => { close(); onDelete(umkm.id) }}
          style={{ opacity: leftOpacity, scale: leftScale }}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg"
        >
          <Trash2 size={16} />
          <span className="text-[8px] font-bold mt-0.5">Hapus</span>
        </motion.button>
      </div>

      {/* ── Right background (attendance) — reveals when swiped RIGHT (x is positive) ── */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-4 gap-2 rounded-xl bg-transparent"
        style={{
          pointerEvents: swipeState === 'right' ? 'auto' : 'none',
        }}
      >
        <motion.button
          onClick={() => { close(); onSetHadir(umkm.id, true) }}
          style={{ opacity: rightOpacity, scale: rightScale }}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg"
        >
          <CheckCircle2 size={16} />
          <span className="text-[8px] font-bold mt-0.5">Hadir</span>
        </motion.button>
        <motion.button
          onClick={() => { close(); onSetHadir(umkm.id, false) }}
          style={{ opacity: rightOpacity, scale: rightScale }}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg"
        >
          <XCircle size={16} />
          <span className="text-[8px] font-bold mt-0.5">Absen</span>
        </motion.button>
      </div>

      {/* ── Draggable card face ── */}
      <motion.div
        style={{ x, touchAction: 'pan-y' }}
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="relative z-10 flex items-center gap-3 px-3 py-3 bg-[#0a1a0f]/90 border border-white/8 rounded-xl cursor-grab active:cursor-grabbing"
      >
        {/* Number + Status badge */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 w-8">
          <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 text-xs font-bold">
            {index + 1}
          </div>
          {attendanceStatus === true && (
            <CheckCircle2 size={14} className="text-blue-400" />
          )}
          {attendanceStatus === false && (
            <XCircle size={14} className="text-red-400" />
          )}
          {attendanceStatus === null && (
            <div className="w-3.5 h-3.5 rounded-full border border-white/15" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{umkm.nama_usaha}</div>
          <div className="text-xs text-white/40 truncate">{umkm.nama_pemilik} · {umkm.kategori}</div>
        </div>

        {/* Attendance chip */}
        <div className="flex-shrink-0 text-right">
          {attendanceStatus === true && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
              Hadir
            </span>
          )}
          {attendanceStatus === false && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
              Absen
            </span>
          )}
          {attendanceStatus === null && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/25 border border-white/10">
              Belum
            </span>
          )}
        </div>

        {/* Swipe hint chevrons */}
        <div className="flex-shrink-0 flex flex-col items-center gap-0.5 opacity-20">
          <div className="text-[8px] text-white/60 leading-none">←→</div>
        </div>
      </motion.div>
    </div>
  )
})

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UMKMPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [registrations, setRegistrations] = useState<UMKMRegistration[]>([])
  const [kehadiranMap, setKehadiranMap] = useState<Record<string, UMKMKehadiran>>({}) // keyed by umkm_id
  const [loadingList, setLoadingList] = useState(true)
  const [showList, setShowList] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoadingList(true)
    const [umkmRes, kehadiranRes] = await Promise.all([
      supabase
        .from('umkm_registrations')
        .select('*')
        .order('created_at', { ascending: true }),
      supabase
        .from('umkm_kehadiran')
        .select('*')
        .eq('event_date', TODAY),
    ])
    setRegistrations(umkmRes.data || [])
    // Build map: umkm_id → kehadiran record
    const map: Record<string, UMKMKehadiran> = {}
    for (const k of (kehadiranRes.data || [])) {
      map[k.umkm_id] = k
    }
    setKehadiranMap(map)
    setLoadingList(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    try {
      if (editingId) {
        await supabase
          .from('umkm_registrations')
          .update({ ...form })
          .eq('id', editingId)
      } else {
        await supabase.from('umkm_registrations').insert({
          ...form,
          event_date: TODAY,
        })
      }
      setSubmitted(true)
      await fetchAll()
    } catch (e) {
      alert('Gagal menyimpan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }, [form, editingId, fetchAll])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Hapus data UMKM ini secara permanen?')) return
    await supabase.from('umkm_registrations').delete().eq('id', id)
    await fetchAll()
  }, [fetchAll])

  const handleSetHadir = useCallback(async (umkmId: string, hadir: boolean) => {
    await supabase
      .from('umkm_kehadiran')
      .upsert(
        { umkm_id: umkmId, event_date: TODAY, hadir },
        { onConflict: 'umkm_id,event_date' }
      )

    // Optimistic update
    setKehadiranMap(prev => ({
      ...prev,
      [umkmId]: {
        id: prev[umkmId]?.id ?? '',
        umkm_id: umkmId,
        event_date: TODAY,
        hadir,
        created_at: prev[umkmId]?.created_at ?? new Date().toISOString(),
      }
    }))
  }, [])

  const handleEdit = useCallback((r: UMKMRegistration) => {
    setForm({
      nama_usaha: r.nama_usaha,
      nama_pemilik: r.nama_pemilik,
      nomor_hp: r.nomor_hp,
      kategori: r.kategori,
      jenis_produk: r.jenis_produk,
      lokasi_lapak: r.lokasi_lapak || '',
      deskripsi: r.deskripsi || '',
    })
    setEditingId(r.id)
    setStep(1)
    setSubmitted(false)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setStep(0)
  }, [])

  const handleExport = useCallback(async () => {
    setExportLoading(true)
    const { exportUMKMPDF } = await import('@/lib/pdf-export')
    exportUMKMPDF(registrations, TODAY)
    setExportLoading(false)
  }, [registrations])

  const handleReset = useCallback(() => {
    setForm(EMPTY_FORM)
    setStep(editingId ? 0 : 1)
    setSubmitted(false)
    setEditingId(null)
  }, [editingId])

  const currentStep = STEPS[step - 1]
  const fieldValue = currentStep ? form[currentStep.field as keyof FormData] : ''

  const handleNext = useCallback(() => {
    if (step < STEPS.length) setStep(prev => prev + 1)
    else handleSubmit()
  }, [step, handleSubmit])

  const isValid =
    step === 0 ||
    currentStep?.field === 'lokasi_lapak' ||
    currentStep?.field === 'deskripsi' ||
    fieldValue.trim().length > 0

  const hadirCount = Object.values(kehadiranMap).filter(k => k.hadir).length
  const absenCount = Object.values(kehadiranMap).filter(k => !k.hadir).length

  return (
    <main className="min-h-screen noise-bg py-8 px-4">
      {/* Bg orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-green-500/8 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-emerald-400/6 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass-card-green px-4 py-2 rounded-full text-green-300 text-sm mb-4">
            <Store size={14} />
            Pendaftaran UMKM
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Daftar & Absen Bazar</h1>
          <p className="text-white/40 text-sm mt-1">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale })}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card emboss p-6 mb-6">
          {step > 0 && !submitted && <ProgressBar current={step} total={STEPS.length} />}

          <AnimatePresence mode="wait">
            {/* Intro */}
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-5">
                  <Store size={28} className="text-green-400" />
                </div>
                <h2 className="font-display text-xl font-bold text-white mb-2">Selamat Datang, Penjual!</h2>
                <p className="text-white/50 text-sm mb-2 leading-relaxed">
                  Daftarkan usaha Anda sekali, lalu absen hadir setiap hari bazar.
                </p>
                <p className="text-white/30 text-xs mb-6">
                  Data tersimpan permanen — tidak perlu daftar ulang minggu depan.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="btn-shimmer w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                >
                  Mulai Daftar <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Success */}
            {submitted && <SuccessScreen onReset={handleReset} isEdit={!!editingId} />}

            {/* Form Steps */}
            {step > 0 && !submitted && currentStep && (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                    <currentStep.icon size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-green-400/60 font-medium">
                      {editingId ? 'Edit Data UMKM' : `Langkah ${step} dari ${STEPS.length}`}
                    </div>
                    <div className="font-semibold text-white text-base truncate">{currentStep.title}</div>
                  </div>
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors flex-shrink-0"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                {currentStep.type === 'select' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {KATEGORI_LIST.map((k) => (
                      <button
                        key={k}
                        onClick={() => setForm({ ...form, kategori: k })}
                        className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                          form.kategori === k
                            ? 'border-green-500/60 bg-green-500/15 text-green-300'
                            : 'border-white/8 bg-white/3 text-white/60 hover:border-green-500/30'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                ) : currentStep.type === 'textarea' ? (
                  <textarea
                    className="input-glass resize-none h-24"
                    placeholder={currentStep.placeholder}
                    value={fieldValue}
                    onChange={(e) => setForm({ ...form, [currentStep.field]: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <input
                    type={currentStep.type}
                    className="input-glass"
                    placeholder={currentStep.placeholder}
                    value={fieldValue}
                    onChange={(e) => setForm({ ...form, [currentStep.field]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && isValid && handleNext()}
                    autoFocus
                  />
                )}

                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="glass-card px-5 py-3 rounded-xl text-white/60 font-medium hover:text-white transition-colors"
                    >
                      Kembali
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!isValid || submitting}
                    className="btn-shimmer flex-1 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : step === STEPS.length ? (
                      <>
                        {editingId ? 'Simpan Perubahan' : 'Daftarkan Sekarang'}{' '}
                        <Check size={16} />
                      </>
                    ) : (
                      <>Lanjut <ChevronRight size={16} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── List Section ─────────────────────────────────────────── */}
        <div className="glass-card emboss overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <div className="font-semibold text-white text-sm">Semua UMKM Terdaftar</div>
              <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
                <span>{registrations.length} merchant</span>
                {showList && registrations.length > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-blue-400">{hadirCount} hadir</span>
                    <span className="text-white/20">·</span>
                    <span className="text-red-400">{absenCount} absen</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={registrations.length === 0 || exportLoading}
                className="glass-card-green px-3 py-1.5 rounded-lg text-xs text-green-300 font-medium flex items-center gap-1.5 disabled:opacity-30"
              >
                <Download size={12} />
                PDF
              </button>
              <button
                onClick={() => setShowList(!showList)}
                className="glass-card px-3 py-1.5 rounded-lg text-xs text-white/60 font-medium"
              >
                {showList ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          {/* List */}
          {showList && (
            <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto p-3 space-y-2">
              {loadingList ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">
                  <Store size={32} className="mx-auto mb-2 opacity-20" />
                  Belum ada UMKM terdaftar
                </div>
              ) : (
                registrations.map((r, i) => (
                  <SwipeCard
                    key={r.id}
                    umkm={r}
                    index={i}
                    today={TODAY}
                    kehadiran={kehadiranMap[r.id]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetHadir={handleSetHadir}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
