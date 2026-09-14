import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Tent, Calendar, Clock, MapPin, CheckCircle2, UserCheck, Plus, X, Hospital } from 'lucide-react';

export function HealthCamps() {
  const { user, token, role, villages } = useAuth();
  const { t } = useLanguage();

  const [camps, setCamps] = useState([]);
  const [registeredCampIds, setRegisteredCampIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [registerMsg, setRegisterMsg] = useState(null);

  // New camp modal for staff
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamp, setNewCamp] = useState({
    facility_id: 1,
    village_id: 1,
    camp_name: '',
    location: '',
    camp_date: '',
    start_time: '09:00 AM',
    end_time: '03:00 PM',
    services_offered: '',
    target_audience: 'All Villagers'
  });

  const fetchCamps = () => {
    setLoading(true);
    fetch('/api/camps')
      .then(res => res.json())
      .then(data => {
        setCamps(data.camps || []);
        setLoading(false);
      });

    // Also fetch user's registered camps if citizen
    if (token) {
      fetch('/api/camps/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.registeredCamps) {
            const ids = new Set(data.registeredCamps.map(c => c.camp_id));
            setRegisteredCampIds(ids);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [token]);

  const handleRegister = async (campId) => {
    if (!token) {
      setRegisterMsg({ type: 'error', text: 'Please log in as a citizen to register for health camps.' });
      return;
    }

    try {
      const res = await fetch(`/api/camps/${campId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');

      setRegisterMsg({ type: 'success', text: data.message });
      setRegisteredCampIds(prev => new Set([...prev, campId]));
      fetchCamps();
    } catch (err) {
      setRegisterMsg({ type: 'error', text: err.message });
    }
  };

  const handleAddCamp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/camps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCamp)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create camp');

      setShowAddModal(false);
      fetchCamps();
    } catch (err) {
      alert(err.message);
    }
  };

  const canCreate = role === 'doctor' || role === 'asha' || role === 'admin';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            {t('tile_health_camps')}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Free government screening drives, immunization outreach, and diagnostic camps in rural villages
          </p>
        </div>

        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Schedule Health Camp
          </button>
        )}
      </div>

      {registerMsg && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          background: registerMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: registerMsg.type === 'success' ? '#34D399' : '#F87171',
          border: `1px solid ${registerMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{registerMsg.text}</span>
          <button onClick={() => setRegisterMsg(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Camps List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading scheduled health camps...
        </div>
      ) : camps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Tent size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>No health camps scheduled at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {camps.map(camp => {
            const isRegistered = registeredCampIds.has(camp.camp_id);

            return (
              <div
                key={camp.camp_id}
                className="card"
                style={{
                  padding: '1.75rem',
                  border: isRegistered ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-success">
                      {camp.status}
                    </span>
                    <span className="badge badge-info">
                      Organized by {camp.facility_name}
                    </span>
                    {isRegistered && (
                      <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.25)' }}>
                        ✓ Registered
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.35rem', color: '#11322A', fontWeight: 700, marginBottom: '0.4rem' }}>
                    {camp.camp_name}
                  </h3>

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={15} color="#FBBF24" /> <b>{camp.camp_date}</b>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={15} color="#38BDF8" /> {camp.start_time} - {camp.end_time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={15} color="#F87171" /> {camp.location} ({camp.village_name})
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', margin: '0.75rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Free Services & Facilities Offered:
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '3px' }}>
                      {camp.services_offered}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Target Group: {camp.target_audience}
                    </div>
                  </div>
                </div>

                {/* Right registration box */}
                <div style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  minWidth: '220px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Attendees</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2DD4BF', margin: '4px 0' }}>
                    {camp.total_registered || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Free Admission
                  </div>

                  {isRegistered ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#34D399', fontWeight: 700, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> Spot Reserved
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(camp.camp_id)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <UserCheck size={16} /> Register Free
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Add Camp Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Schedule Health Camp</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddCamp}>
              <div className="form-group">
                <label className="form-label">Camp Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Free Eye & Cataract Screening Camp"
                  value={newCamp.camp_name}
                  onChange={e => setNewCamp({ ...newCamp, camp_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Village</label>
                  <select
                    className="form-select"
                    value={newCamp.village_id}
                    onChange={e => setNewCamp({ ...newCamp, village_id: parseInt(e.target.value) })}
                  >
                    {villages.map(v => (
                      <option key={v.village_id} value={v.village_id}>{v.village_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Camp Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newCamp.camp_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setNewCamp({ ...newCamp, camp_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Hall Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gram Panchayat Hall, Shivapur"
                  value={newCamp.location}
                  onChange={e => setNewCamp({ ...newCamp, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Services Offered (comma separated)</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Vision Testing, Cataract Screening, Free Spectacles, Blood Pressure check"
                  value={newCamp.services_offered}
                  onChange={e => setNewCamp({ ...newCamp, services_offered: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Announce Camp to Villagers
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
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
