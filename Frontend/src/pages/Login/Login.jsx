import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Info,
} from 'lucide-react';

import StudyBuddyLogo from '../../components/ui/StudyBuddyLogo';
import { login } from '../../api/authApi';
import { setAuthToken, unreachableMessage } from '../../api/api';
import ThemeToggle from '../../components/ui/ThemeToggle';
import './Login.css';

export default function Login() {
  const [loginType, setLoginType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const navigate = useNavigate();

  // Pre-fill remembered email if saved previously
  useEffect(() => {
    const saved = localStorage.getItem('sb_remembered_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = () => {
    setInfoMessage(
      'Password reset is managed by your administrator or domain registrar. Please contact support or your campus IT desk.'
    );
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      const token =
        response?.data?.token ||
        response?.data?.data?.token;

      if (!token) {
        setError('Login succeeded but no token was returned by the server.');
        return;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('sb_remembered_email', email.trim());
      } else {
        localStorage.removeItem('sb_remembered_email');
      }

      const userRole =
        response?.data?.user?.role ||
        response?.data?.data?.user?.role ||
        'student';

      if (loginType === 'admin') {
        if (userRole !== 'admin') {
          setError('This account does not have administrator privileges.');
          return;
        }

        setAuthToken(token);
        navigate('/admin');
      } else if (loginType === 'faculty') {
        if (userRole === 'student') {
          setError('This account is registered as a student. Please switch to Student Login.');
          return;
        }

        setAuthToken(token);
        navigate(userRole === 'admin' ? '/admin' : '/faculty');
      } else {
        if (userRole === 'faculty') {
          setError('This account is registered as faculty. Please switch to Faculty Login.');
          return;
        }
        if (userRole === 'admin') {
          setError('This account has administrator privileges. Please switch to Admin Login.');
          return;
        }

        setAuthToken(token);
        navigate('/workspace');
      }
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response ? 'Unable to sign in right now. Please check your credentials.' : unreachableMessage())
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <ThemeToggle className="floating-theme-toggle" />

      {/* Atmospheric ambient glow backdrop */}
      <div className="login-ambient-glow" aria-hidden="true" />

      <main className="login-card-container">
        <div className="login-card">
          {/* Brand header */}
          <div className="login-header">
            <Link to="/" className="login-logo" title="Study Buddy Home">
              <StudyBuddyLogo size={42} />
              <span className="login-brand-name">Study Buddy</span>
            </Link>

            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">
              Sign in to continue your{' '}
              {loginType === 'admin'
                ? 'platform administration'
                : loginType === 'faculty'
                ? 'course instruction'
                : 'learning journey'}
            </p>
          </div>

          {/* Role selector pill toggle */}
          <div
            className="login-type-toggle"
            role="tablist"
            aria-label="Select role to sign in"
          >
            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'student'}
              className={`login-type-btn ${loginType === 'student' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('student');
                setError('');
                setInfoMessage('');
              }}
            >
              <GraduationCap size={16} />
              <span>Student</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'faculty'}
              className={`login-type-btn ${loginType === 'faculty' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('faculty');
                setError('');
                setInfoMessage('');
              }}
            >
              <BookOpen size={16} />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'admin'}
              className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('admin');
                setError('');
                setInfoMessage('');
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          </div>

          {/* Alert / notifications */}
          {error && (
            <div className="login-alert login-alert-error" role="alert">
              <AlertCircle size={16} className="login-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="login-alert login-alert-info" role="status">
              <Info size={16} className="login-alert-icon" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="input-field-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">
                Password
              </label>
              <div className="input-field-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" aria-hidden="true" />
                  Signing in...
                </span>
              ) : (
                <span>
                  {loginType === 'faculty'
                    ? 'Sign In as Faculty'
                    : loginType === 'admin'
                    ? 'Sign In as Admin'
                    : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
