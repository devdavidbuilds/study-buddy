import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import PageState from '../../components/ui/PageState';
import useLearningSummary from '../../hooks/useLearningSummary';
import { getRelativeTime } from '../../utils/helpers';
import { getMyCertificates, downloadCertificate } from '../../api/certificateApi';

export default function Achievements() {
  // Badges are earned from real milestones (see GET /api/progress/summary).
  const { summary, loading, error } = useLearningSummary();
  const achievements = summary?.badges || [];
  const [certificates, setCertificates] = useState([]);
  const [downloadingId, setDownloadingId] = useState('');
  const [certificateError, setCertificateError] = useState('');

  useEffect(() => {
    getMyCertificates()
      .then((res) => setCertificates(res?.data?.data || []))
      .catch(() => setCertificateError('Unable to load your certificates.'));
  }, []);

  const handleDownload = async (certificate) => {
    setDownloadingId(certificate.certificateId);
    setCertificateError('');
    try {
      await downloadCertificate(certificate);
    } catch {
      setCertificateError('Could not download the certificate. Please try again.');
    } finally {
      setDownloadingId('');
    }
  };

  const earnedCount = achievements.filter(a => a.earned).length;

  if (loading) return <PageState title="Loading achievements" message="Gathering your badges…" />;
  if (error) return <PageState type="error" title="Unable to load achievements" message={error} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Achievements</h1>
            <p>{earnedCount} of {achievements.length} badges earned • {summary.streak} day streak 🔥</p>
        </div>
      </div>

      <h3 className="section-title">🎓 My Certificates</h3>
      <div className="certificates-list">
        {certificateError && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{certificateError}</p>}
        {certificates.length === 0 ? (
          <GlassCard>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
              Finish every lesson in a course to earn a downloadable certificate of completion.
            </p>
          </GlassCard>
        ) : (
          certificates.map((certificate) => (
            <GlassCard key={certificate.certificateId} className="certificate-row">
              <Award size={22} style={{ color: 'var(--color-primary)' }} />
              <div className="certificate-row-info">
                <h4>{certificate.courseName}</h4>
                <p>
                  Completed {new Date(certificate.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}ID {certificate.certificateId}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleDownload(certificate)}
                disabled={downloadingId === certificate.certificateId}
              >
                <Download size={14} />
                {downloadingId === certificate.certificateId ? 'Preparing…' : 'Download PDF'}
              </button>
            </GlassCard>
          ))
        )}
      </div>

      <h3 className="section-title">🏅 Badges</h3>
      <div className="achievements-grid">
        {achievements.map((a, i) => (
          <GlassCard key={a.id} hoverable className={`achievement-card ${a.earned ? '' : 'locked'} animate-fade-in-up stagger-${(i % 8) + 1}`}>
            <div className="achievement-icon">{a.icon}</div>
            <h4>{a.title}</h4>
            <p>{a.description}</p>
            {a.earned ? (
              <Badge variant="success">Earned{a.earnedAt ? ` ${getRelativeTime(a.earnedAt)}` : ''}</Badge>
            ) : (
              <>
                <ProgressBar value={a.progress} size="sm" />
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>{a.progress}% to unlock</div>
              </>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
