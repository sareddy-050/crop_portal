// src/pages/AddCropPage.js  (also used as base for EditCropPage)
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cropsAPI } from '../api';

const UNITS = ['kg', 'quintal', 'ton', 'piece', 'dozen', 'bundle'];

const CropFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price_per_unit: '',
    unit: 'kg', quantity_available: '', location: '',
    harvest_date: '', status: 'available',
    is_organic: false, category_id: '',
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    cropsAPI.categories().then(data => setCategories(data.results || data)).catch(() => {});
    if (isEdit && id) {
      cropsAPI.get(id).then(data => {
        setForm({
          name: data.name, description: data.description,
          price_per_unit: data.price_per_unit, unit: data.unit,
          quantity_available: data.quantity_available, location: data.location,
          harvest_date: data.harvest_date || '', status: data.status,
          is_organic: data.is_organic, category_id: data.category?.id || '',
        });
        setExistingMedia(data.media || []);
      }).finally(() => setLoadingData(false));
    }
  }, [isEdit, id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    // Clean payload - remove empty optional fields
    const buildPayload = (f) => {
      const p = { ...f };
      if (!p.category_id) delete p.category_id;
      if (!p.harvest_date) delete p.harvest_date;
      if (p.category_id) p.category_id = parseInt(p.category_id);
      return p;
    };
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      let crop;
      if (isEdit) {
        crop = await cropsAPI.update(id, buildPayload(form));
      } else {
        crop = await cropsAPI.create(buildPayload(form));
        // Upload media files
        if (mediaFiles.length > 0) {
          const fd = new FormData();
          mediaFiles.forEach(f => fd.append('files', f));
          await cropsAPI.uploadMedia(crop.id, fd);
        }
      }
      navigate(`/crops/${crop.id}`);
    } catch (err) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k) => errors[k] && <div className="text-danger small mt-1">{Array.isArray(errors[k]) ? errors[k][0] : errors[k]}</div>;

  if (loadingData) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h2 className="fw-bold mb-1">{isEdit ? '✏️ Edit Crop' : '🌱 List a New Crop'}</h2>
          <p className="text-muted mb-4">{isEdit ? 'Update your crop listing.' : 'Fill in the details to list your crop for sale.'}</p>

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Basic Information</h6>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label fw-semibold">Crop Name *</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. Basmati Rice, Alphonso Mango" required value={form.name} onChange={set('name')} />
                {fieldError('name')}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Category</label>
                <select className="form-select rounded-3" value={form.category_id} onChange={set('category_id')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Location *</label>
                <input type="text" className="form-control rounded-3" placeholder="City, State" required value={form.location} onChange={set('location')} />
                {fieldError('location')}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Description *</label>
                <textarea className="form-control rounded-3" rows={4} placeholder="Describe your crop quality, farming method, special features..." required value={form.description} onChange={set('description')} />
              </div>
            </div>

            {/* Pricing */}
            <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Pricing & Quantity</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Price per Unit (₹) *</label>
                <input type="number" className="form-control rounded-3" placeholder="0.00" min="0" step="0.01" required value={form.price_per_unit} onChange={set('price_per_unit')} />
                {fieldError('price_per_unit')}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Unit *</label>
                <select className="form-select rounded-3" value={form.unit} onChange={set('unit')}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Quantity Available *</label>
                <input type="number" className="form-control rounded-3" placeholder="e.g. 500" min="0" step="0.01" required value={form.quantity_available} onChange={set('quantity_available')} />
              </div>
            </div>

            {/* Additional */}
            <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Additional Details</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Harvest Date</label>
                <input type="date" className="form-control rounded-3" value={form.harvest_date} onChange={set('harvest_date')} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select rounded-3" value={form.status} onChange={set('status')}>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="organic" checked={form.is_organic} onChange={set('is_organic')} />
                  <label className="form-check-label fw-semibold" htmlFor="organic">🌿 This is an organic crop</label>
                </div>
              </div>
            </div>

            {/* Media Upload (only on create) */}
            {!isEdit && (
              <>
                <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Photos & Videos</h6>
                <div className="mb-4">
                  <div
                    className="border-2 border-dashed border-success rounded-4 p-4 text-center"
                    style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                    onClick={() => document.getElementById('mediaInput').click()}
                  >
                    <div style={{ fontSize: '3rem' }}>📷</div>
                    <p className="fw-semibold mb-1">Click to upload photos or videos</p>
                    <p className="text-muted small mb-0">JPG, PNG, MP4 • First image will be the main photo</p>
                    <input
                      type="file" id="mediaInput" multiple accept="image/*,video/*"
                      className="d-none"
                      onChange={e => setMediaFiles([...e.target.files])}
                    />
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap mt-3">
                      {mediaFiles.map((f, i) => (
                        <div key={i} className="rounded-3 overflow-hidden bg-light border" style={{ width: 80, height: 60 }}>
                          {f.type.startsWith('image/')
                            ? <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">🎥</div>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {errors.detail && <div className="alert alert-danger rounded-3">{errors.detail}</div>}

            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-success px-5 py-2 rounded-3 fw-semibold" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />{isEdit ? 'Saving...' : 'Listing...'}</> : isEdit ? 'Save Changes' : 'List Crop for Sale'}
              </button>
              <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AddCropPage = () => <CropFormPage isEdit={false} />;
export const EditCropPage = () => <CropFormPage isEdit={true} />;

export default AddCropPage;
