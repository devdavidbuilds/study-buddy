import { AlertCircle, LoaderCircle, Inbox } from 'lucide-react';

export default function PageState({ type = 'loading', title, message, onRetry }) {
  if (type === 'error') {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
        <div className="empty-state-icon"><AlertCircle size={24} /></div>
        <h3>{title || 'Something went wrong'}</h3>
        <p>{message || 'Please try again in a moment.'}</p>
        {onRetry && (
          <button className="btn btn-primary btn-sm" onClick={onRetry} style={{ marginTop: 'var(--space-4)' }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
        <div className="empty-state-icon"><Inbox size={24} /></div>
        <h3>{title || 'Nothing here yet'}</h3>
        <p>{message || 'There is no data to show right now.'}</p>
      </div>
    );
  }

  return (
    <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
      <div className="empty-state-icon"><LoaderCircle size={24} className="animate-spin" /></div>
      <h3>{title || 'Loading'}</h3>
      <p>{message || 'Fetching your latest learning data…'}</p>
    </div>
  );
}
