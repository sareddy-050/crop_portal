// src/components/CropCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const CropCard = ({ crop, onToggleSave, isSaved }) => {
  const placeholder = `https://placehold.co/400x250/e8f5e9/2e7d32?text=${encodeURIComponent(crop.name)}`;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden crop-card">
      <div className="position-relative">
        <img
          src={crop.primary_image || placeholder}
          alt={crop.name}
          className="card-img-top"
          style={{ height: 200, objectFit: 'cover' }}
          onError={e => { e.target.src = placeholder; }}
        />
        <div className="position-absolute top-0 start-0 m-2">
          <span className={`badge rounded-pill ${crop.status === 'available' ? 'bg-success' : crop.status === 'sold' ? 'bg-danger' : 'bg-warning text-dark'}`}>
            {crop.status}
          </span>
          {crop.is_organic && <span className="badge rounded-pill bg-info ms-1">🌿 Organic</span>}
        </div>
        {onToggleSave !== undefined && (
          <button
            className={`btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle ${isSaved ? 'btn-danger' : 'btn-outline-light'}`}
            style={{ width: 36, height: 36, padding: 0 }}
            onClick={(e) => { e.preventDefault(); onToggleSave(crop.id); }}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="card-body d-flex flex-column p-3">
        <h6 className="fw-bold mb-1 text-truncate">{crop.name}</h6>
        <p className="text-muted small mb-2">
          <span className="me-2">📍 {crop.location}</span>
        </p>
        <p className="text-muted small mb-2">
          👨‍🌾 <Link to={`/farmer/${crop.farmer_id}`} className="text-decoration-none text-success">{crop.farmer_name}</Link>
        </p>
        {crop.category_name && (
          <span className="badge bg-success bg-opacity-10 text-success small mb-2">{crop.category_name}</span>
        )}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-bold text-success fs-5">₹{crop.price_per_unit}</span>
            <span className="text-muted small">/{crop.unit}</span>
          </div>
          <Link to={`/crops/${crop.id}`} className="btn btn-success btn-sm rounded-pill px-3">
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
