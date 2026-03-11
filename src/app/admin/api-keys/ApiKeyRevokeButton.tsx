'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { revokeApiKey } from './actions';
import { Trash2, Loader2 } from 'lucide-react';

interface Props {
  id: number;
  label: string;
}

export function ApiKeyRevokeButton({ id, label }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleRevoke() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.set('id', String(id));
    const result = await revokeApiKey(formData);
    setPending(false);

    if (result.success) {
      setConfirming(false);
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Revoke &ldquo;{label}&rdquo;?</span>
        <button
          onClick={handleRevoke}
          disabled={pending}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {pending && <Loader2 className="w-3 h-3 animate-spin" />}
          {pending ? 'Revoking...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRevoke}
      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
      title={`Revoke ${label}`}
    >
      <Trash2 className="w-4 h-4" />
      Revoke
    </button>
  );
}
