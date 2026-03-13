// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const STEPS = { EMAIL: 1, OTP: 2, DONE: 3 };

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const requestOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authAPI.requestPasswordReset({ email });
      setMessage('OTP sent to your email. Check your inbox.');
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.email || err.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authAPI.confirmPasswordReset({ email, otp, new_password: newPassword, new_password2: newPassword2 });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.otp || err.new_password || err.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: 440, width: '100%' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem' }}>{step === STEPS.DONE ? '✅' : '🔐'}</div>
          <h2 className="fw-bold">
            {step === STEPS.EMAIL && 'Forgot Password'}
            {step === STEPS.OTP && 'Enter OTP'}
            {step === STEPS.DONE && 'Password Reset!'}
          </h2>
          <p className="text-muted">
            {step === STEPS.EMAIL && "Enter your email and we'll send you a 6-digit OTP"}
            {step === STEPS.OTP && `Enter the OTP sent to ${email}`}
            {step === STEPS.DONE && 'Your password has been reset successfully'}
          </p>
        </div>

        {error && <div className="alert alert-danger rounded-3 py-2">{error}</div>}
        {message && <div className="alert alert-success rounded-3 py-2">{message}</div>}

        {step === STEPS.EMAIL && (
          <form onSubmit={requestOtp}>
            <div className="mb-4">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email" className="form-control rounded-3 py-2"
                placeholder="you@example.com" required
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-semibold" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={resetPassword}>
            <div className="mb-3">
              <label className="form-label fw-semibold">6-Digit OTP</label>
              <input
                type="text" className="form-control rounded-3 py-2 text-center fw-bold fs-4 letter-spacing-3"
                placeholder="000000" maxLength={6} required
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ letterSpacing: '0.5rem' }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">New Password</label>
              <input type="password" className="form-control rounded-3 py-2" placeholder="Min 8 characters" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Confirm New Password</label>
              <input type="password" className="form-control rounded-3 py-2" placeholder="Repeat new password" required value={newPassword2} onChange={e => setNewPassword2(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-semibold" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</> : 'Reset Password'}
            </button>
            <button type="button" className="btn btn-link w-100 text-muted mt-2" onClick={() => { setStep(STEPS.EMAIL); setError(''); setMessage(''); }}>
              ← Use different email
            </button>
          </form>
        )}

        {step === STEPS.DONE && (
          <Link to="/login" className="btn btn-success w-100 py-2 rounded-3 fw-semibold">
            Go to Login →
          </Link>
        )}

        {step !== STEPS.DONE && (
          <p className="text-center mt-3 mb-0">
            <Link to="/login" className="text-success">← Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
