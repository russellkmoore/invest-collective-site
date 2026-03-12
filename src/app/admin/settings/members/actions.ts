'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getAuthInfo } from '@/lib/auth';
import { members } from '../../../../../drizzle/schema';
import { sendWelcomeEmail as sendWelcomeEmailUtil } from '@/lib/email';

/**
 * Fetch a single member by ID. Used by the admin detail page
 * to avoid going through the API key-protected REST endpoint.
 */
export async function getMember(id: number) {
  try {
    const db = getDb();
    const member = await db.select().from(members).where(eq(members.id, id)).get();
    if (!member) return { success: false as const, error: 'Member not found' };
    return { success: true as const, member };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false as const, error: 'Failed to load member' };
  }
}

/** Full member profile update schema (admin edits to existing member records). */
const updateMemberProfileSchema = z.object({
  id: z.coerce.number().int().positive('Member ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  years_investing: z.string().min(1),
  trading_style: z.string().min(1),
  areas_of_expertise: z.string().min(1),
  macro_knowledge: z.string().min(1),
  portfolio_size: z.string().min(1),
  investment_journey: z.string().min(1),
  expectations: z.string().min(1),
  referral_source: z.string().optional(),
});

/**
 * Update an existing member's profile information.
 * Validates all form fields with Zod before applying the update.
 */
export async function updateMember(formData: FormData) {
  try {
    const db = getDb();

    const parsed = updateMemberProfileSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      years_investing: formData.get('years_investing'),
      trading_style: formData.get('trading_style'),
      areas_of_expertise: formData.get('areas_of_expertise'),
      macro_knowledge: formData.get('macro_knowledge'),
      portfolio_size: formData.get('portfolio_size'),
      investment_journey: formData.get('investment_journey'),
      expectations: formData.get('expectations'),
      referral_source: formData.get('referral_source'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { id, referral_source, ...fields } = parsed.data;

    await db
      .update(members)
      .set({
        ...fields,
        referral_source: referral_source ?? null,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(members.id, id));

    revalidatePath('/admin/settings/members');
    revalidatePath(`/admin/settings/members/${id}`);

    return { success: true, message: 'Member updated successfully' };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

/**
 * Update a member's status (pending → approved → active).
 * When approving, reads the actual admin email from getAuthInfo() for reviewed_by.
 */
export async function updateMemberStatus(
  id: number,
  newStatus: 'pending' | 'approved' | 'active',
  reviewerName: string,
) {
  try {
    const db = getDb();

    // Resolve the actual reviewer email from Cloudflare Access auth info
    const authInfo = await getAuthInfo();
    const resolvedReviewer = authInfo?.email ?? reviewerName;

    let updateFields: Record<string, unknown> = {
      status: newStatus,
      updated_at: sql`datetime('now')`,
    };

    if (newStatus === 'approved') {
      updateFields = {
        ...updateFields,
        reviewed_by: resolvedReviewer,
        reviewed_at: sql`datetime('now')`,
        approved_at: sql`datetime('now')`,
      };
    } else if (newStatus === 'active') {
      updateFields = {
        ...updateFields,
        activated_at: sql`datetime('now')`,
      };
    }

    await db.update(members).set(updateFields).where(eq(members.id, id));

    revalidatePath('/admin/settings/members');
    revalidatePath(`/admin/settings/members/${id}`);

    return {
      success: true,
      status: newStatus,
      message: `Member status updated to ${newStatus}`,
    };
  } catch (error) {
    console.error('Error updating member status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Append a timestamped admin note to a member's admin_notes field.
 * Notes are stored as newline-separated entries with ISO timestamps.
 */
export async function addMemberNote(id: number, note: string) {
  try {
    const db = getDb();

    if (!note || note.trim() === '') {
      return { success: false, error: 'Note cannot be empty' };
    }

    // Get current notes
    const member = await db
      .select({ admin_notes: members.admin_notes })
      .from(members)
      .where(eq(members.id, id))
      .get();

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Append new note with timestamp
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = member.admin_notes ? `${member.admin_notes}\n\n${newNote}` : newNote;

    await db
      .update(members)
      .set({
        admin_notes: updatedNotes,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(members.id, id));

    revalidatePath('/admin/settings/members');
    revalidatePath(`/admin/settings/members/${id}`);

    return { success: true, message: 'Note added successfully' };
  } catch (error) {
    console.error('Error adding note:', error);
    return { success: false, error: 'Failed to add note' };
  }
}

/**
 * Permanently delete a member record.
 * Admin-only action — no cascading side effects beyond the members table.
 */
export async function deleteMember(id: number) {
  try {
    const db = getDb();

    await db.delete(members).where(eq(members.id, id));

    revalidatePath('/admin/settings/members');

    return { success: true, message: 'Member deleted successfully' };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

/**
 * Send a welcome email to an approved/active member.
 * Admin-triggered only — not called automatically on status change.
 */
export async function sendWelcomeEmail(memberId: number) {
  try {
    const db = getDb();

    const member = await db
      .select({ name: members.name, email: members.email, status: members.status })
      .from(members)
      .where(eq(members.id, memberId))
      .get();

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    if (member.status !== 'approved' && member.status !== 'active') {
      return { success: false, error: 'Member must be approved or active before sending welcome email' };
    }

    const result = await sendWelcomeEmailUtil({ name: member.name, email: member.email });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send welcome email' };
    }

    return { success: true, message: `Welcome email sent to ${member.email}` };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send welcome email' };
  }
}
