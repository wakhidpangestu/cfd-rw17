'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Minus, Plus, Download, RotateCcw, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function PengunjungPage() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tapping, setTapping] = useState(false)
  const [lastDelta, setLastDelta] = useState<number | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const dateLabel = format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale })

  useEffect(() => {
    async function fetchCount() {
      const { data } = await supabase
        .from('pengunjung_counter')
        .select('count')
        .eq('event_date', today)
        .single()
      setCount(data?.count || 0)
      setLoading(false)
    }
    fetchCount()

    // Realtime subscription
    const channel = supabase
      .channel('pengunjung-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pengunjung_counter',
        filter: `event_date=eq.${today}`,
      }, (payload: any) => {
        if (payload.new?.count !== undefined) {
          setCount(payload.new.count)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [today])

  const increment = useCallback(async () => {
    if (tapping) return
    setTapping(true)
    setCount((c) => c + 1)
    setLastDelta(+1)
    try {
      await supabase.rpc('increment_pengunjung', { target_date: today })
    } catch (e) {
      setCount((c) => c - 1)
    }
    setTimeout(() => { setTapping(false); setLastDelta(null) }, 300)
  }, [tapping, today])

  const decrement = useCallback(async () => {
    if (count <= 0) return
    setCount((c) => Math.max(0, c - 1))
    setLastDelta(-1)
    try {
      await supabase.rpc('decrement_pengunjung', { target_date: today })
    } catch (e) {
      setCount((c) => c + 1)
    }
    setTimeout(() => setLastDelta(null), 300)
  }, [count, today])

  async function handleExport() {
    setExportLoading(true)
    const { data } = await supabase
      .from('pengunjung_counter')
      .select('*')
      .eq('event_date', today)
      .single()
    const { exportPengunjungPDF } = await import('@/lib/pdf-export')
    exportPengunjungPDF(data || { id: '', count, event_date: today, last_updated: new Date().toISOString() }, today)
    setExportLoading(false)
  }

  return (
    <main className="min-h-screen noise-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Bg orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/10 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-emerald-400/8 blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-card-green px-4 py-2 rounded-full text-green-300 text-sm mb-4">
            <Users size={14} />
            Counter Pengunjung
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Pengunjung CFD</h1>
          <p className="text-white/40 text-sm mt-1">{dateLabel}</p>
        </div>

        {/* Big Count Display */}
        <div className="glass-card emboss-green p-8 text-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

          <div className="text-white/30 text-sm font-medium mb-2 tracking-wide uppercase">Total Pengunjung</div>

          <div className="relative">
            <AnimatePresence>
              {lastDelta !== null && (
                <motion.div
                  key={Date.now()}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: lastDelta > 0 ? -40 : 40 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-x-0 top-0 text-2xl font-bold text-center pointer-events-none ${lastDelta > 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {lastDelta > 0 ? '+1' : '-1'}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key={count}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="font-display font-bold gradient-text text-glow"
              style={{ fontSize: 'clamp(5rem, 25vw, 8rem)', lineHeight: 1 }}
            >
              {loading ? (
                <span className="text-white/20">—</span>
              ) : (
                count.toLocaleString('id-ID')
              )}
            </motion.div>
          </div>

          <div className="text-white/30 text-sm mt-2">orang</div>
        </div>

        {/* Main TAP Button */}
        <motion.button
          onClick={increment}
          whileTap={{ scale: 0.95 }}
          className="counter-btn w-full py-7 emboss-green mb-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          disabled={loading}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none rounded-3xl" />
          <Users size={32} className="text-green-400" />
          <span className="font-display font-bold text-white text-xl">TAP — +1 Pengunjung</span>
          <span className="text-green-400/60 text-sm">Klik untuk menambah</span>
        </motion.button>

        {/* Correction button */}
        <button
          onClick={decrement}
          disabled={count <= 0}
          className="w-full glass-card py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-white/70 transition-all text-sm font-medium disabled:opacity-20 mb-6"
        >
          <Minus size={16} />
          Koreksi (-1)
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exportLoading || count === 0}
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

        {/* Tip */}
        <p className="text-center text-white/20 text-xs mt-6">
          Data auto-reset tiap jam 00.00 · tetap tersimpan di database
        </p>
      </div>
    </main>
  )
}
