import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Pill, Search, Hospital, Edit2, AlertCircle, CheckCircle2, Phone, X } from 'lucide-react';

export function MedicineSearch() {
  const { user, role, token } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [groupedMedicines, setGroupedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit stock modal state
  const [editingMed, setEditingMed] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newStatus, setNewStatus] = useState('In Stock');
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchMedicines = () => {
    setLoading(true);
    const url = search ? `/api/medicines?search=${encodeURIComponent(search)}` : '/api/medicines';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMedicines(data.medicines || []);
        setGroupedMedicines(data.groupedByMedicine || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load medicines:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingMed) return;

    try {
      const res = await fetch(`/api/medicines/${editingMed.medicine_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(newQuantity),
          stock_status: newStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');

      setStatusMsg({ type: 'success', text: 'Stock quantity updated in database!' });
      fetchMedicines();
      setTimeout(() => setEditingMed(null), 1000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const canEdit = role === 'doctor' || role === 'asha' || role === 'admin';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
          {t('tile_medicine_search')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Search essential medicines across rural PHCs, CHCs, and District Hospitals in real time
        </p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search medicine by generic name (e.g. Paracetamol, Amoxicillin, ORS, Metformin, Amlodipine)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Quick Tag Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Popular:</span>
          {['Paracetamol', 'Amoxicillin', 'Amlodipine', 'Metformin', 'ORS', 'Anti-Snake Venom'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              style={{
                background: search === tag ? 'var(--color-brand-500)' : 'var(--color-bg-primary)',
                color: search === tag ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {tag}
            </button>
          ))}
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 'none', color: '#F87171', fontSize: '0.78rem', cursor: 'pointer', marginLeft: 'auto' }}>
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Grouped Medicine Availability Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Checking medicine inventories...
        </div>
      ) : groupedMedicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Pill size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>No Medicines Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No stock records match "{search}".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {groupedMedicines.map(group => (
            <div key={group.medicine_name} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                    {group.category || 'Essential Drug'}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {group.medicine_name}
                  </h3>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Stocked at <b>{group.facilities.length}</b> facilities
                </div>
              </div>

              {/* Cross-Facility Breakdown Table / Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {group.facilities.map(fac => {
                  let badgeColor = 'badge-success';
                  let statusText = '🟢 In Stock';
                  if (fac.stock_status === 'Low Stock') {
                    badgeColor = 'badge-warning';
                    statusText = '🟡 Low Stock';
                  } else if (fac.stock_status === 'Out of Stock') {
                    badgeColor = 'badge-danger';
                    statusText = '🔴 Out of Stock';
                  }

                  return (
                    <div
                      key={fac.medicine_id}
                      style={{
                        background: 'var(--color-bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span className={`badge ${badgeColor}`} style={{ fontSize: '0.72rem' }}>
                            {statusText}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {fac.facility_type}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1rem', color: '#FFFFFF', fontWeight: 700, margin: '2px 0' }}>
                          {fac.facility_name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          📍 {fac.village_name} Village
                        </div>

                        <div style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                          Current Quantity: <b>{fac.quantity} {group.unit}</b>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Updated: {fac.last_updated ? fac.last_updated.substring(0, 10) : 'Recent'}
                        </span>

                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingMed(fac);
                              setNewQuantity(fac.quantity);
                              setNewStatus(fac.stock_status);
                              setStatusMsg(null);
                            }}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          >
                            <Edit2 size={12} /> Edit Stock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Edit Medicine Stock Modal */}
      {editingMed && (
        <div className="modal-overlay" onClick={() => setEditingMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Update Pharmacy Inventory</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{editingMed.facility_name}</p>
              </div>
              <button onClick={() => setEditingMed(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {statusMsg && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: statusMsg.type === 'success' ? '#34D399' : '#F87171',
                fontSize: '0.85rem'
              }}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateStock}>
              <div className="form-group">
                <label className="form-label">Available Quantity (Strips/Vials/Sachets)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Stock Update
                </button>
                <button type="button" onClick={() => setEditingMed(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
