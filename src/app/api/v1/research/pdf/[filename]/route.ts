import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/research/pdf/[filename]
 * Serve PDF from R2 storage. No auth required — PDFs are public content.
 * Migrated from /api/research/pdf/[filename]/route.ts
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const { RESEARCH_PDFS } = env;

    const object = await RESEARCH_PDFS.get(filename);

    if (!object) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(object.body, { headers });
  } catch (error) {
    console.error('GET /api/v1/research/pdf/[filename] error:', error);
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
  }
}
