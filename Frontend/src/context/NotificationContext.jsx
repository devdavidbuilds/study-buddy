import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getNotifications } from '../api/notificationsApi';
import { getRelativeTime } from '../utils/helpers';

// Notifications come only from real records (GET /api/notifications):
// enrollment decisions, graded/returned assignments, feedback replies, new
// materials and assignments, deadlines and certificates. The list refreshes
// every minute and whenever the tab regains focus. Which ones the student
// has read or dismissed is remembered in this browser, per account.

const REFRESH_MS = 60 * 1000;
const STATE_KEY = 'studyBuddyNotificationState';
const MAX_REMEMBERED = 500;

const NotificationContext = createContext(null);

// Earlier builds saved sample notifications here; they were never real.
try { localStorage.removeItem('study_buddy_notifications_v1'); } catch { /* storage unavailable */ }

// The signed-in account's id, read from the stored login token.
const currentUserId = () => {
  try {
    const token = localStorage.getItem('studyBuddyToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.id || null;
  } catch {
    return null;
  }
};

const loadState = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    const mine = all[userId] || {};
    return { read: new Set(mine.read || []), dismissed: new Set(mine.dismissed || []) };
  } catch {
    return { read: new Set(), dismissed: new Set() };
  }
};

const saveState = (userId, state) => {
  try {
    const all = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    all[userId] = {
      read: [...state.read].slice(-MAX_REMEMBERED),
      dismissed: [...state.dismissed].slice(-MAX_REMEMBERED),
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable: read state lasts for this visit only
  }
};

const timeLabel = (item) => (item.category === 'deadline' ? 'Due soon' : getRelativeTime(item.timestamp));

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(currentUserId);
  const [state, setState] = useState(() => loadState(currentUserId()));
  const [loading, setLoading] = useState(false);
  const [, setTick] = useState(0); // re-renders so "5m ago" labels stay current
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    const id = currentUserId();
    if (id !== userId) {
      setUserId(id);
      setState(loadState(id));
      setItems([]);
    }
    if (!id || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const res = await getNotifications();
      setItems(res?.data?.data || []);
    } catch {
      // Keep the last list; the next refresh tries again.
    } finally {
      inFlight.current = false;
      setLoading(false);
      setTick((t) => t + 1);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const update = useCallback((change) => {
    setState((prev) => {
      const next = { read: new Set(prev.read), dismissed: new Set(prev.dismissed) };
      change(next);
      if (userId) saveState(userId, next);
      return next;
    });
  }, [userId]);

  const notifications = useMemo(
    () => items
      .filter((n) => !state.dismissed.has(n.id))
      .map((n) => ({ ...n, read: state.read.has(n.id), time: timeLabel(n) })),
    [items, state],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => update((s) => s.read.add(id)), [update]);
  const markAllAsRead = useCallback(
    () => update((s) => notifications.forEach((n) => s.read.add(n.id))),
    [update, notifications],
  );
  const deleteNotification = useCallback((id) => update((s) => s.dismissed.add(id)), [update]);
  const clearAll = useCallback(
    () => update((s) => notifications.forEach((n) => s.dismissed.add(n.id))),
    [update, notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
