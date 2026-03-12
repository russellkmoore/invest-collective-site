'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Upload, FileText, Loader2 } from 'lucide-react';
import { uploadResearchArticle } from './actions';

export default function AdminUploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    topics: '',
    summary: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successSlug, setSuccessSlug] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('pdf', pdfFile);
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('date', formData.date);
      formDataToSubmit.append('topics', formData.topics);
      formDataToSubmit.append('summary', formData.summary);

      const result = await uploadResearchArticle(formDataToSubmit);

      if (result.success && result.slug) {
        setSubmitStatus('success');
        setSuccessSlug(result.slug);
        // Redirect to edit page after 2 seconds
        setTimeout(() => {
          router.push(`/admin/research/edit/${result.slug}`);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to upload article');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred');
      console.error('Upload error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <Link
            href="/admin/research/manage"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Manage Articles →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Research Article</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a presentation PDF and provide metadata. AI will automatically extract and format the content into a web article.
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Article saved as draft! Redirecting to edit page where you can preview and publish...
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                {errorMessage || 'There was an error uploading the article. Please try again.'}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PDF Upload */}
            <div>
              <label htmlFor="pdf" className="block text-base font-medium text-gray-900 mb-2">
                PDF File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="pdf"
                  name="pdf"
                  accept=".pdf"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="pdf" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {pdfFile
                      ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB`
                      : 'Maximum file size: 10MB'}
                  </p>
                </label>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Article Metadata
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-base font-medium text-gray-900 mb-2">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Q4 2025 Market Analysis"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-base font-medium text-gray-900 mb-2">
                    Publication Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="topics" className="block text-base font-medium text-gray-900 mb-2">
                    Topics/Tags <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="topics"
                    name="topics"
                    required
                    value={formData.topics}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Market Analysis, Macroeconomics, Fed Policy (comma separated)"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Separate multiple topics with commas
                  </p>
                </div>

                <div>
                  <label htmlFor="summary" className="block text-base font-medium text-gray-900 mb-2">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    required
                    value={formData.summary}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Brief 2-3 sentence summary of the article..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Process Article
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">
                AI will extract content from the PDF and generate a formatted web article.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
