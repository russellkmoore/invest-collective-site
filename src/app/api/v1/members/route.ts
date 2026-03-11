import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { members } from '../../../../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';

/**
 * GET /api/v1/members
 * List members. Auth required — members contain PII.
 * Optional query param: ?status=pending
 */
export const GET = withApiKey(async (req: NextRequest) => {
  try {
    const db = await getDbAsync();
    const { searchParams } = req.nextUrl;
    const statusFilter = searchParams.get('status');

    let query = db.select().from(members).$dynamic();

    if (statusFilter) {
      query = query.where(eq(members.status, statusFilter));
    }

    const results = await query.orderBy(desc(members.created_at));
    return apiSuccess(results);
  } catch (error) {
    console.error('GET /api/v1/members error:', error);
    return apiError('Failed to fetch members', 500);
  }
});
