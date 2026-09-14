import { useState, useEffect } from 'react';
import { History, Clock, Cpu, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { getSubmissions } from '../../services/compilerApi';

const verdictClass = {
  'Accepted': 'verdict-accepted',
  'Wrong Answer': 'verdict-wa',
  'Compilation Error': 'verdict-ce',
  'Runtime Error': 'verdict-re',
  'Time Limit Exceeded': 'verdict-tle',
  'Memory Limit Exceeded': 'verdict-mle',
};

const verdictIcon = (verdict) => {
  if (verdict === 'Accepted') return <CheckCircle2 size={13} className="tc-pass-icon" />;
  return <XCircle size={13} className="tc-fail-icon" />;
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const langLabels = { python: 'Python', cpp: 'C++', c: 'C' };

export default function SubmissionHistory({ onLoadCode }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      const data = await getSubmissions();
      if (!cancelled) {
        setSubmissions(data);
        setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await getSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="codelab-console-pane">
        <div className="codelab-submissions-loading">
          <Loader size={18} className="spin-icon" />
          <span>Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="codelab-console-pane">
        <div className="codelab-submissions-empty">
          <History size={28} />
          <p>No submissions yet.</p>
          <span>Submit your solution to see your history here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="codelab-console-pane">
      <div className="codelab-submissions-header">
        <span>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-ghost btn-sm" onClick={refresh}>Refresh</button>
      </div>
      <div className="codelab-submissions-list">
        {submissions.map((sub, i) => (
          <div
            key={sub._id || i}
            className={`codelab-submission-item ${expanded === i ? 'expanded' : ''}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="codelab-submission-row">
              <div className="codelab-submission-verdict-col">
                {verdictIcon(sub.verdict)}
                <span className={`codelab-submission-verdict ${verdictClass[sub.verdict] || ''}`}>
                  {sub.verdict}
                </span>
              </div>
              <span className="codelab-submission-lang">{langLabels[sub.language] || sub.language}</span>
              <span className="codelab-submission-stat">
                <Clock size={11} /> {sub.executionTime ? `${sub.executionTime}ms` : '—'}
              </span>
              <span className="codelab-submission-stat">
                <Cpu size={11} /> {sub.memoryUsed ? `${sub.memoryUsed}MB` : '—'}
              </span>
              <span className="codelab-submission-stat">
                {sub.passedCount}/{sub.totalCount} passed
              </span>
              <span className="codelab-submission-time">{formatDate(sub.createdAt)}</span>
            </div>

            {expanded === i && sub.code && (
              <div className="codelab-submission-detail">
                <div className="codelab-submission-detail-header">
                  <span>Problem: {sub.problemId}</span>
                  {onLoadCode && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadCode(sub.code, sub.language, sub.problemId);
                      }}
                    >
                      Load into Editor
                    </button>
                  )}
                </div>
                <pre className="codelab-submission-code">{sub.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
