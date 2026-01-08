'use client';

import Link from 'next/link';
import { TrendingUp, Menu, X, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthInfo {
  isAuthenticated: boolean;
  email?: string;
  userId?: string;
  groups?: string[];
}

export function Navigation({ authInfo }: { authInfo?: AuthInfo | null } = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gradient-to-b from-white/99 to-white/10 backdrop-blur-md shadow-md border-b border-gray-200/50'
          : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">The Invest Collective</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* General Links */}
            <div className="flex gap-6">
              <Link href="/#about" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/#meetings" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                Meetings
              </Link>
              <Link href="/#benefits" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                Benefits
              </Link>
            </div>

            {/* Divider */}
            <span className="text-gray-400 text-sm">|</span>

            {/* Tools */}
            <div className="flex gap-6">
              <Link href="/research" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Research
              </Link>
              <Link href="/thesis-tracker" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Thesis Tracker
              </Link>
              <Link href="/regime-tracker" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Regime Tracker
              </Link>
              <Link href="/cycle-navigator" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Cycle Navigator
              </Link>
              
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            {authInfo?.isAuthenticated ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-2 text-sm rounded-lg hover:bg-green-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Us
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Auth/Join button */}
          {authInfo?.isAuthenticated ? (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 text-sm rounded-lg hover:bg-green-200 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{authInfo.email || 'Admin'}</span>
              <Shield className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="hidden md:block bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Us
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* General Links */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</p>
                <Link
                  href="/#about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
                >
                  About
                </Link>
                <Link
                  href="/#meetings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
                >
                  Meetings
                </Link>
                <Link
                  href="/#benefits"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
                >
                  Benefits
                </Link>
              </div>

              {/* Tools */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</p>
                <Link
                  href="/research"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  Research
                </Link>
                <Link
                  href="/thesis-tracker"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  Thesis Tracker
                </Link>
                <Link
                  href="/regime-tracker"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  Regime Tracker
                </Link>
                <Link
                  href="/cycle-navigator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  Cycle Navigator
                </Link>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
