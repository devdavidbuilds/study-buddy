import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  Clock,
  X,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationDropdown.css';

export default function NotificationDropdown({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'enrollment':
        return <CheckCircle2 size={16} />;
      case 'material':
        return <FileText size={16} />;
      case 'assignment':
        return <AlertCircle size={16} />;
      case 'quiz':
        return <Sparkles size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className={`notif-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`topbar-icon-btn notif-bell-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-badge-dot" />}
      </button>

      {isOpen && (
        <div className="notif-menu-panel" role="dialog" aria-label="Notifications Panel">
          <div className="notif-header">
            <div className="notif-title-wrap">
              <h4 className="notif-title">Notifications</h4>
              {unreadCount > 0 && (
                <span className="notif-count-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-read-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Inbox size={22} />
                </div>
                <p>No notifications</p>
                <span>You're all caught up! 🌸</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${!item.read ? 'unread' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`notif-icon-box ${item.category || 'general'}`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="notif-content">
                    <div className="notif-row-title">
                      <span className="notif-item-title">{item.title}</span>
                      {!item.read && <span className="notif-unread-glow" />}
                    </div>
                    <p className="notif-item-message">{item.message}</p>
                    <div className="notif-item-time">
                      <Clock size={11} />
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="notif-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="notif-footer">
            <Link
              to="/notifications"
              className="notif-view-all-link"
              onClick={() => setIsOpen(false)}
            >
              <span>View all notifications</span>
              <ChevronRight size={13} />
            </Link>
            {notifications.length > 0 && (
              <button
                type="button"
                className="notif-clear-all-btn"
                onClick={clearAll}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
