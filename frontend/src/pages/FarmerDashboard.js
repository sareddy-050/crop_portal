// src/pages/FarmerDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, cropsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import CropCard from '../components/CropCard';

const StatCard = ({ icon, label, value, color = 'success' }) => (
  <div className={`card border-0 shadow-sm rounded-4 p-4 h-100 border-start border-4 border-${color}`}>
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <div className="text-muted small fw-semibold text-uppercase mb-1">{label}</div>
        <div className="h2 fw-bold mb-0">{value}</div>
      </div>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
    </div>
  </div>
);

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [mycrops, setMycrops] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      dashboardAPI.farmer(),
      cropsAPI.mine(),
      cropsAPI.myInquiries(),
    ]).then(([s, crops, inq]) => {
      setStats(s);
      setMycrops(crops.results || crops);
      setInquiries(inq.results || inq);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">👨‍🌾 Farmer Dashboard</h2>
            <p className="text-muted mb-0">Welcome back, {user?.full_name}!</p>
          </div>
          <Link to="/crops/add" className="btn btn-success rounded-pill px-4 fw-semibold">
            + Add New Crop
          </Link>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3"><StatCard icon="🌱" label="Total Listings" value={stats?.total_listings || 0} color="success" /></div>
          <div className="col-6 col-lg-3"><StatCard icon="✅" label="Available" value={stats?.available || 0} color="primary" /></div>
          <div className="col-6 col-lg-3"><StatCard icon="👁️" label="Total Views" value={stats?.total_views || 0} color="info" /></div>
          <div className="col-6 col-lg-3"><StatCard icon="💬" label="Inquiries" value={stats?.total_inquiries || 0} color="warning" /></div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs border-0 mb-4">
          {[['overview', '📊 Overview'], ['listings', '🌾 My Listings'], ['inquiries', '💬 Inquiries']].map(([tab, label]) => (
            <li key={tab} className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === tab ? 'active text-success border-bottom border-success border-2' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
                style={{ background: 'none', border: 'none' }}
              >
                {label}
                {tab === 'inquiries' && stats?.new_inquiries > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2">{stats.new_inquiries}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {activeTab === 'overview' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3">Recent Listings</h5>
                {stats?.recent_crops?.length === 0
                  ? <p className="text-muted">No listings yet. <Link to="/crops/add">Add your first crop</Link></p>
                  : <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Crop</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recent_crops?.map(c => (
                            <tr key={c.id}>
                              <td className="fw-semibold">{c.name}</td>
                              <td>₹{c.price_per_unit}/{c.unit}</td>
                              <td><span className={`badge ${c.status === 'available' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span></td>
                              <td>{c.views_count}</td>
                              <td><Link to={`/crops/${c.id}`} className="btn btn-outline-success btn-sm rounded-3">View</Link></td>
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
                  <Link to="/crops/add" className="btn btn-success rounded-3">🌱 Add New Crop</Link>
                  <Link to="/profile" className="btn btn-outline-success rounded-3">👤 Edit Profile</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          mycrops.length === 0
            ? <div className="text-center py-5 text-muted">
                <div style={{ fontSize: '4rem' }}>🌾</div>
                <h5>No listings yet</h5>
                <Link to="/crops/add" className="btn btn-success rounded-pill mt-3">Add Your First Crop</Link>
              </div>
            : <div className="row g-3">
                {mycrops.map(c => (
                  <div key={c.id} className="col-sm-6 col-lg-4"><CropCard crop={c} /></div>
                ))}
              </div>
        )}

        {activeTab === 'inquiries' && (
          inquiries.length === 0
            ? <div className="text-center py-5 text-muted"><div style={{ fontSize: '3rem' }}>📭</div><p>No inquiries yet.</p></div>
            : <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Customer</th>
                        <th>Crop</th>
                        <th>Message</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map(i => (
                        <tr key={i.id}>
                          <td className="fw-semibold">{i.sender_name}</td>
                          <td>{i.crop_name}</td>
                          <td className="text-muted" style={{ maxWidth: 200 }}><span className="text-truncate d-block">{i.message}</span></td>
                          <td>{i.phone || '—'}</td>
                          <td className="text-muted small">{new Date(i.created_at).toLocaleDateString('en-IN')}</td>
                          <td><span className={`badge ${i.status === 'new' ? 'bg-danger' : 'bg-secondary'}`}>{i.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
