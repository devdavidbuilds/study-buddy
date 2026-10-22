import { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import PageState from '../../components/ui/PageState';
import useProfile from '../../hooks/useProfile';
import { updateProfile } from '../../api/profileApi';
import { useTheme } from '../../context/ThemeContext';

const APPEARANCE = [
  { mode: 'light', title: 'Sakura Day', note: 'Soft blush and paper white' },
  { mode: 'dark', title: 'Sakura Midnight', note: 'Aurora glow and starlight' },
  { mode: 'system', title: 'Match system', note: 'Follows your device setting' },
];

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle-switch ${on ? 'on' : ''}`} onClick={onChange}>
      <div className="toggle-switch-knob" />
    </div>
  );
}

export default function Settings() {
  const { profile, loading, error, refresh } = useProfile();
  const { mode, setMode } = useTheme();
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.fullName || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      if (profile.preferences) setNotifs((current) => ({ ...current, ...profile.preferences }));
    }
  }, [profile]);

  // Saves name, bio and notification preferences (PUT /api/auth/profile).
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await updateProfile({ fullName: name, bio, preferences: notifs });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--border-color)' };

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
        <h3>Appearance</h3>
        <p className="settings-section-note">Pick a mode. It changes instantly and is remembered on this device.</p>
        <div className="appearance-grid" role="radiogroup" aria-label="Theme">
          {APPEARANCE.map(option => (
            <button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={mode === option.mode}
              className={`appearance-option ${mode === option.mode ? 'selected' : ''}`}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setMode(option.mode, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
            >
              <span className={`appearance-preview preview-${option.mode}`} aria-hidden="true">
                <span className="ap-side" />
                <span className="ap-main">
                  <span className="ap-line wide" />
                  <span className="ap-cards"><span /><span /></span>
                </span>
              </span>
              <span className="appearance-title">{option.title}</span>
              <span className="appearance-note">{option.note}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="settings-section">
        <h3>Profile</h3>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Full Name</label>
          <input className="input-field" style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Email</label>
          <input className="input-field" style={inputStyle} value={email} readOnly disabled title="Your email is your login and cannot be changed here" />
        </div>
        <div className="input-group">
          <label className="input-label">Bio</label>
          <textarea className="input-field" style={{ ...inputStyle, minHeight: 80 }} value={bio} maxLength={300} onChange={e => setBio(e.target.value)} />
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

      {saveError && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>{saveError}</p>
      )}
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  );
}
