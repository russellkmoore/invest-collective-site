'use client';

import Link from 'next/link';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { TrendingUp, Users, Calendar, ChartLine, Lightbulb, MessageCircle } from 'lucide-react';

const TESTIMONIALS = [
  { quote: 'Being part of this group sharpened my thinking. Seeing how others break down macro events into measurable predictions changed the way I approach my own portfolio.', name: 'Marcus T.', tenure: 'Member since 2024' },
  { quote: 'I love that every thesis is tracked with real data. No hand-waving, no hindsight bias — just transparent calls and honest scorecards.', name: 'Sarah K.', tenure: 'Member since 2023' },
  { quote: 'The weekly discussions alone are worth it. Smart people stress-testing each other\'s ideas before putting money on the line — that\'s how you get better.', name: 'David R.', tenure: 'Member since 2024' },
] as const;

export default function Page() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Grow Your Wealth Together
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Join our community of passionate investors who meet weekly to share insights, discuss strategies, and navigate the markets together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                  Join Our Group
                </Link>
                <a href="#about" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center">
                  Learn More
                </a>
              </div>
              <div className="mt-12 flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <div className="text-xl sm:text-3xl font-bold text-blue-600">Meeting weekly since 2022</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="/images/hero-business-meeting.jpg"
                alt="Group discussion"
                className="rounded-2xl shadow-2xl"
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About Our Group</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re a dedicated community of traders and investors who believe that collaboration and shared knowledge lead to better investment decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ImageWithFallback
                src="/images/about-stock-market.jpg"
                alt="Market analysis"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                When interpreting financial markets, isolated thoughts are the enemy of clarity. We empower individual investors to make better investment decisions via peer collaboration, continuing and shared market insights. Our weekly meetings provide a structured environment to discuss market trends, analyze opportunities, and learn from each other&apos;s experiences.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Weekly market analysis and trend discussions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Portfolio reviews and strategy sharing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Educational workshops on trading techniques</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Guest speakers from the finance industry</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Join Us?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the advantages of being part of an active investing community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborative Learning</h3>
              <p className="text-gray-600">
                Learn from experienced investors and share your own insights in a supportive, collaborative environment.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Market Insights</h3>
              <p className="text-gray-600">
                Stay ahead of market trends with diverse perspectives and real-time analysis from our members.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Strategy Development</h3>
              <p className="text-gray-600">
                Refine your investment strategies through constructive feedback and proven methodologies.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Networking</h3>
              <p className="text-gray-600">
                Build valuable relationships with like-minded investors and expand your professional network.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regular Sessions</h3>
              <p className="text-gray-600">
                Consistent weekly meetings keep you engaged and accountable to your investment goals.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600">
                Members report improved confidence and better investment outcomes through group participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meetings Section */}
      <section id="meetings" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Weekly Meetings</h2>
              <p className="text-xl text-gray-600 mb-8">
                Every week, we gather to discuss market movements, share investment ideas, and learn together. Our structured format ensures productive and insightful sessions.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">When We Meet</h3>
                    <p className="text-gray-600">Main Group - Every Friday at 10:30 AM Central</p>
                    <p className="text-gray-600">Leadership/Prep Sub-Group - Every Wednesday at 1:30 PM Central</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Format</h3>
                    <p className="text-gray-600">Virtual Meetings via Google Meet</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChartLine className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Topics Covered</h3>
                    <p className="text-gray-600">Market analysis, stock picks, trading strategies, and Q&A</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ImageWithFallback
                src="/images/testimonials-team-collaboration.jpg"
                alt="Team collaboration"
                className="rounded-xl shadow-lg"
              />
              <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Typical Meeting Agenda</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Market recap and key news (15 min)</li>
                  <li>• Member presentation (30 min)</li>
                  <li>• Q&A and networking (15 min)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Members Say</h2>
            <p className="text-xl text-blue-100">
              Hear from investors who&apos;ve grown their skills with us
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white p-8 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  {t.quote}
                </p>
                <div>
                  <div className="font-bold text-gray-900">{t.name}</div>
                  <div className="text-gray-500 text-sm">{t.tenure}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Take the next step in your investing journey. Connect with experienced traders and grow your wealth through collaborative learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
              Apply for Membership
            </Link>
          </div>
          <p className="text-gray-500 mt-6">
            Currently free to join — get in on the ground floor before membership becomes paid
          </p>
        </div>
      </section>
    </div>
  );
}
