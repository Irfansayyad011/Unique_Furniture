import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { resetPassword as resetPasswordApi } from '../api';
import '../pages/admin/AdminLogin.css';

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMsg('');
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setForm({ username: '', password: '', confirmPassword: '' });
    setShowPw(false);
  };

  const submit = async (e) => {
    e.preventDefault();

    // Reset Password flow
    if (mode === 'reset') {
      if (!form.username.trim()) {
        setError('Please enter your username');
        return;
      }
      if (!form.password) {
        setError('Please enter a new password');
        return;
      }
      if (!passwordRule.test(form.password)) {
        setError('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const { data } = await resetPasswordApi({
          username: form.username.trim(),
          newPassword: form.password,
          confirmPassword: form.confirmPassword,
        });
        setSuccessMsg(data.message || 'Password has been reset successfully!');
        setError('');
        setForm({ username: '', password: '', confirmPassword: '' });
        // Auto-switch to login after brief delay
        setTimeout(() => switchMode('login'), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Existing login/register flow
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required');
      return;
    }

    if (mode === 'register') {
      if (!passwordRule.test(form.password)) {
        setError('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(form.username.trim(), form.password)
        : await register(form.username.trim(), form.password);

      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'owner') navigate('/owner/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = Boolean(user);

  const getTitle = () => {
    if (mode === 'login') return 'Welcome back';
    if (mode === 'register') return 'Create Customer Account';
    return 'Reset Password';
  };

  const getSubtitle = () => {
    if (mode === 'login') return 'Sign in using your username and password.';
    if (mode === 'register') return 'Register using your username and a strong password.';
    return 'Enter your username and set a new password.';
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password'} — Unique Furniture</title>
      </Helmet>

      <div className="admin-login" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
        <div className="admin-login__card" style={{ maxWidth: 520 }}>
          <div className="admin-login__logo">
            <span>🛋️</span>
            <div>
              <span className="logo-unique">Unique</span>
              <span className="logo-furniture"> Furniture</span>
            </div>
          </div>

          {mode !== 'reset' && (
            <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: '999px', padding: '0.25rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  background: mode === 'login' ? 'var(--white)' : 'transparent',
                  color: mode === 'login' ? 'var(--brown)' : 'var(--text-mid)',
                  borderRadius: '999px',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  background: mode === 'register' ? 'var(--white)' : 'transparent',
                  color: mode === 'register' ? 'var(--brown)' : 'var(--text-mid)',
                  borderRadius: '999px',
                  boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
                onClick={() => switchMode('register')}
              >
                Register
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => switchMode('login')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--brown)', marginBottom: '1.25rem', padding: '0.25rem 0', fontSize: '0.9375rem' }}
            >
              <FiArrowLeft size={16} /> Back to Login
            </button>
          )}

          <h1 className="admin-login__title">{getTitle()}</h1>
          <p className="admin-login__subtitle">{getSubtitle()}</p>

          {error && <div className="admin-login__error">{error}</div>}
          {successMsg && (
            <div className="admin-login__error" style={{ background: '#E8F5E9', color: 'var(--success)', borderColor: '#C8E6C9' }}>
              <FiCheck size={16} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              {successMsg}
            </div>
          )}
          {isLoggedIn && mode !== 'reset' && <div className="admin-login__error" style={{ background: '#E8F5E9', color: 'var(--success)' }}>You are currently signed in as <strong>{user.username}</strong> ({user.role})</div>}

          <form className="admin-login__form" onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="auth-username">Username</label>
              <div className="admin-login__field">
                <FiUser className="admin-login__field-icon" size={18} />
                <input
                  id="auth-username"
                  name="username"
                  type="text"
                  className="form-input admin-login__input"
                  placeholder={mode === 'reset' ? 'Enter your registered username' : 'Enter username (letters, numbers, _)'}
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">{mode === 'reset' ? 'New Password' : 'Password'}</label>
              <div className="admin-login__field">
                <FiLock className="admin-login__field-icon" size={18} />
                <input
                  id="auth-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input admin-login__input"
                  placeholder={mode === 'reset' ? 'Enter your new password' : 'Enter your password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="admin-login__pw-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {(mode === 'register' || mode === 'reset') && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-confirm-password">Confirm {mode === 'reset' ? 'New ' : ''}Password</label>
                  <div className="admin-login__field">
                    <FiLock className="admin-login__field-icon" size={18} />
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type={showPw ? 'text' : 'password'}
                      className="form-input admin-login__input"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Password Requirements Guide */}
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>Password Requirements:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordChecks.length ? 'var(--success)' : 'var(--text-muted)' }}>
                      {passwordChecks.length ? <FiCheck size={14} /> : <FiX size={14} />} Minimum 8 characters
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordChecks.upper ? 'var(--success)' : 'var(--text-muted)' }}>
                      {passwordChecks.upper ? <FiCheck size={14} /> : <FiX size={14} />} At least 1 uppercase letter (A-Z)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordChecks.lower ? 'var(--success)' : 'var(--text-muted)' }}>
                      {passwordChecks.lower ? <FiCheck size={14} /> : <FiX size={14} />} At least 1 lowercase letter (a-z)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordChecks.number ? 'var(--success)' : 'var(--text-muted)' }}>
                      {passwordChecks.number ? <FiCheck size={14} /> : <FiX size={14} />} At least 1 number (0-9)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordChecks.special ? 'var(--success)' : 'var(--text-muted)' }}>
                      {passwordChecks.special ? <FiCheck size={14} /> : <FiX size={14} />} At least 1 special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </button>

            {mode === 'login' && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brown)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    padding: '0.25rem',
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
