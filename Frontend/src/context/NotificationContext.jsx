import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyEnrollments } from '../api/enrollmentApi';

const STORAGE_KEY = 'study_buddy_notifications_v1';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-enroll-1',
    title: 'Enrollment Approved',
    message: 'Your enrollment request for "Data Structures & Algorithms" has been approved! You can now start learning.',
    type: 'success',
    category: 'enrollment',
    time: '15 min ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    read: false,
    link: '/courses',
  },
  {
    id: 'notif-mat-1',
    title: 'New Lecture Material Uploaded',
    message: 'Dr. Sarah Mitchell uploaded "Week 4 - Binary Search Trees & Heaps Lecture Notes.pdf" in Data Structures & Algorithms.',
    type: 'info',
    category: 'material',
    time: '1 hour ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    link: '/courses',
  },
  {
    id: 'notif-mat-2',
    title: 'Lecture Slides Added',
    message: 'New lecture slides "Neural Networks Architecture Overview.pptx" were added to Machine Learning Fundamentals.',
    type: 'info',
    category: 'material',
    time: '3 hours ago',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    link: '/courses',
  },
  {
    id: 'notif-assign-1',
    title: 'Assignment Due Tomorrow',
    message: 'Binary Tree Implementation is due tomorrow at 11:59 PM. Don\'t forget to submit your code!',
    type: 'warning',
    category: 'assignment',
    time: '5 hours ago',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    read: true,
    link: '/assignments',
  },
  {
    id: 'notif-quiz-1',
    title: 'Quiz Score Available',
    message: 'Your score for "SQL Fundamentals" is 92%. Great job!',
    type: 'success',
    category: 'quiz',
    time: '1 day ago',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    link: '/progress',
  },
];

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Could not persist notifications:', e);
    }
  }, [notifications]);

  // Check for real approved enrollments dynamically
  useEffect(() => {
    let isMounted = true;
    async function checkApprovedEnrollments() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await getMyEnrollments();
        const enrollments = res?.data?.data || [];
        const approved = enrollments.filter((e) => e.status === 'approved' && e.course);

        if (!isMounted || approved.length === 0) return;

        setNotifications((prev) => {
          const newItems = [];
          for (const item of approved) {
            const courseName = item.course?.courseName || item.course?.title || 'your course';
            const courseId = item.course?._id || item.course?.id;
            const notifId = `enroll-approved-${courseId}`;

            const alreadyExists = prev.some((n) => n.id === notifId);
            if (!alreadyExists) {
              newItems.push({
                id: notifId,
                title: 'Enrollment Approved',
                message: `Your enrollment request for "${courseName}" has been approved! You now have full access.`,
                type: 'success',
                category: 'enrollment',
                time: 'Recently',
                timestamp: item.decidedAt ? new Date(item.decidedAt).getTime() : Date.now(),
                read: false,
                link: courseId ? `/courses/${courseId}` : '/courses',
              });
            }
          }

          if (newItems.length > 0) {
            return [...newItems, ...prev];
          }
          return prev;
        });
      } catch (_err) {
        // Non-fatal, use existing notifications
      }
    }

    checkApprovedEnrollments();
    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notif) => {
    const newItem = {
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: notif.title || 'Notification',
      message: notif.message || '',
      type: notif.type || 'info',
      category: notif.category || 'general',
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      link: notif.link || '/workspace',
      ...notif,
    };
    setNotifications((prev) => [newItem, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
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
