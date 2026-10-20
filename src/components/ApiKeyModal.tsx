import { useEffect, useState } from 'react';
import { KeyRound, X } from 'lucide-react';

interface Props {
  open: boolean;
  initialKey: string | null;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ open, initialKey, onSave, onClose }: Props) {
  const [value, setValue] = useState(initialKey ?? '');

  useEffect(() => {
    if (open) setValue(initialKey ?? '');
  }, [open, initialKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-lg font-bold">Gemini API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Paste your Google AI Studio Gemini API key to power the "Ask follow-up"
          feature. It is stored only in your browser and sent directly to Google.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:opacity-40 disabled:shadow-none"
          >
            Save key
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Get a free key at aistudio.google.com/apikey
        </p>
      </div>
    </div>
  );
}
