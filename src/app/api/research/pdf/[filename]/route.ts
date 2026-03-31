import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy redirect: /api/research/pdf/[filename] -> /api/v1/research/pdf/[filename]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const url = new URL(`/api/v1/research/pdf/${filename}`, req.url);
  return NextResponse.redirect(url, 301);
}
