// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cropsAPI } from '../api';
import CropCard from '../components/CropCard';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🌱', title: 'Fresh Listings', text: 'Browse hundreds of fresh crop listings direct from farms.' },
  { icon: '🔒', title: 'Secure Login', text: 'JWT-based auth with OTP password reset and Google OAuth.' },
  { icon: '📸', title: 'Images & Videos', text: 'See exactly what you\'re buying with photos and video tours.' },
  { icon: '💬', title: 'Direct Contact', text: 'Message farmers directly to negotiate prices and arrange pickup.' },
  { icon: '📊', title: 'Smart Dashboards', text: 'Farmers and customers each get tailored dashboards.' },
  { icon: '📱', title: 'Fully Responsive', text: 'Works beautifully on mobile, tablet, and desktop.' },
];

const STATS = [
  { value: '500+', label: 'Farmers' },
  { value: '2,000+', label: 'Crop Listings' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Crop Varieties' },
];

const HomePage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    cropsAPI.list('status=available&ordering=-created_at&page_size=6')
      .then(data => setCrops(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/crops?search=${encodeURIComponent(search)}`);
    else navigate('/crops');
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="py-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #1a6b1a 0%, #2d8a2d 40%, #4caf50 100%)',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span className="badge bg-warning text-dark mb-3 px-3 py-2 fs-6">🌾 Farm to Table Marketplace</span>
              <h1 className="display-4 fw-bold lh-1 mb-3">
                Buy &amp; Sell Fresh<br />
                <span style={{ color: '#c8e6c9' }}>Crops Directly</span><br />
                From Farmers
              </h1>
              <p className="lead mb-4 opacity-90">
                Connect with verified farmers across India. Get fresh produce at fair prices, 
                or list your harvest and reach thousands of customers.
              </p>
              <form onSubmit={handleSearch} className="d-flex gap-2 mb-4" style={{ maxWidth: 480 }}>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  placeholder="Search crops, location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-warning btn-lg rounded-pill px-4 fw-semibold text-nowrap">
                  Search
                </button>
              </form>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/crops" className="btn btn-light btn-lg rounded-pill px-4 text-success fw-semibold">
                  Browse Crops
                </Link>
                {!user && (
                  <Link to="/register" className="btn btn-outline-light btn-lg rounded-pill px-4">
                    Join as Farmer
                  </Link>
                )}
                {user?.role === 'farmer' && (
                  <Link to="/crops/add" className="btn btn-outline-light btn-lg rounded-pill px-4">
                    + List Your Crop
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div style={{ fontSize: '10rem', lineHeight: 1, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}>
                🌾
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-4 bg-success bg-opacity-10 border-bottom">
        <div className="container">
          <div className="row text-center g-3">
            {STATS.map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="h2 fw-bold text-success mb-0">{s.value}</div>
                <small className="text-muted">{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose CropPortal?</h2>
            <p className="text-muted lead">Everything you need to buy and sell fresh crops</p>
          </div>
          <div className="row g-4">
            {FEATURES.map(f => (
              <div key={f.title} className="col-sm-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-card">
                  <div style={{ fontSize: '2.5rem' }} className="mb-3">{f.icon}</div>
                  <h5 className="fw-semibold">{f.title}</h5>
                  <p className="text-muted small mb-0">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Crops ─────────────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Latest Listings</h2>
              <p className="text-muted mb-0">Fresh crops listed by verified farmers</p>
            </div>
            <Link to="/crops" className="btn btn-outline-success rounded-pill">View All →</Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" />
            </div>
          ) : crops.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '4rem' }}>🌱</div>
              <p>No listings yet. Be the first to list a crop!</p>
            </div>
          ) : (
            <div className="row g-4">
              {crops.map(crop => (
                <div key={crop.id} className="col-sm-6 col-lg-4">
                  <CropCard crop={crop} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      {!user && (
        <section className="py-5 bg-success text-white text-center">
          <div className="container py-3">
            <h2 className="display-6 fw-bold mb-3">Ready to get started?</h2>
            <p className="lead mb-4 opacity-90">Join thousands of farmers and customers on CropPortal</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/register" className="btn btn-light btn-lg rounded-pill px-5 text-success fw-bold">
                Sign Up Free
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-5">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
