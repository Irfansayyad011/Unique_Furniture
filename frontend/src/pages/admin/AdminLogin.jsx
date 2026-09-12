import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Both fields are required'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login — Unique Furniture</title>
      </Helmet>
      <div className="admin-login">
        <div className="admin-login__card">
          {/* Logo */}
          <div className="admin-login__logo">
            <span>🛋️</span>
            <div>
              <span className="logo-unique">Unique</span>
              <span className="logo-furniture"> Furniture</span>
            </div>
          </div>
          <h1 className="admin-login__title">Owner Login</h1>
          <p className="admin-login__subtitle">Sign in to your admin dashboard</p>

          {error && (
            <div className="admin-login__error">{error}</div>
          )}

          <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Email Address</label>
              <div className="admin-login__field">
                <FiMail className="admin-login__field-icon" size={18} />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  className="form-input admin-login__input"
                  placeholder="admin@uniquefurniture.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <div className="admin-login__field">
                <FiLock className="admin-login__field-icon" size={18} />
                <input
                  id="admin-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input admin-login__input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              id="admin-login-submit"
              style={{ justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
