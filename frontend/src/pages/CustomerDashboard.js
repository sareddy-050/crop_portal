// src/pages/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, cropsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import CropCard from '../components/CropCard';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([dashboardAPI.customer(), cropsAPI.saved()])
      .then(([s, sv]) => { setStats(s); setSaved(sv.results || sv); })
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (cropId) => {
    await cropsAPI.toggleSave(cropId);
    setSaved(prev => prev.filter(c => c.id !== cropId));
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">🛒 Customer Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.full_name}!</p>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
              <div style={{ fontSize: '2rem' }}>❤️</div>
              <div className="h3 fw-bold text-success">{stats?.saved_crops || 0}</div>
              <div className="text-muted small">Saved Crops</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
              <div style={{ fontSize: '2rem' }}>💬</div>
              <div className="h3 fw-bold text-success">{stats?.inquiries_sent || 0}</div>
              <div className="text-muted small">Inquiries Sent</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs border-0 mb-4">
          {[['overview', '📊 Overview'], ['saved', '❤️ Saved Crops']].map(([tab, label]) => (
            <li key={tab} className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === tab ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
                style={{ background: 'none', border: 'none' }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {activeTab === 'overview' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3">Recent Inquiries</h5>
                {stats?.recent_inquiries?.length === 0
                  ? <p className="text-muted">No inquiries yet. <Link to="/crops">Browse crops</Link></p>
                  : <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr><th>Crop</th><th>Farmer</th><th>Message</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {stats?.recent_inquiries?.map(i => (
                            <tr key={i.id}>
                              <td className="fw-semibold">{i.crop_name}</td>
                              <td>{i.farmer_name}</td>
                              <td className="text-muted small">{i.message}...</td>
                              <td><span className={`badge ${i.status === 'new' ? 'bg-warning text-dark' : 'bg-success'}`}>{i.status}</span></td>
                              <td className="text-muted small">{new Date(i.created_at).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/crops" className="btn btn-success rounded-3">🌾 Browse Crops</Link>
                  <Link to="/profile" className="btn btn-outline-success rounded-3">👤 Edit Profile</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          saved.length === 0
            ? <div className="text-center py-5 text-muted">
                <div style={{ fontSize: '4rem' }}>❤️</div>
                <h5>No saved crops</h5>
                <Link to="/crops" className="btn btn-success rounded-pill mt-3">Browse Crops</Link>
              </div>
            : <div className="row g-3">
                {saved.map(c => (
                  <div key={c.id} className="col-sm-6 col-lg-4">
                    <CropCard crop={c} isSaved={true} onToggleSave={unsave} />
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
