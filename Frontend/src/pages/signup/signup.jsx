import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Calendar,
  Building2,
  BookOpen,
  GraduationCap,
  Hash,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { register } from '../../api/authApi';
import { setAuthToken } from '../../api/api';
import '../Login/Login.css';

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;
const YEARS_OF_STUDY = [1, 2, 3, 4, 5, 6];

export default function Signup() {
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const validateAccountStep = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email address.';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const validateDetailsStep = () => {
    if (!PHONE_PATTERN.test(phone.trim())) {
      return 'Please enter a valid phone number.';
    }
    if (!dateOfBirth || dateOfBirth >= today) {
      return 'Please enter a valid date of birth.';
    }
    if (!university.trim()) return 'Please enter your college or university.';
    if (!department.trim()) return 'Please enter your department.';
    if (!yearOfStudy) return 'Please select your year of study.';
    if (!rollNumber.trim()) return 'Please enter your roll / register number.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (step === 1) {
      const accountError = validateAccountStep();
      if (accountError) {
        setError(accountError);
        return;
      }
      setStep(2);
      return;
    }

    const detailsError = validateDetailsStep();
    if (detailsError) {
      setError(detailsError);
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        dateOfBirth,
        university: university.trim(),
        department: department.trim(),
        yearOfStudy: Number(yearOfStudy),
        rollNumber: rollNumber.trim(),
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

            <h2>
              {step === 1
                ? 'Create your account'
                : 'Tell us about yourself'}
            </h2>

            <p>
              Step {step} of 2 —{' '}
              {step === 1
                ? 'account details'
                : 'academic and contact details'}
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {step === 1 ? (
              <>
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
              </>
            ) : (
              <>
                {/* Phone */}
                <div className="input-group">
                  <label className="input-label">
                    Phone Number
                  </label>

                  <div className="input-field-wrapper">
                    <Phone
                      size={18}
                      className="input-icon"
                    />

                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="input-group">
                  <label className="input-label">
                    Date of Birth
                  </label>

                  <div className="input-field-wrapper">
                    <Calendar
                      size={18}
                      className="input-icon"
                    />

                    <input
                      type="date"
                      className="input-field"
                      value={dateOfBirth}
                      max={today}
                      onChange={(e) =>
                        setDateOfBirth(e.target.value)
                      }
                      autoComplete="bday"
                      required
                    />
                  </div>
                </div>

                {/* University */}
                <div className="input-group">
                  <label className="input-label">
                    College / University
                  </label>

                  <div className="input-field-wrapper">
                    <Building2
                      size={18}
                      className="input-icon"
                    />

                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter your institution"
                      value={university}
                      onChange={(e) =>
                        setUniversity(e.target.value)
                      }
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="input-group">
                  <label className="input-label">
                    Department
                  </label>

                  <div className="input-field-wrapper">
                    <BookOpen
                      size={18}
                      className="input-icon"
                    />

                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) =>
                        setDepartment(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Year of Study */}
                <div className="input-group">
                  <label className="input-label">
                    Year of Study
                  </label>

                  <div className="input-field-wrapper">
                    <GraduationCap
                      size={18}
                      className="input-icon"
                    />

                    <select
                      className="input-field"
                      value={yearOfStudy}
                      onChange={(e) =>
                        setYearOfStudy(e.target.value)
                      }
                      required
                    >
                      <option value="" disabled>
                        Select your year
                      </option>
                      {YEARS_OF_STUDY.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Roll Number */}
                <div className="input-group">
                  <label className="input-label">
                    Roll / Register Number
                  </label>

                  <div className="input-field-wrapper">
                    <Hash
                      size={18}
                      className="input-icon"
                    />

                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter your roll number"
                      value={rollNumber}
                      onChange={(e) =>
                        setRollNumber(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </>
            )}

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
              {step === 1
                ? 'Continue'
                : loading
                  ? 'Creating account...'
                  : 'Create Account'}
            </Button>

            {step === 2 && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={loading}
                style={{ width: '100%' }}
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
              >
                Back
              </Button>
            )}
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
