import { useCallback, useEffect, useState } from 'react';
import { getProfile } from '../api/profileApi';

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('studyBuddyToken');
    if (!token) {
      setProfile(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getProfile();
      const payload = response?.data?.data ?? response?.data?.user ?? response?.data ?? null;
      setProfile(payload);
      localStorage.setItem('studyBuddyProfile', JSON.stringify(payload));
      return payload;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your profile right now.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, refresh };
}
