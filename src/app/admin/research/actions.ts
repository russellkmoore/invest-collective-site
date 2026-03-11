'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { articles } from '../../../../drizzle/schema';
import { updateArticleSchema } from '@/lib/validation-schemas';

/**
 * Update an existing research article's metadata and HTML content.
 * Validates input with Zod before applying the update.
 */
export async function updateArticle(formData: FormData) {
  try {
    const db = getDb();

    const slug = formData.get('slug');
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Article slug is required' };
    }

    const rawData = {
      title: formData.get('title'),
      date: formData.get('date'),
      topics: formData.get('topics'),
      summary: formData.get('summary'),
      html_content: formData.get('html_content'),
    };

    const parsed = updateArticleSchema.safeParse({
      title: rawData.title,
      date: rawData.date,
      topics: typeof rawData.topics === 'string'
        ? rawData.topics.split(',').map((t) => t.trim())
        : undefined,
      summary: rawData.summary,
      html_content: rawData.html_content,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const { title, date, topics, summary, html_content } = parsed.data;

    await db
      .update(articles)
      .set({
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date }),
        ...(topics !== undefined && { topics: JSON.stringify(topics) }),
        ...(summary !== undefined && { summary }),
        ...(html_content !== undefined && { html_content }),
        updated_at: sql`datetime('now')`,
      })
      .where(eq(articles.slug, slug));

    revalidatePath('/research');
    revalidatePath(`/research/${slug}`);
    revalidatePath('/admin/research/manage');

    return {
      success: true,
      message: 'Article updated successfully',
    };
  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Toggle a research article between 'draft' and 'published' status.
 * Returns the new status so the UI can update optimistically.
 */
export async function toggleArticleStatus(slug: string, currentStatus: string) {
  try {
    const db = getDb();

    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    await db
      .update(articles)
      .set({
        status: newStatus,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(articles.slug, slug));

    revalidatePath('/research');
    revalidatePath(`/research/${slug}`);
    revalidatePath('/admin/research/manage');

    return {
      success: true,
      status: newStatus,
      message: `Article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
    };
  } catch (error) {
    console.error('Status toggle error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a research article from D1 and its associated PDF from R2 storage.
 * Both deletions are attempted; R2 failure does not block the DB delete.
 */
export async function deleteArticle(slug: string, pdfFilename: string) {
  try {
    const db = getDb();
    const { env } = getCloudflareContext();
    const { RESEARCH_PDFS } = env;

    // Delete from D1
    await db.delete(articles).where(eq(articles.slug, slug));

    // Delete PDF from R2
    await RESEARCH_PDFS.delete(pdfFilename);

    revalidatePath('/research');
    revalidatePath('/admin/research/manage');

    return {
      success: true,
      message: 'Article deleted successfully',
    };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
