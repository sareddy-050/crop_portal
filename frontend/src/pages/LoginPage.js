// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/customer');
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: 440, width: '100%' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem' }}>🌾</div>
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Sign in to your CropPortal account</p>
        </div>

        {error && <div className="alert alert-danger rounded-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email" className="form-control rounded-3 py-2"
              placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label className="form-label fw-semibold">Password</label>
              <Link to="/forgot-password" className="small text-success">Forgot password?</Link>
            </div>
            <input
              type="password" className="form-control rounded-3 py-2"
              placeholder="Your password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-semibold" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center my-3 text-muted small">— or —</div>

        <div id="googleSignIn" className="d-flex justify-content-center mb-3">
          <div className="g_id_signin" data-type="standard" data-theme="outline" data-text="signin_with" data-shape="pill" />
        </div>

        <p className="text-center mb-0">
          Don't have an account? <Link to="/register" className="text-success fw-semibold">Sign up free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
