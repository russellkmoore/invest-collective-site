import { notFound } from 'next/navigation';
import { getLegalPageBySlug } from '@/app/admin/legal/actions';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${page.title} | The Invest Collective`,
    description: `${page.title} for The Invest Collective`,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2" {...props} />,
                p: ({ ...props }) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2" {...props} />,
                li: ({ ...props }) => <li className="ml-4" {...props} />,
                strong: ({ ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                em: ({ ...props }) => <em className="italic" {...props} />,
                a: ({ ...props }) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                code: ({ ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
