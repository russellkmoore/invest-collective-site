import Link from 'next/link';
import { FileText, BarChart3, Target, Users, Key, FileText as LegalIcon } from 'lucide-react';

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/settings/members"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-200 transition-colors">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Members</h3>
          </div>
          <p className="text-gray-600 text-sm">Review applications and manage member accounts</p>
        </Link>

        <Link
          href="/admin/research/manage"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Research</h3>
          </div>
          <p className="text-gray-600 text-sm">Upload and manage research articles</p>
        </Link>

        <Link
          href="/admin/thesis/create"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-100 p-3 rounded-full group-hover:bg-amber-200 transition-colors">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Theses</h3>
          </div>
          <p className="text-gray-600 text-sm">Create and track investment theses</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
          </div>
          <p className="text-gray-600 text-sm">View site traffic and engagement data</p>
        </Link>

        <Link
          href="/admin/api-keys"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-400 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
              <Key className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">API Keys</h3>
          </div>
          <p className="text-gray-600 text-sm">Manage API keys for external access</p>
        </Link>

        <Link
          href="/admin/legal"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-400 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
              <LegalIcon className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Legal Pages</h3>
          </div>
          <p className="text-gray-600 text-sm">Edit Privacy Policy, Disclaimer, and other legal content</p>
        </Link>
      </div>
    </div>
  );
}
