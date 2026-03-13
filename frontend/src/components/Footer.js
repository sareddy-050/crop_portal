// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark text-white pt-5 pb-3 mt-5">
    <div className="container">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <h5 className="fw-bold mb-3">🌾 CropPortal</h5>
          <p className="text-white-50 small">Connecting farmers and customers across India. Fresh crops, fair prices, direct from farm to table.</p>
        </div>
        <div className="col-md-2">
          <h6 className="fw-bold mb-3">Quick Links</h6>
          <ul className="list-unstyled small">
            <li><Link to="/" className="text-white-50 text-decoration-none">Home</Link></li>
            <li><Link to="/crops" className="text-white-50 text-decoration-none">Browse Crops</Link></li>
            <li><Link to="/register" className="text-white-50 text-decoration-none">Register</Link></li>
            <li><Link to="/login" className="text-white-50 text-decoration-none">Login</Link></li>
          </ul>
        </div>
        <div className="col-md-3">
          <h6 className="fw-bold mb-3">For Farmers</h6>
          <ul className="list-unstyled small">
            <li className="text-white-50">List your crops</li>
            <li className="text-white-50">Manage listings</li>
            <li className="text-white-50">Track inquiries</li>
            <li className="text-white-50">Farmer dashboard</li>
          </ul>
        </div>
        <div className="col-md-3">
          <h6 className="fw-bold mb-3">Tech Stack</h6>
          <div className="d-flex flex-wrap gap-1">
            {['Django', 'Oracle DB', 'React', 'Bootstrap 5', 'JWT', 'REST API'].map(t => (
              <span key={t} className="badge bg-success bg-opacity-25 text-success-emphasis small">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <hr className="border-secondary" />
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <p className="mb-0 text-white-50 small">© {new Date().getFullYear()} CropPortal. Built with Django + React + Oracle.</p>
        <p className="mb-0 text-white-50 small">🌾 Farm to Table Marketplace</p>
      </div>
    </div>
  </footer>
);

export default Footer;
