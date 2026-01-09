import Link from 'next/link';
import { FileText, Settings, BarChart3, Target, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">
            Manage content and settings for The Invest Collective website
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Research Management */}
          <Link
            href="/admin/research/manage"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Research
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage research articles, upload new PDFs, edit content, and control publishing status.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>View all articles</span>
              <span>→</span>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/admin/analytics"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Analytics
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              View article performance, popular topics, and engagement metrics.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>View analytics</span>
              <span>→</span>
            </div>
          </Link>

          {/* Thesis Management */}
          <Link
            href="/admin/thesis"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:opacity-100 hover:shadow-md hover:border-amber-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-amber-100 p-4 rounded-full group-hover:bg-amber-200 transition-colors">
                <Target className="w-8 h-8 text-amber-600 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Thesis</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage investment theses, track positions, and monitor performance against targets.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 group-hover:text-gray-600">
              <span>View Thesis</span>
              <span>→</span>
            </div>
          </Link>

          {/* Regime Analysis (Coming Soon) */}
          <Link
            href="/admin/regime"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 opacity-60 hover:opacity-100 hover:shadow-md hover:border-rose-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-rose-100 p-4 rounded-full group-hover:bg-rose-200 transition-colors">
                <TrendingUp className="w-8 h-8 text-rose-600 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Regime</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Analyze market regimes, identify transitions, and adjust strategy accordingly.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 group-hover:text-gray-600">
              <span>Coming soon</span>
              <span>→</span>
            </div>
          </Link>

          {/* Cycle Analysis (Coming Soon) */}
          <Link
            href="/admin/cycle"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 opacity-60 hover:opacity-100 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                <Activity className="w-8 h-8 text-green-600 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cycle</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Track market cycles, economic indicators, and timing signals for portfolio positioning.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 group-hover:text-gray-600">
              <span>Coming soon</span>
              <span>→</span>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:opacity-100 hover:shadow-md hover:border-gray-400 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-4 rounded-full group-hover:bg-gray-200 transition-colors">
                <Settings className="w-8 h-8 text-gray-600 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-950 transition-colors">Settings</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Configure website settings, integrations, admin preferences, and access control.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 group-hover:text-gray-600">
              <span>View Settings</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h3>
          <div className="grid gap-4 md:grid-cols-4">
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
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
