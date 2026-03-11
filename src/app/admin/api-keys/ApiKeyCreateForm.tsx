'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createApiKey } from './actions';
import { Copy, Check, AlertCircle } from 'lucide-react';

export function ApiKeyCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNewKey(null);

    const formData = new FormData(e.currentTarget);
    const result = await createApiKey(formData);

    setPending(false);

    if (!result.success || !result.key) {
      setError(result.error ?? 'Failed to create API key');
      return;
    }

    setNewKey(result.key);
    setNewKeyLabel(result.label ?? '');
    formRef.current?.reset();
    router.refresh();
  }

  async function handleCopy() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          name="label"
          placeholder="e.g. n8n automation, data importer, dev testing"
          required
          maxLength={100}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {pending ? 'Creating...' : 'Create Key'}
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {newKey && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-semibold text-green-800">
                API key created: <span className="font-normal">{newKeyLabel}</span>
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                This key will NOT be shown again. Copy it now and store it securely.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
            <code className="flex-1 text-sm text-gray-800 font-mono break-all">{newKey}</code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
