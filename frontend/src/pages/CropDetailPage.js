// src/pages/CropDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cropsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CropDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [inquiry, setInquiry] = useState({ message: '', phone: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryDone, setInquiryDone] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    cropsAPI.get(id)
      .then(data => {
        setCrop(data);
        setIsSaved(data.is_saved);
        const primary = data.media?.find(m => m.is_primary) || data.media?.[0];
        setActiveMedia(primary);
      })
      .catch(() => navigate('/crops'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleSave = async () => {
    const res = await cropsAPI.toggleSave(id);
    setIsSaved(res.saved);
  };

  const sendInquiry = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    try {
      await cropsAPI.sendInquiry({ crop: id, ...inquiry });
      setInquiryDone(true);
    } catch (err) {
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const deleteCrop = async () => {
    if (!window.confirm('Delete this listing?')) return;
    setDeleteLoading(true);
    try {
      await cropsAPI.delete(id);
      navigate('/dashboard/farmer');
    } catch {
      alert('Failed to delete.');
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}><div className="spinner-border text-success" /></div>;
  if (!crop) return null;

  const images = crop.media?.filter(m => m.media_type === 'image') || [];
  const videos = crop.media?.filter(m => m.media_type === 'video') || [];
  const placeholder = `https://placehold.co/800x500/e8f5e9/2e7d32?text=${encodeURIComponent(crop.name)}`;
  const isOwner = user?.id === crop.farmer?.id;

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-success">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/crops" className="text-success">Crops</Link></li>
            <li className="breadcrumb-item active">{crop.name}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* ── Left: Media ──────────── */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
              {activeMedia?.media_type === 'video' ? (
                <video src={activeMedia.file} controls className="w-100" style={{ maxHeight: 420 }} />
              ) : (
                <img
                  src={activeMedia?.file || placeholder}
                  alt={crop.name}
                  className="w-100"
                  style={{ height: 420, objectFit: 'cover' }}
                  onError={e => { e.target.src = placeholder; }}
                />
              )}
            </div>

            {/* Thumbnails */}
            {crop.media?.length > 1 && (
              <div className="d-flex gap-2 flex-wrap">
                {crop.media.map(m => (
                  <div
                    key={m.id}
                    className={`rounded-3 overflow-hidden cursor-pointer border-2 ${activeMedia?.id === m.id ? 'border border-success' : 'border border-transparent'}`}
                    style={{ width: 80, height: 60, cursor: 'pointer' }}
                    onClick={() => setActiveMedia(m)}
                  >
                    {m.media_type === 'video'
                      ? <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center text-white">▶</div>
                      : <img src={m.file} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    }
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mt-3">
              <h5 className="fw-bold mb-3">About This Crop</h5>
              <p className="text-muted">{crop.description || 'No description provided.'}</p>
              {crop.harvest_date && (
                <p className="mb-1"><strong>Harvest Date:</strong> {new Date(crop.harvest_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
            </div>
          </div>

          {/* ── Right: Info ──────────── */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className={`badge rounded-pill mb-2 ${crop.status === 'available' ? 'bg-success' : 'bg-danger'}`}>{crop.status}</span>
                  {crop.is_organic && <span className="badge rounded-pill bg-info ms-2">🌿 Organic</span>}
                </div>
                {user && !isOwner && (
                  <button className={`btn btn-sm rounded-circle ${isSaved ? 'btn-danger' : 'btn-outline-danger'}`} onClick={toggleSave} style={{ width: 38, height: 38 }}>
                    {isSaved ? '❤️' : '🤍'}
                  </button>
                )}
              </div>

              <h2 className="fw-bold">{crop.name}</h2>
              {crop.category && <span className="badge bg-success bg-opacity-10 text-success mb-3">{crop.category.name}</span>}

              <div className="d-flex align-items-baseline gap-2 mb-3">
                <span className="display-6 fw-bold text-success">₹{crop.price_per_unit}</span>
                <span className="text-muted">per {crop.unit}</span>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="bg-light rounded-3 p-3 text-center">
                    <div className="fw-bold text-success">{crop.quantity_available} {crop.unit}</div>
                    <div className="small text-muted">Available</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded-3 p-3 text-center">
                    <div className="fw-bold text-success">{crop.views_count}</div>
                    <div className="small text-muted">Views</div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="mb-1"><strong>📍 Location:</strong> {crop.location}</p>
                <p className="mb-1"><strong>👨‍🌾 Farmer:</strong>{' '}
                  <Link to={`/farmer/${crop.farmer?.id}/contact`} className="text-success">{crop.farmer?.full_name}</Link>
                </p>
                {crop.farmer?.phone && <p className="mb-1"><strong>📞 Phone:</strong> {crop.farmer.phone}</p>}
              </div>

              {/* Owner controls */}
              {isOwner && (
                <div className="d-flex gap-2">
                  <Link to={`/crops/${id}/edit`} className="btn btn-outline-success flex-fill rounded-3">✏️ Edit</Link>
                  <button className="btn btn-outline-danger flex-fill rounded-3" onClick={deleteCrop} disabled={deleteLoading}>
                    {deleteLoading ? <span className="spinner-border spinner-border-sm" /> : '🗑️ Delete'}
                  </button>
                </div>
              )}
            </div>

            {/* Inquiry form */}
            {user && !isOwner && user.role === 'customer' && crop.status === 'available' && (
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3">💬 Contact Farmer</h5>
                {inquiryDone ? (
                  <div className="alert alert-success rounded-3">
                    <strong>Inquiry sent!</strong> The farmer will contact you soon.
                  </div>
                ) : (
                  <form onSubmit={sendInquiry}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Your Message</label>
                      <textarea
                        className="form-control rounded-3" rows={4}
                        placeholder="Hi, I'm interested in buying this crop. What's the minimum order?"
                        required value={inquiry.message}
                        onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Your Phone (optional)</label>
                      <input
                        type="tel" className="form-control rounded-3"
                        placeholder="+91 9876543210"
                        value={inquiry.phone}
                        onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-3 fw-semibold" disabled={inquiryLoading}>
                      {inquiryLoading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {!user && (
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <p className="text-muted mb-3">Sign in to contact this farmer</p>
                <Link to="/login" className="btn btn-success rounded-3">Login to Contact</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailPage;
