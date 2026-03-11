import Link from 'next/link';
import { FileText, BarChart3, Target } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage content and settings for The Invest Collective website
        </p>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/research/upload"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Upload New Article</span>
          </Link>
          <Link
            href="/admin/research/manage"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Manage Articles</span>
          </Link>
          <Link
            href="/admin/thesis/create"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <Target className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-900">Create New Thesis</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </Link>
          <Link
            href="/research"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">View Public Research</span>
          </Link>
          <Link
            href="/admin/legal"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Legal Pages</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
