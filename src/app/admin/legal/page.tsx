import Link from 'next/link';
import { FileText, ChevronLeft } from 'lucide-react';
import { getAllLegalPages } from './actions';

export const dynamic = 'force-dynamic';

export default async function LegalPagesManagement() {
  const pages = await getAllLegalPages();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Pages</h1>
          <p className="text-gray-600 mt-2">
            Manage privacy policy, disclaimer, and other legal content
          </p>
        </div>

        {/* Legal Pages List */}
        <div className="grid gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">{page.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Slug: <code className="bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                  </p>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(page.updated_at).toLocaleDateString()} by{' '}
                    {page.last_updated_by}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/${page.slug}`}
                    target="_blank"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Page
                  </Link>
                  <Link
                    href={`/admin/legal/edit/${page.slug}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit Content
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No legal pages found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Run the legal-pages-schema.sql to create the initial pages.
            </p>
          </div>
        )}

        {/* Back to Admin */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
