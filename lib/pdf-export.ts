import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { UMKMRegistration, PengunjungCounter, ParkiranCounter } from '@/types'

const GREEN_COLOR = { r: 22, g: 163, b: 74 } // #16a34a
const EMERALD_COLOR = { r: 16, g: 185, b: 129 } // #10b981
const CYAN_COLOR = { r: 6, g: 182, b: 212 } // #06b6d4

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Thin modern top accent bar
  doc.setFillColor(GREEN_COLOR.r, GREEN_COLOR.g, GREEN_COLOR.b)
  doc.rect(14, 10, 182, 1.5, 'F')

  // Clean typography header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(20, 20, 20)
  doc.text('CFD & BAZAR UMKM RW 17', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(110, 110, 110)
  doc.text(title, 14, 23)

  doc.text(subtitle, 196, 23, { align: 'right' })

  // Thin bottom divider
  doc.setDrawColor(240, 240, 240)
  doc.setLineWidth(0.4)
  doc.line(14, 26, 196, 26)

  // Reset text color
  doc.setTextColor(20, 20, 20)
}

function applyTableRoundedCorners(data: any, doc: jsPDF, r: number = 3) {
  const rowCount = data.table.body.length
  const colCount = data.table.columns.length

  const isTopLeft = data.section === 'head' && data.row.index === 0 && data.column.index === 0
  const isTopRight = data.section === 'head' && data.row.index === 0 && data.column.index === colCount - 1
  const isBottomLeft = data.section === 'body' && data.row.index === rowCount - 1 && data.column.index === 0
  const isBottomRight = data.section === 'body' && data.row.index === rowCount - 1 && data.column.index === colCount - 1

  if (isTopLeft || isTopRight || isBottomLeft || isBottomRight) {
    const { x, y, width, height } = data.cell
    doc.saveGraphicsState()
    
    // 1. Draw white mask to cover sharp corner
    doc.setFillColor(255, 255, 255)
    if (isTopLeft) {
      doc.moveTo(x, y)
      doc.lineTo(x + r, y)
      doc.curveTo(x + r * 0.448, y, x, y + r * 0.448, x, y + r)
      doc.lineTo(x, y)
      doc.fill()
    } else if (isTopRight) {
      doc.moveTo(x + width, y)
      doc.lineTo(x + width - r, y)
      doc.curveTo(x + width - r * 0.448, y, x + width, y + r * 0.448, x + width, y + r)
      doc.lineTo(x + width, y)
      doc.fill()
    } else if (isBottomLeft) {
      doc.moveTo(x, y + height)
      doc.lineTo(x, y + height - r)
      doc.curveTo(x, y + height - r * 0.448, x + r * 0.448, y + height, x + r, y + height)
      doc.lineTo(x, y + height)
      doc.fill()
    } else if (isBottomRight) {
      doc.moveTo(x + width, y + height)
      doc.lineTo(x + width, y + height - r)
      doc.curveTo(x + width, y + height - r * 0.448, x + width - r * 0.448, y + height, x + width - r, y + height)
      doc.lineTo(x + width, y + height)
      doc.fill()
    }

    // 2. Draw curved border to match the roundness
    doc.setDrawColor(240, 240, 240)
    doc.setLineWidth(0.3)
    if (isTopLeft) {
      doc.moveTo(x + r, y)
      doc.curveTo(x + r * 0.448, y, x, y + r * 0.448, x, y + r)
      doc.stroke()
    } else if (isTopRight) {
      doc.moveTo(x + width - r, y)
      doc.curveTo(x + width - r * 0.448, y, x + width, y + r * 0.448, x + width, y + r)
      doc.stroke()
    } else if (isBottomLeft) {
      doc.moveTo(x, y + height - r)
      doc.curveTo(x, y + height - r * 0.448, x + r * 0.448, y + height, x + r, y + height)
      doc.stroke()
    } else if (isBottomRight) {
      doc.moveTo(x + width, y + height - r)
      doc.curveTo(x + width, y + height - r * 0.448, x + width - r * 0.448, y + height, x + width - r, y + height)
      doc.stroke()
    }

    doc.restoreGraphicsState()
  }
}

