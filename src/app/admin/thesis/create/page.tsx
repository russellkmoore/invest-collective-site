'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Loader2, TrendingUp } from 'lucide-react';
import { createThesis } from '../actions';
import { DATA_SOURCE_INDICATORS } from '@/lib/data-source-indicators';

type DataPoint = {
  name: string;
  metric_type: string;
  data_source: string;
  data_source_identifier: string;
  target_value: string;
  target_direction: string;
  target_threshold_low?: string;
  target_threshold_high?: string;
  // Track whether admin picked a curated indicator ('curated') or 'custom'
  _indicator_selection: string;
};

const EMPTY_DATA_POINT: DataPoint = {
  name: '',
  metric_type: 'price',
  data_source: '',
  data_source_identifier: '',
  target_value: '',
  target_direction: 'above',
  target_threshold_low: '',
  target_threshold_high: '',
  _indicator_selection: '',
};

export default function CreateThesisPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    event_description: '',
    hypothesis: '',
    timeframe: '',
    rationale: '',
    category: 'stocks',
    subcategory: '',
    tags: '',
    event_date: new Date().toISOString().split('T')[0],
    prediction_start_date: new Date().toISOString().split('T')[0],
    prediction_end_date: '',
    generation_method: 'manual',
    ai_model: '',
    ai_prompt_version: '',
    source_headlines: '',
  });

  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { ...EMPTY_DATA_POINT },
    { ...EMPTY_DATA_POINT },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDataPointChange = (index: number, field: keyof DataPoint, value: string) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index] = { ...newDataPoints[index], [field]: value };
    setDataPoints(newDataPoints);
  };

  /**
   * When a curated indicator is selected from the picker, auto-fill data_source,
   * data_source_identifier, and metric_type from the indicator definition.
   * When "custom" is selected, clear those fields so admin can enter them manually.
   */
  const handleIndicatorSelect = (index: number, indicatorIdentifier: string) => {
    const newDataPoints = [...dataPoints];
    if (indicatorIdentifier === 'custom') {
      newDataPoints[index] = {
        ...newDataPoints[index],
        _indicator_selection: 'custom',
        data_source: 'manual',
        data_source_identifier: '',
        metric_type: 'custom',
      };
    } else if (indicatorIdentifier === '') {
      newDataPoints[index] = {
        ...newDataPoints[index],
        _indicator_selection: '',
        data_source: '',
        data_source_identifier: '',
        metric_type: 'price',
      };
    } else {
      const indicator = DATA_SOURCE_INDICATORS.find((ind) => ind.identifier === indicatorIdentifier);
      if (indicator) {
        newDataPoints[index] = {
          ...newDataPoints[index],
          _indicator_selection: indicator.identifier,
          data_source: indicator.source,
          data_source_identifier: indicator.identifier,
          metric_type: indicator.metric_type,
        };
      }
    }
    setDataPoints(newDataPoints);
  };

  const addDataPoint = () => {
    if (dataPoints.length < 8) {
      setDataPoints([...dataPoints, { ...EMPTY_DATA_POINT }]);
    }
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 2) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate data points count
    if (dataPoints.length < 2 || dataPoints.length > 8) {
      setSubmitStatus('error');
      setErrorMessage('Thesis must have between 2 and 8 data points');
      return;
    }

    // Validate each data point has data_source and data_source_identifier
    for (let i = 0; i < dataPoints.length; i++) {
      const dp = dataPoints[i];
      if (!dp.data_source || !dp.data_source_identifier) {
        setSubmitStatus('error');
        setErrorMessage(`Data Point ${i + 1} is missing a data source or source identifier`);
        return;
      }
    }

    // Validate prediction window
    const startDate = new Date(formData.prediction_start_date);
    const endDate = new Date(formData.prediction_end_date);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      setSubmitStatus('error');
      setErrorMessage('Prediction window must be at least 30 days');
      return;
    }

    if (diffDays > 365) {
      setSubmitStatus('error');
      setErrorMessage('Prediction window cannot exceed 365 days');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Convert data points to proper format
      const dataPointsPayload = dataPoints.map((dp) => ({
        name: dp.name,
        metric_type: dp.metric_type,
        data_source: dp.data_source,
        data_source_identifier: dp.data_source_identifier || undefined,
        target_value: parseFloat(dp.target_value),
        target_direction: dp.target_direction,
        target_threshold_low: dp.target_threshold_low ? parseFloat(dp.target_threshold_low) : undefined,
        target_threshold_high: dp.target_threshold_high ? parseFloat(dp.target_threshold_high) : undefined,
      }));

      const result = await createThesis({
        ...formData,
        tags: tagsArray,
        data_points: dataPointsPayload,
        created_by: 'admin', // This will be replaced with actual auth in production
      });

      if (result.success && result.slug) {
        setSubmitStatus('success');
        // Redirect to thesis detail page after 2 seconds
        setTimeout(() => {
          router.push(`/admin/thesis/${result.slug}`);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to create thesis');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred');
      console.error('Create thesis error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group indicators by source for the picker optgroups
  const fredIndicators = DATA_SOURCE_INDICATORS.filter((ind) => ind.source === 'fred');
  const yahooIndicators = DATA_SOURCE_INDICATORS.filter((ind) => ind.source === 'yahoo_finance');

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/thesis"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Thesis List</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Investment Thesis</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Define your hypothesis with measurable data points to track its accuracy over time
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Thesis created successfully! Redirecting to thesis management page...
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                {errorMessage || 'There was an error creating the thesis. Please try again.'}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-base font-medium text-gray-900 mb-2">
                    Thesis Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    minLength={10}
                    maxLength={200}
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Fed Rate Cut Drives Tech Stock Rally"
                  />
                  <p className="mt-2 text-sm text-gray-500">{formData.title.length}/200 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-base font-medium text-gray-900 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="stocks">Individual Stocks</option>
                      <option value="fed_policy">Fed Policy</option>
                      <option value="sector">Sector Performance</option>
                      <option value="macro">Macro Themes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subcategory" className="block text-base font-medium text-gray-900 mb-2">
                      Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-base font-medium text-gray-900 mb-2">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    required
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="federal-reserve, interest-rates, technology (comma separated)"
                  />
                  <p className="mt-2 text-sm text-gray-500">Separate multiple tags with commas</p>
                </div>
              </div>
            </div>

            {/* Source */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Source
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="generation_method" className="block text-base font-medium text-gray-900 mb-2">
                    Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="generation_method"
                    name="generation_method"
                    required
                    value={formData.generation_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="manual">Human</option>
                    <option value="ai_generated">AI</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Whether this thesis was created by a human analyst or generated by AI
                  </p>
                </div>

                {formData.generation_method === 'ai_generated' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="ai_model" className="block text-base font-medium text-gray-900 mb-2">
                          AI Model Used (Optional)
                        </label>
                        <select
                          id="ai_model"
                          name="ai_model"
                          value={formData.ai_model}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Select Model...</option>
                          <option value="claude-sonnet-4">Claude Sonnet 4</option>
                          <option value="claude-opus-4">Claude Opus 4</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gemini-pro">Gemini Pro</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="ai_prompt_version" className="block text-base font-medium text-gray-900 mb-2">
                          Prompt Version (Optional)
                        </label>
                        <input
                          type="text"
                          id="ai_prompt_version"
                          name="ai_prompt_version"
                          value={formData.ai_prompt_version}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="v1.0-2025-01"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Track which prompt version was used
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="source_headlines" className="block text-base font-medium text-gray-900 mb-2">
                        Source Headlines (JSON Array, Optional)
                      </label>
                      <textarea
                        id="source_headlines"
                        name="source_headlines"
                        rows={4}
                        value={formData.source_headlines}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                        placeholder='["Fed cuts rates by 0.25%", "Tech stocks rally on earnings"]'
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter headlines as a JSON array that inspired this thesis
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thesis Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Thesis Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="event_description" className="block text-base font-medium text-gray-900 mb-2">
                    Event Description (What Happened) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="event_description"
                    name="event_description"
                    required
                    minLength={50}
                    maxLength={1000}
                    value={formData.event_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="On September 18, 2024, the Federal Reserve announced a 0.25% interest rate cut..."
                  />
                  <p className="mt-2 text-sm text-gray-500">{formData.event_description.length}/1000 characters</p>
                </div>

                <div>
                  <label htmlFor="hypothesis" className="block text-base font-medium text-gray-900 mb-2">
                    Hypothesis (What Will Happen) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="hypothesis"
                    name="hypothesis"
                    required
                    minLength={50}
                    maxLength={1000}
                    value={formData.hypothesis}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Technology stocks will rally 10%+ within 90 days as lower rates increase valuations..."
                  />
                  <p className="mt-2 text-sm text-gray-500">{formData.hypothesis.length}/1000 characters</p>
                </div>

                <div>
                  <label htmlFor="rationale" className="block text-base font-medium text-gray-900 mb-2">
                    Rationale (Why You Believe This) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rationale"
                    name="rationale"
                    required
                    minLength={100}
                    maxLength={2000}
                    value={formData.rationale}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Lower interest rates typically benefit growth stocks because future earnings are worth more in present-value terms..."
                  />
                  <p className="mt-2 text-sm text-gray-500">{formData.rationale.length}/2000 characters</p>
                </div>

                <div>
                  <label htmlFor="timeframe" className="block text-base font-medium text-gray-900 mb-2">
                    Timeframe Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="timeframe"
                    name="timeframe"
                    required
                    value={formData.timeframe}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="90 days, 6 months, Q1 2025, etc."
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="event_date" className="block text-base font-medium text-gray-900 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    required
                    value={formData.event_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-2 text-sm text-gray-500">When the triggering event occurred</p>
                </div>

                <div>
                  <label htmlFor="prediction_start_date" className="block text-base font-medium text-gray-900 mb-2">
                    Prediction Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="prediction_start_date"
                    name="prediction_start_date"
                    required
                    value={formData.prediction_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-2 text-sm text-gray-500">Start of prediction window</p>
                </div>

                <div>
                  <label htmlFor="prediction_end_date" className="block text-base font-medium text-gray-900 mb-2">
                    Prediction End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="prediction_end_date"
                    name="prediction_end_date"
                    required
                    value={formData.prediction_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-2 text-sm text-gray-500">End of prediction window (30-365 days)</p>
                </div>
              </div>
            </div>

            {/* Data Points */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Data Points ({dataPoints.length}/8)
                </h2>
                <button
                  type="button"
                  onClick={addDataPoint}
                  disabled={dataPoints.length >= 8}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Data Point
                </button>
              </div>

              <div className="space-y-6">
                {dataPoints.map((dp, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Data Point {index + 1}
                      </h3>
                      {dataPoints.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeDataPoint(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={dp.name}
                          onChange={(e) => handleDataPointChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="NVDA Stock Price"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Metric Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={dp.metric_type}
                          onChange={(e) => handleDataPointChange(index, 'metric_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="price">Price</option>
                          <option value="rate">Rate</option>
                          <option value="percentage">Percentage</option>
                          <option value="boolean">Boolean</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      {/* Data source picker — curated indicators grouped by source */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Data Source Indicator <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={dp._indicator_selection}
                          onChange={(e) => handleIndicatorSelect(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select an indicator...</option>
                          <optgroup label="FRED Economic Data">
                            {fredIndicators.map((ind) => (
                              <option key={ind.identifier} value={ind.identifier}>
                                {ind.label} ({ind.identifier})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Yahoo Finance Market Data">
                            {yahooIndicators.map((ind) => (
                              <option key={ind.identifier} value={ind.identifier}>
                                {ind.label} ({ind.identifier})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Other">
                            <option value="custom">Custom</option>
                          </optgroup>
                        </select>
                        {dp._indicator_selection && dp._indicator_selection !== 'custom' && (
                          <p className="mt-1 text-xs text-gray-500">
                            {DATA_SOURCE_INDICATORS.find((i) => i.identifier === dp._indicator_selection)?.description}
                          </p>
                        )}
                      </div>

                      {/* Custom source fields — only shown when Custom is selected */}
                      {dp._indicator_selection === 'custom' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Data Source <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={dp.data_source}
                              onChange={(e) => handleDataPointChange(index, 'data_source', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="manual">Manual Entry</option>
                              <option value="yahoo_finance">Yahoo Finance</option>
                              <option value="fred">FRED</option>
                              <option value="alpha_vantage">Alpha Vantage</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Source Identifier <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={dp.data_source_identifier}
                              onChange={(e) =>
                                handleDataPointChange(index, 'data_source_identifier', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="NVDA, DGS10, etc."
                            />
                          </div>
                        </>
                      )}

                      {/* Hidden inputs to carry auto-filled values when curated indicator is selected */}
                      {dp._indicator_selection && dp._indicator_selection !== 'custom' && (
                        <div className="md:col-span-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded p-2">
                          Source: <span className="font-medium">{dp.data_source}</span> &nbsp;|&nbsp;
                          Identifier: <span className="font-medium">{dp.data_source_identifier}</span> &nbsp;|&nbsp;
                          Metric: <span className="font-medium">{dp.metric_type}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Target Direction <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={dp.target_direction}
                          onChange={(e) => handleDataPointChange(index, 'target_direction', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="above">Above</option>
                          <option value="below">Below</option>
                          <option value="between">Between</option>
                          <option value="equals">Equals</option>
                        </select>
                      </div>

                      {dp.target_direction === 'between' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Threshold Low <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              value={dp.target_threshold_low}
                              onChange={(e) =>
                                handleDataPointChange(index, 'target_threshold_low', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Threshold High <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              value={dp.target_threshold_high}
                              onChange={(e) =>
                                handleDataPointChange(index, 'target_threshold_high', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Target Value <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={dp.target_value}
                            onChange={(e) => handleDataPointChange(index, 'target_value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Minimum 2 data points required, maximum 8. Each data point represents a measurable metric that
                will determine the success of your thesis.
              </p>
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
                    Creating Thesis...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Create Thesis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
