// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password2: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const updated = await authAPI.updateProfile(form);
      updateUser(updated);
      setMessage('Profile updated successfully!');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true); setMessage(''); setError('');
    try {
      await authAPI.changePassword(pwForm);
      setMessage('Password changed successfully!');
      setPwForm({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      setError(err.error || err.old_password || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: 700 }}>
        <h2 className="fw-bold mb-4">👤 My Profile</h2>

        {message && <div className="alert alert-success rounded-3">{message}</div>}
        {error && <div className="alert alert-danger rounded-3">{error}</div>}

        {/* Profile info */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 70, height: 70, fontSize: '2rem' }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h5 className="fw-bold mb-0">{user?.full_name}</h5>
              <span className="badge bg-success">{user?.role}</span>
              <p className="text-muted small mb-0 mt-1">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name</label>
                <input type="text" className="form-control rounded-3" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input type="tel" className="form-control rounded-3" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Location</label>
                <input type="text" className="form-control rounded-3" placeholder="City, State" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control rounded-3" rows={3} placeholder="Tell buyers about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-success mt-3 rounded-3 px-4 fw-semibold" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">🔐 Change Password</h5>
          <form onSubmit={changePassword}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Current Password</label>
              <input type="password" className="form-control rounded-3" required value={pwForm.old_password} onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">New Password</label>
                <input type="password" className="form-control rounded-3" required value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input type="password" className="form-control rounded-3" required value={pwForm.new_password2} onChange={e => setPwForm({ ...pwForm, new_password2: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-outline-success rounded-3 px-4 fw-semibold" disabled={changingPw}>
              {changingPw ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
