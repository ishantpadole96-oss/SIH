import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Hospital, Bed, Stethoscope, ShieldAlert, Pill, Edit3, 
  CheckCircle2, AlertCircle, RefreshCw, X, Search, Navigation, MapPin 
} from 'lucide-react';

export function HospitalAvailability({ setActiveTab, setSelectedFacilityForBooking }) {
  const { user, role, token } = useAuth();
  const { t } = useLanguage();

  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingFacility, setEditingFacility] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    total_beds: 0,
    available_beds: 0,
    current_status: 'Open',
    emergency_available: 1
  });
  const [updateMsg, setUpdateMsg] = useState(null);

  const fetchBoard = () => {
    setLoading(true);
    fetch('/api/facilities/availability/all')
      .then(res => res.json())
      .then(data => {
        setBoard(data.availabilityBoard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load availability:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const openEditModal = (facility) => {
    setEditingFacility(facility);
    setUpdateForm({
      total_beds: facility.total_beds,
      available_beds: facility.available_beds,
      current_status: facility.current_status,
      emergency_available: facility.emergency_available
    });
    setUpdateMsg(null);
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    if (!editingFacility) return;

    try {
      const res = await fetch(`/api/facilities/${editingFacility.facility_id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update availability');

      setUpdateMsg({ type: 'success', text: 'Facility availability updated successfully in database!' });
      fetchBoard();
      setTimeout(() => {
        setEditingFacility(null);
      }, 1200);
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.message });
    }
  };

  const canEdit = role === 'doctor' || role === 'admin' || role === 'asha';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            {t('tile_hospital_availability')}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Real-time live census of beds, on-duty doctors, emergency readiness, and pharmacy inventory
          </p>
        </div>

        <button onClick={fetchBoard} className="btn btn-secondary btn-sm" title="Refresh Live Board">
          <RefreshCw size={16} /> Refresh Census
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search facility name, district, or town..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ flex: '0 1 240px' }}>
          <select
            className="form-select"
            value={filterDistrict}
            onChange={e => setFilterDistrict(e.target.value)}
          >
            <option value="All">All 36 Districts (Maharashtra)</option>
            {Array.from(new Set(board.map(b => b.district).filter(Boolean))).sort().map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Showing <b>{board.filter(f => (filterDistrict === 'All' || f.district === filterDistrict) && (!searchKeyword || f.facility_name.toLowerCase().includes(searchKeyword.toLowerCase()) || (f.district && f.district.toLowerCase().includes(searchKeyword.toLowerCase())))).length}</b> of {board.length} facilities
        </div>
      </div>

      {/* Live Board Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Syncing facility census records...
        </div>
      ) : (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {board
            .filter(facility => {
              const matchesDistrict = filterDistrict === 'All' || facility.district === filterDistrict;
              const matchesSearch = !searchKeyword ||
                facility.facility_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                (facility.village_name && facility.village_name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                (facility.district && facility.district.toLowerCase().includes(searchKeyword.toLowerCase()));
              return matchesDistrict && matchesSearch;
            })
            .map(facility => {
            const occupancyPct = facility.total_beds > 0
              ? Math.round(((facility.total_beds - facility.available_beds) / facility.total_beds) * 100)
              : 0;

            const isBedFull = facility.available_beds === 0;

            return (
              <div
                key={facility.facility_id}
                className="card"
                style={{
                  background: 'var(--color-bg-card)',
                  border: isBedFull ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Header: Status & Type */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${facility.current_status === 'Open' ? 'badge-success' : 'badge-danger'}`}>
                        {facility.current_status === 'Open' ? '🟢 Open Now' : '🔴 Closed / Emergency Only'}
                      </span>
                      <span className="badge badge-info">
                        {facility.facility_type}
                      </span>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => openEditModal(facility)}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <Edit3 size={13} /> Update Status
                      </button>
                    )}
                  </div>

                  {/* Facility Title & Location */}
                  <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {facility.facility_name}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    📍 {facility.address} ({facility.village_name}) • {facility.opening_hours}
                  </p>
                  {facility.latitude && facility.longitude && (
                    <div style={{ fontSize: '0.76rem', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1.1rem' }}>
                      <MapPin size={13} /> GPS: {facility.latitude?.toFixed(4)}° N, {facility.longitude?.toFixed(4)}° E &bull; {facility.district || 'Maharashtra'}
                    </div>
                  )}

                  {/* Live Status Indicators (Exact specs from prompt) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    background: 'var(--color-bg-primary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem'
                  }}>
                    
                    {/* Doctors Available */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Stethoscope size={14} color="#34D399" /> Doctors On Duty
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: facility.doctors_available > 0 ? '#34D399' : '#F87171', marginTop: '2px' }}>
                        {facility.doctors_available} Available
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        out of {facility.total_doctors} doctors
                      </div>
                    </div>

                    {/* Beds Availability */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bed size={14} color="#38BDF8" /> Available Beds
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
                        {facility.available_beds} / {facility.total_beds}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {occupancyPct}% Occupancy rate
                      </div>
                    </div>

                    {/* Emergency Service */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={14} color="#F87171" /> 24x7 Emergency
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: facility.emergency_available ? '#34D399' : '#94A3B8', marginTop: '2px' }}>
                        {facility.emergency_available ? '🟢 Fully Available' : '⚪ Routine OPD Only'}
                      </div>
                      {facility.ambulance_available ? (
                        <div style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
                          🚑 Ambulance on standby
                        </div>
                      ) : null}
                    </div>

                    {/* Medicines Inventory */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Pill size={14} color="#FBBF24" /> Essential Medicines
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: facility.medicine_status === 'Available' ? '#34D399' : '#FBBF24', marginTop: '2px' }}>
                        {facility.medicine_status === 'Available' ? '🟢 In Stock' : '🟡 Partial Stock'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Essential Drugs List
                      </div>
                    </div>

                  </div>

                  {/* Bed Occupancy Progress Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Bed Capacity Progress</span>
                      <span><b>{facility.available_beds}</b> Vacant Beds</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${occupancyPct}%`,
                        height: '100%',
                        background: occupancyPct > 85 ? '#EF4444' : occupancyPct > 60 ? '#F59E0B' : '#10B981',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Services preview */}
                  {facility.services_preview && facility.services_preview.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Active Clinical Services:
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {facility.services_preview.map((s, idx) => (
                          <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Action */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      if (setSelectedFacilityForBooking) setSelectedFacilityForBooking(facility);
                      setActiveTab('book-appointment');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Book Consultation
                  </button>
                  <a
                    href={`tel:${facility.contact}`}
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Call ({facility.contact})
                  </a>
                  {facility.latitude && facility.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                      title="Open GPS Navigation in Google Maps"
                    >
                      <Navigation size={15} /> Directions
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Staff Update Availability Modal */}
      {editingFacility && (
        <div className="modal-overlay" onClick={() => setEditingFacility(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Update Hospital Census</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{editingFacility.facility_name}</p>
              </div>
              <button onClick={() => setEditingFacility(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {updateMsg && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                background: updateMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: updateMsg.type === 'success' ? '#34D399' : '#F87171',
                fontSize: '0.85rem'
              }}>
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateAvailability}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Available Beds</label>
                  <input
                    type="number"
                    className="form-input"
                    value={updateForm.available_beds}
                    onChange={e => setUpdateForm({ ...updateForm, available_beds: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={updateForm.total_beds}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Beds</label>
                  <input
                    type="number"
                    className="form-input"
                    value={updateForm.total_beds}
                    onChange={e => setUpdateForm({ ...updateForm, total_beds: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Operational Status</label>
                <select
                  className="form-select"
                  value={updateForm.current_status}
                  onChange={e => setUpdateForm({ ...updateForm, current_status: e.target.value })}
                >
                  <option value="Open">Open (Standard OPD & Services)</option>
                  <option value="Emergency Only">Emergency Only</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={updateForm.emergency_available === 1}
                    onChange={e => setUpdateForm({ ...updateForm, emergency_available: e.target.checked ? 1 : 0 })}
                    style={{ width: '16px', height: '16px', accentColor: '#0D9488' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#11322A' }}>Emergency Department Operational 24x7</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Availability to Database
                </button>
                <button type="button" onClick={() => setEditingFacility(null)} className="btn btn-secondary">
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
