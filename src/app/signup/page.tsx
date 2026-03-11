'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ChevronLeft } from 'lucide-react';
import { saveApplication } from './actions';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investingExperience: '',
    yearsInvesting: '',
    tradingStyle: '',
    areasOfExpertise: '',
    macroeconomicsKnowledge: '',
    portfolioSize: '',
    expectations: '',
    referralSource: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('yearsInvesting', formData.yearsInvesting);
      formDataObj.append('tradingStyle', formData.tradingStyle);
      formDataObj.append('areasOfExpertise', formData.areasOfExpertise);
      formDataObj.append('macroKnowledge', formData.macroeconomicsKnowledge);
      formDataObj.append('portfolioSize', formData.portfolioSize);
      formDataObj.append('investmentJourney', formData.investingExperience);
      formDataObj.append('expectations', formData.expectations);
      formDataObj.append('referralSource', formData.referralSource);

      const result = await saveApplication(formDataObj);

      if (result.success) {
        // Step 2: Send email notification from client (like contact form)
        // This is best-effort - don't fail the submission if email fails
        try {
          const emailPayload = {
            access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
            subject: 'New Invest Collective Application',
            from_name: formData.name,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            yearsInvesting: formData.yearsInvesting,
            tradingStyle: formData.tradingStyle,
            areasOfExpertise: formData.areasOfExpertise,
            macroeconomicsKnowledge: formData.macroeconomicsKnowledge,
            portfolioSize: formData.portfolioSize,
            investingExperience: formData.investingExperience,
            expectations: formData.expectations,
            referralSource: formData.referralSource || 'Not specified',
            // Add a message field that Web3Forms requires
            message: `New member application from ${formData.name}`,
          };

          console.log('[SIGNUP-CLIENT] Sending email notification from client');
          const emailResponse = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          });

          const emailData = await emailResponse.json();
          console.log('[SIGNUP-CLIENT] Email response:', emailData);

          if (!emailResponse.ok || !emailData.success) {
            console.error('[SIGNUP-CLIENT] Email failed but continuing:', emailData);
          }
        } catch (emailError) {
          // Email is best-effort - don't fail the submission if it fails
          console.error('[SIGNUP-CLIENT] Failed to send email notification:', emailError);
        }

        setSubmitStatus('success');
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          investingExperience: '',
          yearsInvesting: '',
          tradingStyle: '',
          areasOfExpertise: '',
          macroeconomicsKnowledge: '',
          portfolioSize: '',
          expectations: '',
          referralSource: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'There was an error submitting your application.');
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('There was an error submitting your application. Please try again.');
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Apply to Join</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;re looking for passionate investors who want to collaborate, share insights, and grow together.
              Tell us about your investment journey and what you hope to contribute to our community.
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-green-800">
                Thank you for your application! We&apos;ll review it and get back to you within 2-3 business days.
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                {errorMessage || 'There was an error submitting your application. Please try again or contact us directly.'}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={`space-y-8 ${submitStatus === 'success' ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Personal Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-gray-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-base font-medium text-gray-900 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Experience */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Investment Background
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="yearsInvesting" className="block text-base font-medium text-gray-900 mb-2">
                      Years of Investing Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="yearsInvesting"
                      name="yearsInvesting"
                      required
                      value={formData.yearsInvesting}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="less-than-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-plus">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tradingStyle" className="block text-base font-medium text-gray-900 mb-2">
                      Primary Trading Style <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tradingStyle"
                      name="tradingStyle"
                      required
                      value={formData.tradingStyle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="day-trading">Day Trading</option>
                      <option value="swing-trading">Swing Trading</option>
                      <option value="long-term">Long-term Investing</option>
                      <option value="value-investing">Value Investing</option>
                      <option value="growth-investing">Growth Investing</option>
                      <option value="options-trading">Options Trading</option>
                      <option value="mixed">Mixed Approach</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="areasOfExpertise" className="block text-base font-medium text-gray-900 mb-2">
                    Areas of Expertise <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="areasOfExpertise"
                    name="areasOfExpertise"
                    required
                    value={formData.areasOfExpertise}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Technology sector analysis, fundamental analysis, technical indicators, options strategies, etc."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    What sectors, strategies, or analytical methods are you most knowledgeable about?
                  </p>
                </div>

                <div>
                  <label htmlFor="macroeconomicsKnowledge" className="block text-base font-medium text-gray-900 mb-2">
                    Macroeconomic Analysis Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="macroeconomicsKnowledge"
                    name="macroeconomicsKnowledge"
                    required
                    value={formData.macroeconomicsKnowledge}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select your level...</option>
                    <option value="beginner">Beginner - Basic understanding of economic indicators</option>
                    <option value="intermediate">Intermediate - Follow Fed policy, inflation trends, and GDP</option>
                    <option value="advanced">Advanced - Analyze global macro trends and monetary policy</option>
                    <option value="expert">Expert - Professional-level macro analysis and forecasting</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="portfolioSize" className="block text-base font-medium text-gray-900 mb-2">
                    Approximate Portfolio Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="portfolioSize"
                    name="portfolioSize"
                    required
                    value={formData.portfolioSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select range...</option>
                    <option value="under-10k">Under $10,000</option>
                    <option value="10k-50k">$10,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="500k-plus">$500,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="investingExperience" className="block text-base font-medium text-gray-900 mb-2">
                    Tell Us About Your Investment Journey <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="investingExperience"
                    name="investingExperience"
                    required
                    value={formData.investingExperience}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Share your background, notable successes or learning experiences, what drives your interest in investing..."
                  />
                </div>
              </div>
            </div>

            {/* Expectations and Contribution */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Your Goals
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="expectations" className="block text-base font-medium text-gray-900 mb-2">
                    What do you hope to gain and contribute? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="expectations"
                    name="expectations"
                    required
                    value={formData.expectations}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="What are you looking to learn from the group? What unique insights or perspectives can you share with other members?"
                  />
                </div>

                <div>
                  <label htmlFor="referralSource" className="block text-base font-medium text-gray-900 mb-2">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    id="referralSource"
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Google search, friend referral, social media..."
                  />
                </div>
              </div>
            </div>

            {/* Turnstile Bot Protection */}
            <div className="pt-2">
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">
                By submitting this form, you agree to be contacted about your application.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions about the application process?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              Visit our homepage
            </Link>
            {' '}or contact us directly.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
