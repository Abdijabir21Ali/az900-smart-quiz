import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'az900_gemini_api_key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setApiKey(stored);
    } catch {
      // localStorage unavailable
    }
    setLoaded(true);
  }, []);

  const save = useCallback((key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // ignore
    }
  }, []);

  const clear = useCallback(() => {
    setApiKey(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { apiKey, save, clear, loaded };
}
