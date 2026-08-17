import { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import PageState from '../../components/ui/PageState';
import useProfile from '../../hooks/useProfile';

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle-switch ${on ? 'on' : ''}`} onClick={onChange}>
      <div className="toggle-switch-knob" />
    </div>
  );
}

export default function Settings() {
  const { profile, loading, error } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [notifs, setNotifs] = useState({
    assignments: true,
    courses: true,
    achievements: true,
    weeklyDigest: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = { background: 'rgba(46,46,46,0.03)', border: '1px solid var(--border-color)' };

  if (loading) return <PageState title="Loading settings" message="Loading your profile preferences…" />;
  if (error) return <PageState type="error" title="Unable to load settings" message={error} />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile and preferences</p>
        </div>
      </div>

      <GlassCard className="settings-section">
        <h3>Profile</h3>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Full Name</label>
          <input className="input-field" style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Email</label>
          <input className="input-field" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Bio</label>
          <textarea className="input-field" style={{ ...inputStyle, minHeight: 80 }} value={bio} onChange={e => setBio(e.target.value)} />
        </div>
      </GlassCard>

      <GlassCard className="settings-section">
        <h3>Notifications</h3>
        <div className="settings-row">
          <div className="settings-row-label">
            <h4>Assignment reminders</h4>
            <p>Get notified before deadlines</p>
          </div>
          <Toggle on={notifs.assignments} onChange={() => setNotifs(n => ({ ...n, assignments: !n.assignments }))} />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">
            <h4>New course updates</h4>
            <p>Know when new lessons are added</p>
          </div>
          <Toggle on={notifs.courses} onChange={() => setNotifs(n => ({ ...n, courses: !n.courses }))} />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">
            <h4>Achievement alerts</h4>
            <p>Celebrate badges and milestones</p>
          </div>
          <Toggle on={notifs.achievements} onChange={() => setNotifs(n => ({ ...n, achievements: !n.achievements }))} />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">
            <h4>Weekly digest email</h4>
            <p>A gentle summary every Sunday</p>
          </div>
          <Toggle on={notifs.weeklyDigest} onChange={() => setNotifs(n => ({ ...n, weeklyDigest: !n.weeklyDigest }))} />
        </div>
      </GlassCard>

      <button className="btn btn-primary" onClick={handleSave}>
        {saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  );
}
