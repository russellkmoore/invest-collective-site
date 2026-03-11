'use server';

import { asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { legalPages } from '../../../../drizzle/schema';

export interface LegalPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all legal pages ordered alphabetically by slug.
 * Used to populate the legal pages admin list.
 */
export async function getAllLegalPages(): Promise<LegalPage[]> {
  try {
    const db = getDb();

    const results = await db
      .select()
      .from(legalPages)
      .orderBy(asc(legalPages.slug));

    return results as LegalPage[];
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
    return [];
  }
}

/**
 * Get a single legal page by its URL slug.
 * Returns null if the page does not exist.
 */
export async function getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  try {
    const db = getDb();

    const result = await db
      .select()
      .from(legalPages)
      .where(eq(legalPages.slug, slug))
      .get();

    return (result as LegalPage) ?? null;
  } catch (error) {
    console.error('Failed to fetch legal page:', error);
    return null;
  }
}

/**
 * Update the content of an existing legal page identified by slug.
 * Records last_updated_by and refreshes the updated_at timestamp.
 */
export async function updateLegalPage(
  slug: string,
  title: string,
  content: string,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();

    await db
      .update(legalPages)
      .set({
        title,
        content,
        last_updated_by: updatedBy,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(legalPages.slug, slug));

    revalidatePath('/admin/legal');
    revalidatePath(`/${slug}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update legal page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update legal page',
    };
  }
}
