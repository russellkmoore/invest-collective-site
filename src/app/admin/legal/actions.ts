'use server';

import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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
 * Get all legal pages
 */
export async function getAllLegalPages(): Promise<LegalPage[]> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    const result = await DB.prepare(
      'SELECT * FROM legal_pages ORDER BY slug ASC'
    ).all<LegalPage>();

    return result.results || [];
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
    return [];
  }
}

/**
 * Get a legal page by slug
 */
export async function getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    const result = await DB.prepare(
      'SELECT * FROM legal_pages WHERE slug = ?'
    ).bind(slug).first<LegalPage>();

    return result || null;
  } catch (error) {
    console.error('Failed to fetch legal page:', error);
    return null;
  }
}

/**
 * Update a legal page
 */
export async function updateLegalPage(
  slug: string,
  title: string,
  content: string,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    await DB.prepare(
      `UPDATE legal_pages
       SET title = ?, content = ?, last_updated_by = ?, updated_at = datetime('now')
       WHERE slug = ?`
    ).bind(title, content, updatedBy, slug).run();

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
