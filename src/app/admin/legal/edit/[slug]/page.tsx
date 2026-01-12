'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save } from 'lucide-react';
import { getLegalPageBySlug, updateLegalPage, type LegalPage } from '../../actions';

export default function EditLegalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [page, setPage] = useState<LegalPage | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPage() {
      setIsLoading(true);
      const loadedPage = await getLegalPageBySlug(slug);
      if (loadedPage) {
        setPage(loadedPage);
        setTitle(loadedPage.title);
        setContent(loadedPage.content);
      }
      setIsLoading(false);
    }
    loadPage();
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    const result = await updateLegalPage(slug, title, content, 'admin');

    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => {
        router.push('/admin/legal');
      }, 1000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Failed to save changes');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <Link
            href="/admin/legal"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Legal Pages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/legal"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Legal Pages</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit {page.title}</h1>
          <p className="text-gray-600 mt-2">
            Slug: <code className="bg-gray-100 px-2 py-1 rounded text-sm">/{slug}</code>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content (Markdown supported)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              You can use Markdown formatting. Use # for headings, ** for bold, - for bullet points.
            </p>
          </div>

          {/* Character count */}
          <div className="text-sm text-gray-500">
            Characters: {content.length.toLocaleString()}
          </div>

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              ✓ Changes saved successfully! Redirecting...
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              ✗ Error: {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin/legal"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <Link
              href={`/${slug}`}
              target="_blank"
              className="ml-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Preview Page →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
