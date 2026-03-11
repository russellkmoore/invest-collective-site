import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { members } from '../../../../../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Escape a value for safe CSV inclusion.
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * GET /api/v1/members/export
 * CSV export of all members. No API key required — admin-only route
 * behind Cloudflare Zero Trust (same security model as original /api/members/export).
 * Migrated from /api/members/export/route.ts — uses Drizzle instead of raw SQL.
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDbAsync();
    const { searchParams } = req.nextUrl;
    const statusFilter = searchParams.get('status');

    let query = db.select().from(members).$dynamic();
    if (statusFilter) {
      query = query.where(eq(members.status, statusFilter));
    }

    const results = await query.orderBy(desc(members.created_at));

    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Years Investing', 'Trading Style',
      'Areas of Expertise', 'Macro Knowledge', 'Portfolio Size',
      'Investment Journey', 'Expectations', 'Referral Source',
      'Status', 'Admin Notes', 'Reviewed By', 'Reviewed At',
      'Approved At', 'Activated At', 'Created At', 'Updated At',
    ];

    const rows = results.map((m) => [
      escapeCSV(m.id),
      escapeCSV(m.name),
      escapeCSV(m.email),
      escapeCSV(m.phone),
      escapeCSV(m.years_investing),
      escapeCSV(m.trading_style),
      escapeCSV(m.areas_of_expertise),
      escapeCSV(m.macro_knowledge),
      escapeCSV(m.portfolio_size),
      escapeCSV(m.investment_journey),
      escapeCSV(m.expectations),
      escapeCSV(m.referral_source),
      escapeCSV(m.status),
      escapeCSV(m.admin_notes),
      escapeCSV(m.reviewed_by),
      escapeCSV(m.reviewed_at),
      escapeCSV(m.approved_at),
      escapeCSV(m.activated_at),
      escapeCSV(m.created_at),
      escapeCSV(m.updated_at),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="members-${timestamp}.csv"`,
      },
    });
  } catch (error) {
    console.error('GET /api/v1/members/export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to export members' }, { status: 500 });
  }
}
