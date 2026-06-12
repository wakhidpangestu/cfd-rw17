import { NextResponse } from 'next/server'
// This route is called by Vercel Cron at midnight
// Data is NOT deleted — it stays in Supabase for historical records
// The "reset" just means UI shows today's new date = 0 counts automatically
// since queries filter by today's date

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // No action needed — the app auto-resets by filtering on current date.
  // Historical data remains intact in DB.
  // This endpoint exists as a hook for future logic (notifications, etc.)

  return NextResponse.json({
    success: true,
    message: 'Reset handled by date-based filtering',
    timestamp: new Date().toISOString(),
  })
}
