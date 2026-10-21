
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { login } from '../../api/authApi';
import { setAuthToken, unreachableMessage } from '../../api/api';
import './Login.css';

export default function Login() {
  const [loginType, setLoginType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      const token =
        response?.data?.token ||
        response?.data?.data?.token;

      if (!token) {
        setError(
          'Login succeeded but no token was returned by the server.'
        );
        return;
      }

      const userRole =
        response?.data?.user?.role ||
        response?.data?.data?.user?.role ||
        'student';

      if (loginType === 'faculty') {
        if (userRole === 'student') {
          setError(
            'This account is registered as a student. Please use Student Login.'
          );
          return;
        }

        setAuthToken(token);
        navigate('/faculty');
      } else {
        if (userRole === 'faculty' || userRole === 'admin') {
          setError(
            'This account is registered as faculty. Please use Faculty Login.'
          );
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
        (err?.response ? 'Unable to sign in right now. Please try again.' : unreachableMessage())
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-illustration">
        <div className="illustration-content">
          <span className="illustration-icon">🎓</span>

          <h2>
            Welcome to{' '}
            <span className="gradient-text">Study Buddy</span>
          </h2>

          <p>
            Your calm, all-in-one academic workspace for
            learning, planning, and growing. Join thousands
            of students worldwide.
          </p>
        </div>
      </div>

      <div className="login-form-side">
        <GlassCard className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">📚</div>
              <h1>Study Buddy</h1>
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue your{' '}
              {loginType === 'faculty' ? 'teaching' : 'learning'}{' '}
              journey
            </p>
          </div>

          <div className="login-type-toggle">
            <button
              type="button"
              className={`login-type-btn ${
                loginType === 'student' ? 'active' : ''
              }`}
              onClick={() => {
                setLoginType('student');
                setError('');
              }}
            >
              <GraduationCap size={18} />
              Student
            </button>

            <button
              type="button"
              className={`login-type-btn ${
                loginType === 'faculty' ? 'active' : ''
              }`}
              onClick={() => {
                setLoginType('faculty');
                setError('');
              }}
            >
              <BookOpen size={18} />
              Faculty
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">
                Email Address
              </label>

              <div className="input-field-wrapper">
                <Mail size={18} className="input-icon" />

                <input
                  type="email"
                  className="input-field"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                Password
              </label>

              <div className="input-field-wrapper">
                <Lock size={18} className="input-icon" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
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

            {error && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-row">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                Remember me
              </label>

              <a
                href="#"
                className="forgot-link"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading
                ? 'Signing In...'
                : loginType === 'faculty'
                  ? 'Sign In as Faculty'
                  : 'Sign In'}
            </Button>
          </form>

          <div className="login-footer">
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
