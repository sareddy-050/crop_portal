// src/pages/CropListingPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cropsAPI } from '../api';
import CropCard from '../components/CropCard';
import { useAuth } from '../context/AuthContext';

const CropListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [savedIds, setSavedIds] = useState(new Set());
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    status: 'available',
    is_organic: '',
    min_price: '',
    max_price: '',
    location: '',
    ordering: '-created_at',
  });

  useEffect(() => {
    cropsAPI.categories().then(data => setCategories(data.results || data)).catch(() => {});
    if (user?.role === 'customer') {
      cropsAPI.saved().then(data => {
        setSavedIds(new Set((data.results || data).map(c => c.id)));
      }).catch(() => {});
    }
  }, [user]);

  const fetchCrops = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    params.append('page', page);
    cropsAPI.list(params.toString())
      .then(data => { setCrops(data.results || []); setTotalCount(data.count || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleSave = async (cropId) => {
    const res = await cropsAPI.toggleSave(cropId);
    setSavedIds(prev => {
      const next = new Set(prev);
      res.saved ? next.add(cropId) : next.delete(cropId);
      return next;
    });
  };

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        <div className="row g-4">
          {/* ── Sidebar Filters ──── */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 sticky-top" style={{ top: 80 }}>
              <h5 className="fw-bold mb-3">🔍 Filters</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Search</label>
                <input
                  type="text" className="form-control form-control-sm rounded-3"
                  placeholder="Crop name, location..."
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Category</label>
                <select className="form-select form-select-sm rounded-3" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Status</label>
                <select className="form-select form-select-sm rounded-3" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Price Range (₹)</label>
                <div className="d-flex gap-2">
                  <input type="number" className="form-control form-control-sm rounded-3" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
                  <input type="number" className="form-control form-control-sm rounded-3" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Location</label>
                <input type="text" className="form-control form-control-sm rounded-3" placeholder="City or state" value={filters.location} onChange={e => setFilter('location', e.target.value)} />
              </div>

              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="organic"
                  checked={filters.is_organic === 'true'}
                  onChange={e => setFilter('is_organic', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="organic">🌿 Organic only</label>
              </div>

              <button className="btn btn-outline-secondary btn-sm w-100 rounded-3" onClick={() => setFilters({ search: '', category: '', status: 'available', is_organic: '', min_price: '', max_price: '', location: '', ordering: '-created_at' })}>
                Reset Filters
              </button>
            </div>
          </div>

          {/* ── Crop Grid ──── */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="mb-0 text-muted">{loading ? '...' : `${totalCount} crops found`}</p>
              <select className="form-select form-select-sm w-auto rounded-3" value={filters.ordering} onChange={e => setFilter('ordering', e.target.value)}>
                <option value="-created_at">Newest First</option>
                <option value="price_per_unit">Price: Low to High</option>
                <option value="-price_per_unit">Price: High to Low</option>
                <option value="-views_count">Most Viewed</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-success" /></div>
            ) : crops.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: '4rem' }}>🌾</div>
                <h5>No crops found</h5>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {crops.map(crop => (
                    <div key={crop.id} className="col-sm-6 col-xl-4">
                      <CropCard
                        crop={crop}
                        isSaved={savedIds.has(crop.id)}
                        onToggleSave={user?.role === 'customer' ? toggleSave : undefined}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-4 d-flex justify-content-center">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link rounded-start-3" onClick={() => setPage(p => p - 1)}>‹</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link rounded-end-3" onClick={() => setPage(p => p + 1)}>›</button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropListingPage;
