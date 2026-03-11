import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { members } from '../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { updateMemberSchema } from '@/lib/validation-schemas';

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/members/[id]
 * Fetch a single member. Auth required — PII protection.
 */
export const GET = withApiKey(async (_req: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return apiError('Invalid member ID', 400);
    }

    const db = await getDbAsync();
    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .get();

    if (!member) {
      return apiError('Member not found', 404);
    }

    return apiSuccess(member);
  } catch (error) {
    console.error('GET /api/v1/members/[id] error:', error);
    return apiError('Failed to fetch member', 500);
  }
});

/**
 * PUT /api/v1/members/[id]
 * Update member status and notes. Auth required.
 */
export const PUT = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return apiError('Invalid member ID', 400);
    }

    const body = await req.json();
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const db = await getDbAsync();

    const member = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.id, memberId))
      .get();

    if (!member) {
      return apiError('Member not found', 404);
    }

    const { status, admin_notes, reviewed_by } = parsed.data;

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status,
      reviewed_by,
      reviewed_at: now,
      updated_at: now,
    };

    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (status === 'approved') updateData.approved_at = now;
    if (status === 'active') updateData.activated_at = now;

    await db.update(members).set(updateData).where(eq(members.id, memberId));

    return apiSuccess({ id: memberId, updated: true });
  } catch (error) {
    console.error('PUT /api/v1/members/[id] error:', error);
    return apiError('Failed to update member', 500);
  }
});
