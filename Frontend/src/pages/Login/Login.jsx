import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { login, profile } from '../../api/authApi';
import { setAuthToken } from '../../api/api';
import './Login.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.42 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.16 0 9.99 0 12c0 2.01.45 3.84 1.25 5.42l4.03-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.58 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
    />
  </svg>
);

export default function Login() {
  const [loginType, setLoginType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');

    if (authError) {
      setError(decodeURIComponent(authError));
      setSearchParams({}, { replace: true });
      return;
    }

    if (token) {
      setLoading(true);
      setAuthToken(token);
      profile()
        .then((res) => {
          const user = res?.data?.user;
          if (user) {
            localStorage.setItem(
              'studyBuddyProfile',
              JSON.stringify(user)
            );
            if (user.role === 'faculty') {
              navigate('/faculty');
            } else {
              navigate('/workspace');
            }
          } else {
            navigate('/workspace');
          }
        })
        .catch((err) => {
          console.error('Google profile fetch failed:', err);
          navigate('/workspace');
        })
        .finally(() => {
          setLoading(false);
          setSearchParams({}, { replace: true });
        });
    }
  }, [searchParams, navigate, setSearchParams]);

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth entry point
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google?role=${loginType}`;
  };

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

      // Get the role returned by the backend — never trust the toggle
      const userRole =
        response?.data?.user?.role ||
        response?.data?.data?.user?.role ||
        'student';

      // Validate role against the selected login type
      if (loginType === 'faculty') {
        // Faculty login: only allow faculty or admin
        if (userRole === 'student') {
          setError(
            'This account is registered as a student. Please use Student Login.'
          );
          return;
        }
        // Store JWT and navigate to faculty dashboard
        setAuthToken(token);
        navigate('/faculty');
      } else {
        // Student login: only allow students
        if (userRole === 'faculty' || userRole === 'admin') {
          setError(
            'This account is registered as faculty. Please use Faculty Login.'
          );
          return;
        }
        // Store JWT and go to existing Study Buddy workspace
        setAuthToken(token);
        navigate('/workspace');
      }
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to connect to the authentication service.'
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
            <span className="gradient-text">
              Study Buddy
            </span>
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
              {loginType === 'faculty'
                ? 'teaching'
                : 'learning'}{' '}
              journey
            </p>
          </div>

          {/* ── Login Type Toggle ── */}
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

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
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
                  required
                />
              </div>
            </div>

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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="input-action"
                  onClick={() =>
                    setShowPassword(!showPassword)
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
                <input
                  type="checkbox"
                  defaultChecked
                />
                Remember me
              </label>

              <a
                href="#"
                className="forgot-link"
                onClick={(e) =>
                  e.preventDefault()
                }
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

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-btn"
              onClick={handleGoogleSignIn}
              title="Sign in with Google"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <button
              type="button"
              className="social-btn"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              title="Apple Sign-In is coming soon"
            >
              🍎 Apple
            </button>
          </div>

          <div className="login-footer">
            Don't have an account?{' '}
            <Link to="/signup">
              Sign up
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}