import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Phone, Navigation, ShieldAlert, X, Hospital, Ambulance, Radio } from 'lucide-react';
import { EmergencyCallModal } from './EmergencyCallModal';

export function EmergencyModal({ isOpen, onClose }) {
  const { selectedVillage, setSelectedVillage, villages } = useAuth();
  const { t } = useLanguage();
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCallSimulator, setShowCallSimulator] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const villageId = selectedVillage ? selectedVillage.village_id : 1;
    fetch(`/api/facilities/emergency/nearest?village_id=${villageId}`)
      .then(res => res.json())
      .then(data => {
        setEmergencyData(data.nearest_emergency_facility);
        setLoading(false);
      })
      .catch(err => {
        console.error('Emergency fetch error:', err);
        setLoading(false);
      });
  }, [isOpen, selectedVillage]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', border: '2px solid #EF4444' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#EF4444', padding: '0.6rem', borderRadius: '50%', color: '#FFFFFF', display: 'flex' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#EF4444', fontWeight: 800 }}>
                {t('tile_emergency_help')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Immediate 24x7 Government Trauma & Ambulance Support
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* 108 Emergency Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.3) 100%)',
          border: '1px solid #EF4444',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F87171', fontWeight: 700 }}>
              National Ambulance Service
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
              DIAL 108
            </div>
            <p style={{ fontSize: '0.82rem', color: '#FECACA' }}>
              Free 24x7 emergency medical response for rural areas
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowCallSimulator(true)}
              className="btn btn-emergency btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
            >
              <Radio size={18} className="animate-pulse" /> Live 108 Voice Call
            </button>
            <a
              href="tel:108"
              className="btn btn-secondary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem' }}
            >
              <Phone size={16} /> Dial 108
            </a>
          </div>
        </div>

        {/* Location selector for accuracy */}
        <div style={{ background: 'var(--color-bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Calculating nearest facility from:
            </span>
            <select
              value={selectedVillage ? selectedVillage.village_id : ''}
              onChange={e => {
                const v = villages.find(vil => vil.village_id === parseInt(e.target.value));
                if (v) setSelectedVillage(v);
              }}
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
            >
              {villages.map(v => (
                <option key={v.village_id} value={v.village_id}>{v.village_name} ({v.district})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nearest Facility Card */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Finding nearest emergency trauma center...
          </div>
        ) : emergencyData ? (
          <div className="card" style={{ background: 'var(--color-bg-elevated)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-danger" style={{ marginBottom: '0.4rem' }}>
                  Nearest Emergency Facility
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Hospital size={20} color="#38BDF8" /> {emergencyData.facility_name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {emergencyData.address}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34D399' }}>
                  {emergencyData.distanceKm} km
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  approx. {Math.round(emergencyData.distanceKm * 2.5)} mins drive
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', margin: '1rem 0' }}>
              <div style={{ background: 'var(--color-bg-primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ambulance</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: emergencyData.ambulance_available ? '#34D399' : '#F87171' }}>
                  {emergencyData.ambulance_available ? 'Available' : 'En Route'}
                </div>
              </div>
              <div style={{ background: 'var(--color-bg-primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Beds</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8' }}>
                  {emergencyData.available_beds} / {emergencyData.total_beds}
                </div>
              </div>
              <div style={{ background: 'var(--color-bg-primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trauma Level</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FBBF24' }}>
                  {emergencyData.trauma_care_level || 'Level 1'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <a
                href={`tel:${emergencyData.ambulance_phone || emergencyData.emergency_contact}`}
                className="btn btn-secondary"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <Phone size={18} /> Call Hospital ({emergencyData.emergency_contact})
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${emergencyData.latitude},${emergencyData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <Navigation size={18} /> GPS Directions
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No emergency facilities found nearby. Please call 108 directly.
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>
            Close Emergency Window
          </button>
        </div>
      </div>

      {/* Interactive In-Browser Live 108 Emergency Voice Dispatch Call Screen */}
      <EmergencyCallModal
        isOpen={showCallSimulator}
        onClose={() => setShowCallSimulator(false)}
        serviceNumber="108"
        serviceName="Maharashtra 108 Emergency Medical Services (MEMS)"
      />
    </div>
  );
}
