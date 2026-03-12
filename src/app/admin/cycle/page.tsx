import Link from 'next/link';
import { ChevronLeft, Activity, TrendingUp, TrendingDown, Clock, Zap, BarChart4 } from 'lucide-react';

export default function CycleManagementPage() {
  return (
    <div className="py-6">
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
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cycle Analysis</h1>
          </div>
          <p className="text-gray-600">Track market cycles and economic indicators</p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Coming Soon</h3>
          <p className="text-green-800 mb-4">
            This section is under development. Below are some features we plan to implement.
          </p>
        </div>

        {/* Planned Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Cycle Position */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current Position</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Identify where we are in the current market and economic cycle.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Economic cycle stage</li>
              <li>• Market cycle phase</li>
              <li>• Estimated cycle progress</li>
              <li>• Cycle maturity indicators</li>
            </ul>
          </div>

          {/* Leading Indicators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Leading Indicators</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Monitor indicators that forecast future cycle transitions.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Yield curve signals</li>
              <li>• Leading economic indicators</li>
              <li>• Credit spreads</li>
              <li>• Conference Board LEI</li>
            </ul>
          </div>

          {/* Coincident Indicators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Coincident Data</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Track current economic activity and market conditions.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• GDP growth rates</li>
              <li>• Employment data</li>
              <li>• Industrial production</li>
              <li>• Retail sales</li>
            </ul>
          </div>

          {/* Lagging Indicators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Lagging Indicators</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Monitor confirmation indicators for cycle validation.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Unemployment rate</li>
              <li>• Corporate profits</li>
              <li>• Inflation metrics (CPI/PPI)</li>
              <li>• Interest rate trends</li>
            </ul>
          </div>

          {/* Timing Signals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Timing Signals</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Identify potential inflection points and optimal timing for positioning.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Cycle transition warnings</li>
              <li>• Risk-on/risk-off signals</li>
              <li>• Sector rotation timing</li>
              <li>• Positioning recommendations</li>
            </ul>
          </div>

          {/* Historical Cycles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <BarChart4 className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Historical Analysis</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Study past cycles to identify patterns and improve predictions.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Historical cycle database</li>
              <li>• Average cycle duration</li>
              <li>• Peak/trough characteristics</li>
              <li>• Pattern recognition</li>
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
