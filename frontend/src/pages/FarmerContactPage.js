// src/pages/FarmerContactPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const FarmerContactPage = () => {
  const { id } = useParams();
  return (
    <div className="py-5 min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center" style={{ maxWidth: 500 }}>
        <div style={{ fontSize: '4rem' }}>👨‍🌾</div>
        <h3 className="fw-bold mt-3">Contact Farmer</h3>
        <p className="text-muted">Browse this farmer's crops and use the contact form on the crop detail page to send an inquiry.</p>
        <Link to={`/crops?farmer=${id}`} className="btn btn-success rounded-pill px-4">View Their Crops</Link>
      </div>
    </div>
  );
};

export default FarmerContactPage;
