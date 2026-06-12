import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'CFD & Bazar UMKM RW 17',
  description: 'Car Free Day dan Bazar UMKM RW 17 — Ruang Gerak, Ruang Juang, Ruang Warga.',
  openGraph: {
    title: 'CFD & Bazar UMKM RW 17',
    description: 'Car Free Day dan Bazar UMKM RW 17',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn(inter.variable, sora.variable, "font-sans")}>
      <body className="bg-[#050e08] text-white antialiased">{children}</body>
    </html>
  )
}
