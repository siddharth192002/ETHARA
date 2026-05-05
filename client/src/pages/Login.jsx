import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb-1"></div>
      <div className="auth-bg-orb orb-2"></div>
      <div className="auth-container fade-in">
        <div className="auth-brand">
          <div className="brand-icon-lg">⚡</div>
          <h1>Ethara</h1>
          <p>Team Task Manager</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} id="login-form" autoComplete="off">
          <h2>Welcome back</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="new-email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading} id="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </form>
      </div>
    </div>
  );
}
