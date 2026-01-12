import Link from 'next/link';
import { ChevronLeft, Settings, Key, Bell, Database, Users, Mail, Palette, FileText } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-100 p-3 rounded-full">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Configure website settings and admin preferences</p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            This section is under development. Below are some features we plan to implement.
          </p>
        </div>

        {/* Planned Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Access Control */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Access Control</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Manage admin users, roles, and permissions for site access.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Cloudflare Access configuration</li>
              <li>• Authorized email list</li>
              <li>• Role-based permissions</li>
              <li>• Session management</li>
            </ul>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure alert preferences and notification channels.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Email notification settings</li>
              <li>• Alert frequency preferences</li>
              <li>• Notification types (system, content)</li>
              <li>• Webhook integrations</li>
            </ul>
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Integrations</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure third-party integrations and API connections.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Cloudflare services config</li>
              <li>• Analytics integrations</li>
              <li>• Email service (Web3Forms)</li>
              <li>• External API keys</li>
            </ul>
          </div>

          {/* Member Management */}
          <Link
            href="/admin/settings/members"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-200 transition-colors">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Member Management</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Review member applications and manage member accounts.</p>
            <div className="flex items-center gap-2 text-sm text-indigo-600 group-hover:text-indigo-700">
              <span>Manage members</span>
              <span>→</span>
            </div>
          </Link>

          {/* Legal Pages */}
          <Link
            href="/admin/legal"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Legal Pages</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Edit Privacy Policy, Disclaimer, and other legal content displayed on the site.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700">
              <span>Edit legal pages</span>
              <span>→</span>
            </div>
          </Link>

          {/* Email Templates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Email Templates</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Customize email templates for notifications and communications.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Welcome email template</li>
              <li>• Newsletter templates</li>
              <li>• Alert notification templates</li>
              <li>• Automated response templates</li>
            </ul>
          </div>

          {/* Site Customization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Customize site appearance and branding elements.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Logo and favicon management</li>
              <li>• Color scheme preferences</li>
              <li>• Homepage content</li>
              <li>• Footer links and social media</li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
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
