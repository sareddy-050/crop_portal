// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    role: 'customer', password: '', password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/customer');
    } catch (err) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (f) => errors[f] && <div className="text-danger small mt-1">{errors[f]}</div>;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: 500, width: '100%' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem' }}>🌾</div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Join thousands of farmers and customers</p>
        </div>

        {/* Role Selector */}
        <div className="d-flex gap-3 mb-4">
          {['farmer', 'customer'].map(role => (
            <button
              key={role}
              type="button"
              className={`flex-fill btn rounded-3 py-3 ${form.role === role ? 'btn-success text-white' : 'btn-outline-secondary'}`}
              onClick={() => setForm({ ...form, role })}
            >
              <div style={{ fontSize: '1.8rem' }}>{role === 'farmer' ? '👨‍🌾' : '🛒'}</div>
              <div className="fw-semibold text-capitalize">{role}</div>
              <div className="small opacity-75">{role === 'farmer' ? 'Sell your crops' : 'Buy fresh crops'}</div>
            </button>
          ))}
        </div>

        {errors.non_field_errors && <div className="alert alert-danger rounded-3 py-2">{errors.non_field_errors}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input type="text" className="form-control rounded-3 py-2" placeholder="John Doe" required value={form.full_name} onChange={set('full_name')} />
            {fieldError('full_name')}
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input type="email" className="form-control rounded-3 py-2" placeholder="you@example.com" required value={form.email} onChange={set('email')} />
            {fieldError('email')}
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone Number</label>
            <input type="tel" className="form-control rounded-3 py-2" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
            {fieldError('phone')}
          </div>
          <div className="row g-3 mb-4">
            <div className="col">
              <label className="form-label fw-semibold">Password</label>
              <input type="password" className="form-control rounded-3 py-2" placeholder="Min 8 characters" required value={form.password} onChange={set('password')} />
              {fieldError('password')}
            </div>
            <div className="col">
              <label className="form-label fw-semibold">Confirm Password</label>
              <input type="password" className="form-control rounded-3 py-2" placeholder="Repeat password" required value={form.password2} onChange={set('password2')} />
            </div>
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-semibold" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Creating account...' : `Register as ${form.role}`}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login" className="text-success fw-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
