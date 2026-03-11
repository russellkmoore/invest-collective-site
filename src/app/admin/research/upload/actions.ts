'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { articles } from '../../../../../drizzle/schema';
import { generateSlug } from '@/lib/slug';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * Upload a PDF research article: stores the file in R2, generates HTML content via Workers AI,
 * sanitizes the AI output, and saves the article as a draft in D1 via Drizzle.
 * R2 and AI still use getCloudflareContext() directly — only DB access uses Drizzle.
 */
export async function uploadResearchArticle(formData: FormData) {
  try {
    const { env } = getCloudflareContext();
    const { RESEARCH_PDFS, AI } = env;
    const db = getDb();

    // Extract form data
    const pdfFile = formData.get('pdf') as File;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const topics = formData.get('topics') as string;
    const summary = formData.get('summary') as string;

    if (!pdfFile || !title || !date || !topics || !summary) {
      return { success: false, error: 'Missing required fields' };
    }

    // Generate slug from title
    const slug = generateSlug(title);
    const pdfFilename = `${slug}-${Date.now()}.pdf`;

    // Upload PDF to R2
    const pdfBuffer = await pdfFile.arrayBuffer();
    await RESEARCH_PDFS.put(pdfFilename, pdfBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
    });

    const pdfUrl = `/api/v1/research/pdf/${pdfFilename}`;

    // Process PDF with Cloudflare Workers AI
    // Note: Workers AI doesn't directly extract text from PDFs yet,
    // so we'll create a structured article template based on metadata
    // In the future, you can enhance this with PDF text extraction libraries

    const topicsArray = topics.split(',').map((t) => t.trim());

    // Generate HTML content using AI
    const aiPrompt = `You are a financial research assistant. Create a well-formatted HTML article based on this metadata:

Title: ${title}
Date: ${date}
Topics: ${topicsArray.join(', ')}
Summary: ${summary}

Generate a professional research article with:
1. An introduction section expanding on the summary
2. Key points section with 3-5 bullet points of what readers will learn
3. A conclusion section encouraging readers to download the full PDF for details
4. Professional formatting with proper headings

Return ONLY the HTML content (no <html>, <head>, or <body> tags - just the article content).`;

    const aiResponse = await AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'user',
          content: aiPrompt,
        },
      ],
    });

    // Extract AI response and sanitize before storage (XSS prevention)
    const rawHtmlContent =
      (aiResponse as any)?.response ||
      `<article>
        <h2>Introduction</h2>
        <p>${summary}</p>
        <h2>Key Insights</h2>
        <p>Download the full PDF to explore the complete analysis and detailed findings.</p>
        <h2>Conclusion</h2>
        <p>This research provides valuable insights into ${topicsArray.join(', ')}. Access the full presentation for comprehensive details.</p>
      </article>`;

    const htmlContent = sanitizeHtml(rawHtmlContent);

    // Store article in D1 as draft via Drizzle
    await db.insert(articles).values({
      slug,
      title,
      date,
      topics: JSON.stringify(topicsArray),
      summary,
      html_content: htmlContent,
      pdf_url: pdfUrl,
      pdf_filename: pdfFilename,
      status: 'draft',
    });

    return {
      success: true,
      slug,
      message: 'Article saved as draft. Review and publish when ready.',
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