function addFooter(doc: jsPDF, pageCount: number) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Thin divider line at bottom
    doc.setDrawColor(240, 240, 240)
    doc.setLineWidth(0.4)
    doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    
    // Left aligned: Print time
    doc.text(
      `Dicetak: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
      14,
      doc.internal.pageSize.height - 10
    )
    
    // Right aligned: Page numbers
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      196,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )
  }
}

function draw3DBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  depth: number,
  baseColor: { r: number; g: number; b: number }
) {
  if (h <= 0) return

  const dx = depth * 0.866 // cos(30 deg)
  const dy = depth * 0.5   // sin(30 deg)

  // 1. Front face (Base color)
  doc.setFillColor(baseColor.r, baseColor.g, baseColor.b)
  doc.rect(x, y - h, w, h, 'F')

  // 2. Right (Side) face (Darker shade: 75% brightness)
  const rDark = Math.max(0, Math.floor(baseColor.r * 0.72))
  const gDark = Math.max(0, Math.floor(baseColor.g * 0.72))
  const bDark = Math.max(0, Math.floor(baseColor.b * 0.72))
  doc.setFillColor(rDark, gDark, bDark)
  // Draw side face as two triangles
  doc.triangle(x + w, y, x + w + dx, y - dy, x + w + dx, y - h - dy, 'F')
  doc.triangle(x + w, y, x + w + dx, y - h - dy, x + w, y - h, 'F')

  // 3. Top face (Lighter shade: 125% brightness)
  const rLight = Math.min(255, Math.floor(baseColor.r * 1.25))
  const gLight = Math.min(255, Math.floor(baseColor.g * 1.25))
  const bLight = Math.min(255, Math.floor(baseColor.b * 1.25))
  doc.setFillColor(rLight, gLight, bLight)
  // Draw top face as two triangles
  doc.triangle(x, y - h, x + w, y - h, x + w + dx, y - h - dy, 'F')
  doc.triangle(x, y - h, x + w + dx, y - h - dy, x + dx, y - h - dy, 'F')
}

function draw3DBarChart(
  doc: jsPDF,
  startX: number,
  startY: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: { r: number; g: number; b: number } }[]
) {
  const maxVal = Math.max(...data.map(d => d.value), 5)
  const roundedMax = Math.ceil(maxVal / 5) * 5

  const chartBottom = startY + height
  const chartRight = startX + width
  const barDepth = 10
  const barWidth = 18
  const barSpacing = (width - barWidth * data.length) / (data.length + 1)

  // Draw horizontal grid lines
  const numGridLines = 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(140, 140, 140)
  doc.setDrawColor(242, 242, 242)
  doc.setLineWidth(0.2)

  for (let i = 0; i <= numGridLines; i++) {
    const gridY = chartBottom - (i / numGridLines) * height
    const labelVal = Math.round((i / numGridLines) * roundedMax)

    // Draw line
    doc.line(startX, gridY, chartRight, gridY)
    // Draw Y label
    doc.text(labelVal.toString(), startX - 5, gridY + 2, { align: 'right' })
  }

  // Draw X line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.line(startX - 2, chartBottom, chartRight + 5, chartBottom)

  // Draw bars
  data.forEach((item, index) => {
    const barX = startX + barSpacing + index * (barWidth + barSpacing)
    const valPercent = item.value / roundedMax
    const barHeight = valPercent * height

    // Draw 3D Bar
    draw3DBar(doc, barX, chartBottom, barWidth, barHeight, barDepth, item.color)

    // Draw X label
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text(item.label, barX + barWidth / 2, chartBottom + 6, { align: 'center' })

    // Draw value text
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(item.color.r, item.color.g, item.color.b)
    const dy = barDepth * 0.5
    doc.text(item.value.toString(), barX + barWidth / 2, chartBottom - barHeight - dy - 2, { align: 'center' })
  })
}

function drawStatsDashboard(
  doc: jsPDF, 
  y: number, 
  stats: { label: string; value: string; color: { r: number; g: number; b: number } }[]
) {
  const gap = 5
  const totalWidth = 182
  const cardWidth = (totalWidth - gap * (stats.length - 1)) / stats.length
  
  stats.forEach((stat, index) => {
    const x = 14 + index * (cardWidth + gap)
    
    // Draw card background
    doc.setFillColor(250, 252, 250)
    doc.setDrawColor(220, 235, 222)
    doc.setLineWidth(0.4)
    doc.roundedRect(x, y, cardWidth, 24, 3, 3, 'FD')
    
    // Stat Label
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(110, 110, 110)
    doc.text(stat.label.toUpperCase(), x + 5, y + 8)
    
    // Stat Value
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(stat.color.r, stat.color.g, stat.color.b)
    doc.text(stat.value, x + 5, y + 18)
  })
}

export function exportUMKMPDF(data: UMKMRegistration[], eventDate: string) {
  const doc = new jsPDF()
  const dateStr = format(new Date(eventDate), "EEEE, dd MMMM yyyy", { locale: id })

  addHeader(doc, 'Daftar UMKM & Penjual', dateStr)

  // Dashboard Stats
  drawStatsDashboard(doc, 32, [
    { label: 'Kategori Laporan', value: 'Daftar Stand UMKM', color: { r: 50, g: 50, b: 50 } },
    { label: 'Tanggal Acara', value: format(new Date(eventDate), 'dd-MM-yyyy'), color: { r: 50, g: 50, b: 50 } },
    { label: 'Total UMKM Terdaftar', value: `${data.length} Stand`, color: GREEN_COLOR },
  ])

  // Table
  autoTable(doc, {
    startY: 62,
    head: [['#', 'Nama Usaha', 'Pemilik', 'Kategori', 'Produk', 'No. HP', 'Lokasi']],
    body: data.map((item, i) => [
      i + 1,
      item.nama_usaha,
      item.nama_pemilik,
      item.kategori,
      item.jenis_produk,
      item.nomor_hp,
      item.lokasi_lapak || '-',
    ]),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3.5, right: 2, bottom: 3.5, left: 2 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 32 },
      5: { cellWidth: 28 },
      6: { cellWidth: 18 },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })

  const pages = (doc as any).internal.getNumberOfPages()
  addFooter(doc, pages)
  doc.save(`UMKM_RW17_${eventDate}.pdf`)
}

export function exportPengunjungPDF(data: PengunjungCounter, eventDate: string) {
  const doc = new jsPDF()
  const dateStr = format(new Date(eventDate), "EEEE, dd MMMM yyyy", { locale: id })

  addHeader(doc, 'Rekap Pengunjung CFD', dateStr)

  // Big dashboard block for counts
  doc.setFillColor(250, 252, 250)
  doc.setDrawColor(220, 235, 222)
  doc.setLineWidth(0.5)
  doc.roundedRect(14, 32, 182, 45, 4, 4, 'FD')

  // Large Count Number
  doc.setFontSize(45)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(GREEN_COLOR.r, GREEN_COLOR.g, GREEN_COLOR.b)
  doc.text(data.count.toLocaleString('id-ID'), 105, 62, { align: 'center' })

  // Label
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('TOTAL ESTIMASI PENGUNJUNG CFD', 105, 71, { align: 'center' })

  // Table Details
  autoTable(doc, {
    startY: 85,
    head: [['Parameter Laporan', 'Detail Rekapitulasi']],
    body: [
      ['Tanggal Pelaksanaan', dateStr],
      ['Total Jumlah Pengunjung', `${data.count} Orang`],
      ['Status Sinkronisasi DB', 'Sukses'],
      ['Waktu Koreksi Terakhir', format(new Date(data.last_updated), "HH:mm:ss 'WIB'", { locale: id })],
    ],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70, textColor: [80, 80, 80] },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })

  addFooter(doc, 1)
  doc.save(`Pengunjung_CFD_RW17_${eventDate}.pdf`)
}

export function exportParkiranPDF(data: ParkiranCounter, eventDate: string) {
  const doc = new jsPDF()
  const dateStr = format(new Date(eventDate), "EEEE, dd MMMM yyyy", { locale: id })
  const total = data.motor + data.mobil + data.sepeda

  addHeader(doc, 'Rekap Parkiran Kendaraan', dateStr)

  // Top Dashboard
  drawStatsDashboard(doc, 32, [
    { label: 'Total Kendaraan', value: `${total} Unit`, color: GREEN_COLOR },
    { label: 'Rasio Motor', value: total > 0 ? `${Math.round((data.motor / total) * 100)}%` : '0%', color: EMERALD_COLOR },
    { label: 'Rasio Mobil & Sepeda', value: total > 0 ? `${Math.round(((data.mobil + data.sepeda) / total) * 100)}%` : '0%', color: CYAN_COLOR },
  ])

  // Draw 3D Isometric Bar Chart
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Grafik Distribusi Kendaraan (3D Isometric)', 14, 66)

  draw3DBarChart(doc, 30, 72, 150, 45, [
    { label: 'Motor', value: data.motor, color: GREEN_COLOR },
    { label: 'Mobil', value: data.mobil, color: EMERALD_COLOR },
    { label: 'Sepeda', value: data.sepeda, color: CYAN_COLOR },
  ])

  // Table breakdown
  autoTable(doc, {
    startY: 130,
    head: [['Jenis Kendaraan', 'Jumlah Unit', 'Persentase Distribusi']],
    body: [
      ['Sepeda Motor (Roda 2)', `${data.motor} Unit`, total > 0 ? `${Math.round((data.motor / total) * 100)}%` : '0%'],
      ['Mobil Penumpang (Roda 4)', `${data.mobil} Unit`, total > 0 ? `${Math.round((data.mobil / total) * 100)}%` : '0%'],
      ['Sepeda Kayuh (Non-Motor)', `${data.sepeda} Unit`, total > 0 ? `${Math.round((data.sepeda / total) * 100)}%` : '0%'],
      ['TOTAL KENDARAAN MASUK', `${total} Unit`, '100%'],
    ],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80, textColor: [60, 60, 60] },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 52, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })

  addFooter(doc, 1)
  doc.save(`Parkiran_CFD_RW17_${eventDate}.pdf`)
}

export function exportAllTimePDF(
  umkmData: UMKMRegistration[],
  visitorData: PengunjungCounter[],
  parkingData: ParkiranCounter[]
) {
  const doc = new jsPDF()

  // --- PAGE 1: COVER PAGE ---
  // Large decorative visual elements
  doc.setFillColor(248, 252, 248)
  doc.rect(0, 0, 210, 297, 'F')

  // Top header bands
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 0, 210, 15, 'F')

  // Vertical Accent Graphic Bar
  doc.setFillColor(22, 163, 74)
  doc.rect(20, 65, 4.5, 45, 'F')

  // Title elements
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(20, 20, 20)
  doc.text('LAPORAN STATISTIK', 30, 76)
  doc.text('& REKAP ALL-TIME', 30, 88)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text('Dokumentasi & Evaluasi CFD & Bazar UMKM RW 17', 30, 100)

  // Executive Description
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(80, 80, 80)
  const summaryParagraph = 
    "Laporan ini menyajikan akumulasi data historis dari seluruh pelaksanaan kegiatan Car Free Day (CFD) dan Bazar UMKM di wilayah RW 17. Dokumen memuat ringkasan eksekutif jumlah merchant UMKM terdaftar, rincian produk, estimasi jumlah total pengunjung warga, serta analisis statistik kendaraan masuk (motor, mobil, dan sepeda) beserta grafiknya."
  const splitText = doc.splitTextToSize(summaryParagraph, 150)
  doc.text(splitText, 30, 125)

  // Metadata Card
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(220, 235, 222)
  doc.setLineWidth(0.5)
  doc.roundedRect(30, 160, 150, 50, 4, 4, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text('INFORMASI LAPORAN', 38, 172)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Tanggal Cetak      : ${format(new Date(), "dd MMMM yyyy, HH:mm 'WIB'", { locale: id })}`, 38, 182)
  doc.text(`Cakupan Data       : Semua Pelaksanaan (All-Time Data)`, 38, 189)
  doc.text(`Sumber Data        : Database Cloud Supabase RW 17`, 38, 196)
  doc.text(`Klasifikasi        : Dokumen Internal Warga & Pengurus`, 38, 203)

  // Bottom footer band on cover
  doc.setFillColor(240, 245, 240)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text('(c) CFD & Bazar UMKM RW 17 | Ruang Warga Mandiri', 105, 290, { align: 'center' })


  // --- PAGE 2: SUMMARY & VISITOR STATISTICS ---
  doc.addPage()
  const totalEvents = visitorData.length
  const totalVisitors = visitorData.reduce((sum, v) => sum + v.count, 0)
  const totalUMKM = umkmData.length
  
  const totalMotor = parkingData.reduce((sum, p) => sum + p.motor, 0)
  const totalMobil = parkingData.reduce((sum, p) => sum + p.mobil, 0)
  const totalSepeda = parkingData.reduce((sum, p) => sum + p.sepeda, 0)
  const totalVehicles = totalMotor + totalMobil + totalSepeda

  addHeader(doc, 'Statistik Ringkasan Eksekutif & Pengunjung', 'Halaman 2')

  // 4 Dashboard Cards
  drawStatsDashboard(doc, 32, [
    { label: 'Total Acara', value: `${totalEvents} Kali`, color: { r: 50, g: 50, b: 50 } },
    { label: 'Total Pengunjung', value: `${totalVisitors.toLocaleString('id-ID')} Org`, color: GREEN_COLOR },
    { label: 'Peserta UMKM', value: `${totalUMKM} Stand`, color: EMERALD_COLOR },
    { label: 'Total Kendaraan', value: `${totalVehicles.toLocaleString('id-ID')} Unit`, color: CYAN_COLOR },
  ])

  // Header Table
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Log Data Pengunjung per Tanggal Pelaksanaan', 14, 68)

  // Visitor Logs Table
  autoTable(doc, {
    startY: 73,
    head: [['No', 'Hari & Tanggal Acara', 'Estimasi Pengunjung', 'Kontribusi Persentase']],
    body: visitorData.map((v, i) => [
      i + 1,
      format(new Date(v.event_date + 'T00:00:00'), "EEEE, dd MMMM yyyy", { locale: id }),
      `${v.count.toLocaleString('id-ID')} Orang`,
      totalVisitors > 0 ? `${Math.round((v.count / totalVisitors) * 100)}%` : '0%'
    ]),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 3.5, right: 2.5, bottom: 3.5, left: 2.5 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 4, right: 2.5, bottom: 4, left: 2.5 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 45, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })


  // --- PAGE 3: VEHICLE ANALYSIS & 3D CHART ---
  doc.addPage()
  addHeader(doc, 'Analisis Lalu Lintas Kendaraan Warga', 'Halaman 3')

  // Top Section Paragraph
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Grafik Akumulasi Distribusi Kendaraan (3D Isometric View)', 14, 35)

  // 3D Chart
  draw3DBarChart(doc, 30, 42, 150, 45, [
    { label: 'Motor', value: totalMotor, color: GREEN_COLOR },
    { label: 'Mobil', value: totalMobil, color: EMERALD_COLOR },
    { label: 'Sepeda', value: totalSepeda, color: CYAN_COLOR },
  ])

  // Table breakdown Below Chart
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Detail Rekapitulasi Pembagian Jenis Kendaraan', 14, 105)

  autoTable(doc, {
    startY: 110,
    head: [['Jenis Kendaraan', 'Total Unit Masuk', 'Rata-rata / Acara', 'Rasio Persentase']],
    body: [
      ['Sepeda Motor (Roda 2)', `${totalMotor.toLocaleString('id-ID')} Unit`, `${Math.round(totalMotor / (totalEvents || 1))} Unit`, totalVehicles > 0 ? `${Math.round((totalMotor / totalVehicles) * 100)}%` : '0%'],
      ['Mobil Penumpang (Roda 4)', `${totalMobil.toLocaleString('id-ID')} Unit`, `${Math.round(totalMobil / (totalEvents || 1))} Unit`, totalVehicles > 0 ? `${Math.round((totalMobil / totalVehicles) * 100)}%` : '0%'],
      ['Sepeda Kayuh (Non-Motor)', `${totalSepeda.toLocaleString('id-ID')} Unit`, `${Math.round(totalSepeda / (totalEvents || 1))} Unit`, totalVehicles > 0 ? `${Math.round((totalSepeda / totalVehicles) * 100)}%` : '0%'],
      ['TOTAL AKUMULASI KENDARAAN', `${totalVehicles.toLocaleString('id-ID')} Unit`, `${Math.round(totalVehicles / (totalEvents || 1))} Unit`, '100%'],
    ],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 3.5, right: 2.5, bottom: 3.5, left: 2.5 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 4, right: 2.5, bottom: 4, left: 2.5 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 62, textColor: [60, 60, 60] },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })


  // --- PAGE 4+: UMKM REGISTERED MERCHANT DIRECTORY ---
  doc.addPage()
  addHeader(doc, 'Direktori Merchant UMKM Terdaftar', 'Halaman 4')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Daftar Registrasi Lengkap Pelaku UMKM', 14, 35)

  // Full UMKM List Table
  autoTable(doc, {
    startY: 40,
    head: [['#', 'Tgl Acara', 'Nama Usaha', 'Pemilik', 'Kategori', 'Produk', 'Lokasi']],
    body: umkmData.map((item, i) => [
      i + 1,
      format(new Date(item.event_date + 'T00:00:00'), 'dd-MM-yy'),
      item.nama_usaha,
      item.nama_pemilik,
      item.kategori,
      item.jenis_produk,
      item.lokasi_lapak || '-',
    ]),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
      valign: 'middle',
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3.5, right: 2, bottom: 3.5, left: 2 },
    },
    alternateRowStyles: {
      fillColor: [252, 254, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 26 },
      4: { cellWidth: 28 },
      5: { cellWidth: 40 },
      6: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => applyTableRoundedCorners(data, doc),
  })

  // Footers handling over all generated pages (since UMKM table can span multiple pages)
  const finalPages = (doc as any).internal.getNumberOfPages()
  addFooter(doc, finalPages)

  doc.save(`Laporan_AllTime_CFD_RW17.pdf`)
}
