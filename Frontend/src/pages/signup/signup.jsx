import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { register } from '../../api/authApi';
import { setAuthToken } from '../../api/api';
import '../Login/Login.css';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'student',
      });

      const token =
        response?.data?.token ||
        response?.data?.data?.token;

      const user =
        response?.data?.user ||
        response?.data?.data?.user;

      if (!token) {
        setError(
          'Account created, but no authentication token was returned.'
        );
        return;
      }

      // Save JWT
      setAuthToken(token);

      // Save profile if backend returned it
      if (user) {
        localStorage.setItem(
          'studyBuddyProfile',
          JSON.stringify(user)
        );
      }

      // Go to existing workspace
      navigate('/workspace');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Illustration */}
      <div className="login-illustration">
        <div className="illustration-content">
          <span className="illustration-icon">🌸</span>

          <h2>
            Join{' '}
            <span className="gradient-text">
              Study Buddy
            </span>
          </h2>

          <p>
            Create your account and start your
            personalized learning journey.
          </p>
        </div>
      </div>

      {/* Signup Form */}
      <div className="login-form-side">
        <GlassCard className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">📚</div>
              <h1>Study Buddy</h1>
            </div>

            <h2>Create your account</h2>

            <p>
              Start your learning journey with
              Study Buddy
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* Full Name */}
            <div className="input-group">
              <label className="input-label">
                Full Name
              </label>

              <div className="input-field-wrapper">
                <User
                  size={18}
                  className="input-icon"
                />

                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">
                Email Address
              </label>

              <div className="input-field-wrapper">
                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  className="input-field"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">
                Password
              </label>

              <div className="input-field-wrapper">
                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  className="input-field"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="input-action"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label className="input-label">
                Confirm Password
              </label>

              <div className="input-field-wrapper">
                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  className="input-field"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="input-action"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background:
                    'rgba(220, 53, 69, 0.08)',
                  border:
                    '1px solid rgba(220, 53, 69, 0.2)',
                  color: '#dc3545',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading
                ? 'Creating account...'
                : 'Create Account'}
            </Button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-footer">
            Already have an account?{' '}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}