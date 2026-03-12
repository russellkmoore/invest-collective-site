import Link from 'next/link';
import { ChevronLeft, TrendingUp, Cloud, Thermometer, BarChart3, Calendar, Bell } from 'lucide-react';

export default function RegimeManagementPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Regime Analysis</h1>
          </div>
          <p className="text-gray-600">Identify and track market regime changes</p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-rose-900 mb-2">Coming Soon</h3>
          <p className="text-rose-800 mb-4">
            This section is under development. Below are some features we plan to implement.
          </p>
        </div>

        {/* Planned Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Regime */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current Regime</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Display the current market regime classification and confidence level.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Regime type (Bull/Bear/Sideways)</li>
              <li>• Volatility state (Low/Medium/High)</li>
              <li>• Trend strength indicators</li>
              <li>• Confidence score</li>
            </ul>
          </div>

          {/* Regime Indicators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Thermometer className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Key Indicators</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Monitor key indicators that signal regime characteristics and potential transitions.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• VIX and volatility metrics</li>
              <li>• Trend indicators (SMA crossovers)</li>
              <li>• Breadth indicators</li>
              <li>• Sentiment measures</li>
            </ul>
          </div>

          {/* Regime History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Historical View</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View historical regime classifications and analyze past transitions.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Regime timeline visualization</li>
              <li>• Duration of each regime</li>
              <li>• Transition trigger analysis</li>
              <li>• Performance by regime</li>
            </ul>
          </div>

          {/* Transition Signals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Transition Alerts</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Get notified when market conditions suggest a potential regime transition.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Early warning signals</li>
              <li>• Confirmation thresholds</li>
              <li>• Alert notifications</li>
              <li>• Transition probability scores</li>
            </ul>
          </div>

          {/* Strategy Adjustments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Strategy Mapping</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Define recommended portfolio adjustments for each regime type.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Asset allocation by regime</li>
              <li>• Sector rotation strategies</li>
              <li>• Hedging recommendations</li>
              <li>• Position sizing rules</li>
            </ul>
          </div>

          {/* Performance Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Regime Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Analyze regime classification accuracy and strategy performance.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Classification accuracy metrics</li>
              <li>• Strategy returns by regime</li>
              <li>• False signal analysis</li>
              <li>• Model improvement tracking</li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
