import { useCallback, useEffect, useState } from 'react';
import { getLearningSummary } from '../api/progressApi';

// Loads the student's learning summary (see GET /api/progress/summary).
export default function useLearningSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLearningSummary();
      setSummary(response?.data?.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your learning progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}
