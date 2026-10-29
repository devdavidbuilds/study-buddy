import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  Clock,
  Trash2,
  ExternalLink,
  Inbox,
  MessageSquareReply,
  Award,
  CalendarClock,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'enrollment', label: 'Enrollments' },
  { key: 'assignment', label: 'Assignments' },
  { key: 'material', label: 'Lecture Materials' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'certificate', label: 'Certificates' },
];

// Deadline reminders are listed under Assignments.
const inFilter = (item, key) => item.category === key || (key === 'assignment' && item.category === 'deadline');

const LINK_LABELS = {
  enrollment: 'Open course',
  material: 'Open course',
  feedback: 'Open course',
  assignment: 'View assignments',
  deadline: 'View assignments',
  certificate: 'View certificates',
};

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState('all');
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const filtered = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'all') return true;
    return inFilter(item, activeFilter);
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'enrollment':
        return <CheckCircle2 size={20} />;
      case 'material':
        return <FileText size={20} />;
      case 'assignment':
        return <AlertCircle size={20} />;
      case 'deadline':
        return <CalendarClock size={20} />;
      case 'feedback':
        return <MessageSquareReply size={20} />;
      case 'certificate':
        return <Award size={20} />;
      case 'quiz':
        return <Sparkles size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <div className="notif-page-title-wrap">
          <h1 className="notif-page-title">
            <Bell size={26} />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="notif-page-badge">{unreadCount} unread</span>
          )}
        </div>

        <div className="notif-page-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={markAllAsRead}
            >
              <CheckCheck size={15} />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearAll}
            >
              <Trash2 size={15} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="notif-filters">
        {FILTERS.map((f) => {
          let count = 0;
          if (f.key === 'all') count = notifications.length;
          else if (f.key === 'unread') count = unreadCount;
          else count = notifications.filter((n) => inFilter(n, f.key)).length;

          return (
            <button
              key={f.key}
              type="button"
              className={`notif-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              <span>{f.label}</span>
              {count > 0 && <span className="notif-count-pill">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Notifications List ── */}
      {filtered.length === 0 ? (
        <div className="notif-page-empty">
          <div className="notif-page-empty-icon">
            <Inbox size={28} />
          </div>
          <h3>{notifications.length === 0 ? 'No notifications yet' : 'No notifications in this category'}</h3>
          <p>Enrollment decisions, grades, feedback replies, new materials, deadlines and certificates will appear here. 🌸</p>
        </div>
      ) : (
        <div className="notif-cards-list">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`notif-card ${!item.read ? 'unread' : ''}`}
            >
              <div className={`notif-card-icon notif-icon-box ${item.category || 'general'}`}>
                {getCategoryIcon(item.category)}
              </div>

              <div className="notif-card-body">
                <div className="notif-card-header">
                  <h3 className="notif-card-title">{item.title}</h3>
                  <div className="notif-card-actions">
                    {!item.read && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => markAsRead(item.id)}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      className="notif-delete-btn"
                      style={{ opacity: 0.7 }}
                      onClick={() => deleteNotification(item.id)}
                      title="Delete"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="notif-card-message">{item.message}</p>

                <div className="notif-card-footer">
                  <div className="notif-card-meta">
                    <Clock size={12} />
                    <span>{item.time}</span>
                  </div>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="notif-card-btn"
                      onClick={() => markAsRead(item.id)}
                    >
                      <span>{LINK_LABELS[item.category] || 'View details'}</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
