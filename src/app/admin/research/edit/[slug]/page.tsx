'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Eye, CheckCircle, XCircle, Trash2, Download } from 'lucide-react';
import { updateArticle, toggleArticleStatus, deleteArticle } from '../../actions';

interface Article {
  id: number;
  slug: string;
  title: string;
  date: string;
  topics: string;
  summary: string;
  html_content: string;
  pdf_url: string;
  pdf_filename: string;
  status: string;
}

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    topics: '',
    summary: '',
    html_content: '',
  });

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/v1/research/${params.slug}`);
        if (!response.ok) throw new Error('Article not found');

        const data = await response.json();
        setArticle(data);

        const topics = JSON.parse(data.topics).join(', ');
        setFormData({
          title: data.title,
          date: data.date,
          topics,
          summary: data.summary,
          html_content: data.html_content,
        });
      } catch (error) {
        console.error('Failed to fetch article:', error);
        setMessage({ type: 'error', text: 'Failed to load article' });
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('slug', params.slug);
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('date', formData.date);
    formDataToSubmit.append('topics', formData.topics);
    formDataToSubmit.append('summary', formData.summary);
    formDataToSubmit.append('html_content', formData.html_content);

    const result = await updateArticle(formDataToSubmit);
    setSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Article updated successfully' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update article' });
    }
  };

  const handleToggleStatus = async () => {
    if (!article) return;

    setToggling(true);
    setMessage(null);

    const result = await toggleArticleStatus(article.slug, article.status);
    setToggling(false);

    if (result.success) {
      setArticle({ ...article, status: result.status || 'draft' });
      setMessage({ type: 'success', text: result.message || 'Status updated' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update status' });
    }
  };

  const handleDelete = async () => {
    if (!article) return;

    setDeleting(true);
    setMessage(null);

    const result = await deleteArticle(article.slug, article.pdf_filename);
    setDeleting(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Article deleted. Redirecting...' });
      setTimeout(() => router.push('/admin/research/manage'), 1500);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete article' });
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="text-gray-500">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
          <Link href="/admin/research/manage" className="text-blue-600 hover:text-blue-700">
            Return to Article Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/research/manage"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Article Management</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600">Status:</span>
                {article.status === 'published' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    <XCircle className="w-4 h-4" />
                    Draft
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <Eye className="w-5 h-5" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>

              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  article.status === 'published'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {article.status === 'published' ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    {toggling ? 'Unpublishing...' : 'Unpublish'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {toggling ? 'Publishing...' : 'Publish'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Preview Mode */}
        {previewMode ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 md:p-12 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                {new Date(formData.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6">{formData.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{formData.summary}</p>

              <div className="flex flex-wrap gap-2">
                {formData.topics.split(',').map((topic, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full"
                  >
                    {topic.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: formData.html_content }}
              />
            </div>

            <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">PDF: {article.pdf_filename}</div>
                <a
                  href={article.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Topics */}
              <div>
                <label htmlFor="topics" className="block text-sm font-medium text-gray-700 mb-2">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  id="topics"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Technology, AI, Market Analysis"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* HTML Content */}
              <div>
                <label htmlFor="html_content" className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  rows={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Edit the HTML content directly. Use the Preview button to see how it will look.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Article
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Article?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{article.title}&quot;? This will permanently remove the
                article and its PDF from the system. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
