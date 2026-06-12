'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { VehicleType } from '@/types'

type Counts = { motor: number; mobil: number; sepeda: number }

const VEHICLES: { type: VehicleType; label: string; emoji: string; color: string; border: string }[] = [
  { type: 'motor', label: 'Motor', emoji: '🏍', color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30' },
  { type: 'mobil', label: 'Mobil', emoji: '🚗', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30' },
  { type: 'sepeda', label: 'Sepeda', emoji: '🚲', color: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/30' },
]

function VehicleCounter({
  vehicle,
  count,
  onIncrement,
  onDecrement,
}: {
  vehicle: typeof VEHICLES[number]
  count: number
  onIncrement: () => void
  onDecrement: () => void
}) {
  const [flash, setFlash] = useState(false)

  function handleTap() {
    setFlash(true)
    onIncrement()
    setTimeout(() => setFlash(false), 200)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Count display */}
      <div className={`glass-card border ${vehicle.border} p-4 text-center`}>
        <div className="text-3xl mb-1">{vehicle.emoji}</div>
        <div className="text-white/40 text-xs font-medium tracking-wide uppercase mb-1">{vehicle.label}</div>
        <motion.div
          key={count}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="font-display font-bold text-4xl gradient-text"
        >
          {count}
        </motion.div>
      </div>

      {/* Tap button */}
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.94 }}
        className={`counter-btn py-5 border ${vehicle.border} bg-gradient-to-b ${vehicle.color} flex flex-col items-center gap-1 relative overflow-hidden`}
        style={{ borderRadius: '20px' }}
      >
        <AnimatePresence>
          {flash && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/10 rounded-[20px]"
            />
          )}
        </AnimatePresence>
        <span className="text-2xl font-bold text-white">+1</span>
        <span className="text-white/50 text-xs">{vehicle.emoji} Masuk</span>
      </motion.button>

      {/* Decrement */}
      <button
        onClick={onDecrement}
        disabled={count <= 0}
        className="glass-card py-2 rounded-xl flex items-center justify-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-all disabled:opacity-20"
      >
        <Minus size={12} />
        Koreksi
      </button>
    </div>
  )
}

export default function ParkiranPage() {
  const [counts, setCounts] = useState<Counts>({ motor: 0, mobil: 0, sepeda: 0 })
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const dateLabel = format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale })
  const total = counts.motor + counts.mobil + counts.sepeda

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('parkiran_counter')
        .select('motor, mobil, sepeda')
        .eq('event_date', today)
        .single()
      if (data) setCounts({ motor: data.motor, mobil: data.mobil, sepeda: data.sepeda })
      setLoading(false)
    }
    fetch()

    // Realtime
    const channel = supabase
      .channel('parkiran-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parkiran_counter',
        filter: `event_date=eq.${today}`,
      }, (payload: any) => {
        if (payload.new) {
          setCounts({ motor: payload.new.motor, mobil: payload.new.mobil, sepeda: payload.new.sepeda })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [today])

  async function increment(type: VehicleType) {
    setCounts((c) => ({ ...c, [type]: c[type] + 1 }))
    await supabase.rpc('increment_parkiran', { target_date: today, vehicle_type: type })
  }

  async function decrement(type: VehicleType) {
    if (counts[type] <= 0) return
    setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - 1) }))
    await supabase.rpc('decrement_parkiran', { target_date: today, vehicle_type: type })
  }

  async function handleExport() {
    setExportLoading(true)
    const { data } = await supabase
      .from('parkiran_counter')
      .select('*')
      .eq('event_date', today)
      .single()
    const { exportParkiranPDF } = await import('@/lib/pdf-export')
    exportParkiranPDF(
      data || { id: '', motor: counts.motor, mobil: counts.mobil, sepeda: counts.sepeda, event_date: today, last_updated: new Date().toISOString() },
      today
    )
    setExportLoading(false)
  }

  return (
    <main className="min-h-screen noise-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Bg orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-teal-500/8 blur-[90px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass-card-green px-4 py-2 rounded-full text-green-300 text-sm mb-4">
            🅿️ Counter Parkiran
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Parkiran Kendaraan</h1>
          <p className="text-white/40 text-sm mt-1">{dateLabel}</p>
        </div>

        {/* Total */}
        <div className="glass-card-green emboss-green p-5 text-center mb-6">
          <div className="text-white/40 text-xs tracking-widest uppercase mb-1">Total Kendaraan</div>
          <motion.div
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-display font-bold text-5xl gradient-text text-glow"
          >
            {loading ? '—' : total}
          </motion.div>
        </div>

        {/* 3 Counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {VEHICLES.map((v) => (
            <VehicleCounter
              key={v.type}
              vehicle={v}
              count={counts[v.type]}
              onIncrement={() => increment(v.type)}
              onDecrement={() => decrement(v.type)}
            />
          ))}
        </div>

        {/* Breakdown bar */}
        {total > 0 && (
          <div className="glass-card p-4 mb-4 rounded-2xl">
            <div className="text-xs text-white/40 mb-2 font-medium">Distribusi Kendaraan</div>
            <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
              {VEHICLES.map((v) => (
                counts[v.type] > 0 && (
                  <motion.div
                    key={v.type}
                    initial={{ width: 0 }}
                    animate={{ width: `${(counts[v.type] / total) * 100}%` }}
                    className="h-full bg-green-500/70 first:rounded-l-full last:rounded-r-full"
                    style={{ opacity: v.type === 'motor' ? 1 : v.type === 'mobil' ? 0.7 : 0.4 }}
                  />
                )
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              {VEHICLES.map((v) => (
                <div key={v.type} className="text-xs text-white/40">
                  {v.emoji} {total > 0 ? Math.round((counts[v.type] / total) * 100) : 0}%
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exportLoading || total === 0}
          className="btn-shimmer w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {exportLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Download size={18} />
              Export PDF Rekap
            </>
          )}
        </button>

        <p className="text-center text-white/20 text-xs mt-5">
          Data auto-reset tiap jam 00.00 · tersimpan di database
        </p>
      </div>
    </main>
  )
}
