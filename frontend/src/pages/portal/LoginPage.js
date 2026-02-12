import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Panel */}
      <div className="login-branding">
        <div className="login-branding-bg">
          <div className="login-blob login-blob-1" />
          <div className="login-blob login-blob-2" />
        </div>

        <div className="login-branding-content">
          <div className="login-branding-top">
            <div className="login-brand-logo">
              <div className="login-brand-icon">
                <Activity size={20} color="#fff" />
              </div>
              <span className="login-brand-name">Zealthy</span>
            </div>

            <h2 className="login-headline">
              Your health,<br />
              <span className="login-headline-accent">simplified.</span>
            </h2>
            <p className="login-subline">
              Access your appointments, prescriptions, and health information all in one place.
            </p>
          </div>

          <p className="login-copyright">© 2026 Zealthy Health Platform</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-wrap animate-fade-in">
          <div className="login-mobile-logo">
            <div className="login-brand-icon-sm">
              <Activity size={16} color="#fff" />
            </div>
            <span className="login-brand-name-sm">Zealthy</span>
          </div>

          <div className="login-form-header">
            <h1 className="login-form-title">Welcome back</h1>
            <p className="login-form-subtitle">Sign in to your patient portal</p>
          </div>

          {error && (
            <div className="login-error animate-scale-in">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="label">Email</label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-with-icon"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label className="label">Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-with-icon login-pw-input"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-pw-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary login-submit">
              {loading ? (
                <div className="spinner spinner-sm spinner-white" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="login-admin-link">
            Healthcare providers:{' '}
            <a href="/admin">EMR Admin Panel</a>
          </p>
        </div>
      </div>
    </div>
  );
}
