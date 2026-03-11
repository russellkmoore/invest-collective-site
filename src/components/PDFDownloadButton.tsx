'use client';

import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  pdfUrl: string;
  articleSlug: string;
  className?: string;
  size?: 'small' | 'large';
}

export function PDFDownloadButton({ pdfUrl, articleSlug, className, size = 'large' }: PDFDownloadButtonProps) {
  const handleDownload = () => {
    // Track the PDF download event
    fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'pdf_download',
        article_slug: articleSlug,
      }),
    }).catch(() => {
      // Silently fail - don't break the download if analytics fails
    });
  };

  if (size === 'small') {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownload}
        className={className || 'flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700'}
      >
        <Download className="w-4 h-4" />
        PDF
      </a>
    );
  }

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleDownload}
      className={className || 'inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'}
    >
      <Download className="w-5 h-5" />
      Download PDF
    </a>
  );
}
