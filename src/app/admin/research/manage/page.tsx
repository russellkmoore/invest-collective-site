import { getCloudflareContext } from '@opennextjs/cloudflare';
import Link from 'next/link';
import { FileText, Calendar, Tag, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Article {
  id: number;
  slug: string;
  title: string;
  date: string;
  topics: string;
  summary: string;
  status: string;
  pdf_filename: string;
  created_at: string;
  updated_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    const { results } = await DB.prepare(
      `SELECT id, slug, title, date, topics, summary, status, pdf_filename, created_at, updated_at
       FROM articles
       ORDER BY created_at DESC`,
    ).all<Article>();

    return results || [];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function ManageArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Research Articles</h1>
              <p className="text-gray-600 mt-2">
                Review, edit, publish, and delete research articles
              </p>
            </div>
            <Link
              href="/admin/research/upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Upload New Article
            </Link>
          </div>
        </div>

        {/* Articles Table */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles yet.</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first research article to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topics
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article) => {
                    const topics = JSON.parse(article.topics) as string[];
                    return (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">{article.title}</div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {article.summary}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {article.status === 'published' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <XCircle className="w-3.5 h-3.5" />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {topics.slice(0, 2).map((topic, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                            {topics.length > 2 && (
                              <span className="inline-block px-2 py-1 text-xs font-medium text-gray-500">
                                +{topics.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/research/edit/${article.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            {article.status === 'published' && (
                              <Link
                                href={`/research/${article.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
