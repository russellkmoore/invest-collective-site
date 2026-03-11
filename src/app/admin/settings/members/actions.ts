'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getAuthInfo } from '@/lib/auth';
import { members } from '../../../../../drizzle/schema';

/**
 * Update an existing member's profile information.
 * Validates that required fields (id, name, email) are present before updating.
 */
export async function updateMember(formData: FormData) {
  try {
    const db = getDb();

    const idRaw = formData.get('id');
    const id = idRaw ? parseInt(idRaw as string, 10) : NaN;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!id || isNaN(id) || !name || !email) {
      return { success: false, error: 'Missing required fields' };
    }

    const phone = formData.get('phone') as string;
    const years_investing = formData.get('years_investing') as string;
    const trading_style = formData.get('trading_style') as string;
    const areas_of_expertise = formData.get('areas_of_expertise') as string;
    const macro_knowledge = formData.get('macro_knowledge') as string;
    const portfolio_size = formData.get('portfolio_size') as string;
    const investment_journey = formData.get('investment_journey') as string;
    const expectations = formData.get('expectations') as string;
    const referral_source = formData.get('referral_source') as string;

    await db
      .update(members)
      .set({
        name,
        email,
        phone,
        years_investing,
        trading_style,
        areas_of_expertise,
        macro_knowledge,
        portfolio_size,
        investment_journey,
        expectations,
        referral_source: referral_source || null,
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
