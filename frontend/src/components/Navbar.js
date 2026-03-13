// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/customer';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.5rem' }}>🌾</span>
          <span>CropPortal</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={() => setCollapsed(true)}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/crops" onClick={() => setCollapsed(true)}>Browse Crops</NavLink>
            </li>
            {user?.role === 'farmer' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/crops/add" onClick={() => setCollapsed(true)}>+ Sell Crop</NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  {user.profile_image
                    ? <img src={user.profile_image} alt="" className="rounded-circle" style={{ width: 30, height: 30, objectFit: 'cover' }} />
                    : <span className="bg-white text-success rounded-circle d-inline-flex align-items-center justify-content-center fw-bold" style={{ width: 30, height: 30 }}>
                        {user.full_name?.[0]?.toUpperCase()}
                      </span>
                  }
                  <span>{user.full_name}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li><Link className="dropdown-item" to={dashboardPath}>📊 Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/profile">👤 My Profile</Link></li>
                  {user.role === 'farmer' && (
                    <li><Link className="dropdown-item" to="/crops/mine">🌱 My Listings</Link></li>
                  )}
                  {user.role === 'customer' && (
                    <li><Link className="dropdown-item" to="/crops/saved">❤️ Saved Crops</Link></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>🚪 Logout</button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={() => setCollapsed(true)}>Login</NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-light btn-sm text-success fw-semibold px-3" to="/register" onClick={() => setCollapsed(true)}>
                    Sign Up Free
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
