import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, Hospital, Stethoscope, CheckCircle2, User, FileText, ArrowRight, MapPin, Navigation, Video } from 'lucide-react';

export function BookAppointment({ setActiveTab, preselectedFacility, onOpenTelemed }) {
  const { user, token, selectedVillage } = useAuth();
  const { t } = useLanguage();

  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(preselectedFacility?.facility_id || '');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  const [consultationMode, setConsultationMode] = useState('in_person'); // 'in_person' | 'video'
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(tomorrow);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [error, setError] = useState(null);

  // Fetch facilities list
  useEffect(() => {
    fetch('/api/facilities')
      .then(res => res.json())
      .then(data => {
        setFacilities(data.facilities || []);
        if (!selectedFacilityId && data.facilities && data.facilities.length > 0) {
          setSelectedFacilityId(data.facilities[0].facility_id);
        }
      });
  }, []);

  // Fetch doctors whenever selectedFacilityId changes
  useEffect(() => {
    if (!selectedFacilityId) return;
    fetch(`/api/doctors?facility_id=${selectedFacilityId}`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctorId(data.doctors[0].staff_id);
        } else {
          setSelectedDoctorId('');
        }
      });
  }, [selectedFacilityId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedFacilityId || !selectedDoctorId || !reason) {
      setError('Please fill in all required appointment details.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          facility_id: parseInt(selectedFacilityId),
          doctor_id: parseInt(selectedDoctorId),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book appointment');

      setConfirmedAppointment(data.appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem', maxWidth: '780px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
          {t('tile_book_appointment')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Schedule an in-person consultation with a government medical officer or specialist
        </p>
      </div>

      {confirmedAppointment ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid #10B981' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={36} color="#34D399" />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.5rem' }}>
            Consultation Confirmed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Appointment Ticket #{confirmedAppointment.appointment_id} has been reserved in the hospital OPD registry.
          </p>

          <div style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto 2rem auto',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Facility:</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{confirmedAppointment.facility_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Doctor:</span>
              <span style={{ fontWeight: 700, color: '#38BDF8', fontSize: '0.95rem' }}>{confirmedAppointment.doctor_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Date & Slot:</span>
              <span style={{ fontWeight: 700, color: '#34D399', fontSize: '0.95rem' }}>{confirmedAppointment.appointment_date} at {confirmedAppointment.appointment_time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status:</span>
              <span className="badge badge-success">{confirmedAppointment.status}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {consultationMode === 'video' && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenTelemed) {
                    onOpenTelemed({
                      doctorName: confirmedAppointment.doctor_name,
                      specialty: 'Government Medical Officer',
                      facility: confirmedAppointment.facility_name,
                      patientName: user?.name
                    });
                  }
                }}
                className="btn"
                style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem'
                }}
              >
                <Video size={18} /> Join Video Consultation Room Now
              </button>
            )}
            <button
              onClick={() => setActiveTab('records-referrals')}
              className="btn btn-primary"
            >
              View My Appointments <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setConfirmedAppointment(null);
                setReason('');
              }}
              className="btn btn-secondary"
            >
              Book Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {/* Consultation Type Switcher: In-Person vs Video Teleconsultation */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
              Consultation Mode:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setConsultationMode('in_person')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: consultationMode === 'in_person' ? '2px solid #0D9488' : '1px solid #E5ECE7',
                  background: consultationMode === 'in_person' ? 'rgba(13, 148, 136, 0.08)' : '#FFFFFF',
                  color: consultationMode === 'in_person' ? '#0F766E' : '#4B5563',
                  fontWeight: consultationMode === 'in_person' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <Hospital size={18} />
                <span>In-Person Facility OPD</span>
              </button>

              <button
                type="button"
                onClick={() => setConsultationMode('video')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: consultationMode === 'video' ? '2px solid #0D9488' : '1px solid #E5ECE7',
                  background: consultationMode === 'video' ? 'rgba(13, 148, 136, 0.08)' : '#FFFFFF',
                  color: consultationMode === 'video' ? '#0F766E' : '#4B5563',
                  fontWeight: consultationMode === 'video' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <Video size={18} />
                <span>e-Sanjeevani Video OPD</span>
              </button>
            </div>
          </div>

          {/* Facility Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hospital size={16} color="#2DD4BF" /> Target Healthcare Facility
            </label>
            <select
              className="form-select"
              value={selectedFacilityId}
              onChange={e => setSelectedFacilityId(e.target.value)}
              required
            >
              {facilities.map(f => (
                <option key={f.facility_id} value={f.facility_id}>
                  {f.facility_name} ({f.facility_type}) — {f.address}
                </option>
              ))}
            </select>

            {/* Selected Hospital Location & Verification Details */}
            {(() => {
              const cur = facilities.find(f => f.facility_id === parseInt(selectedFacilityId));
              if (!cur) return null;
              return (
                <div style={{
                  background: 'rgba(13, 148, 136, 0.08)',
                  border: '1px solid rgba(13, 148, 136, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1.1rem',
                  marginTop: '0.65rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.96rem' }}>
                      📍 {cur.facility_name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem', fontWeight: 700 }}>{cur.facility_type}</span>
                      {cur.emergency_available ? (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem', fontWeight: 700 }}>🚨 24x7 Emergency</span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {cur.address} &bull; <b>{cur.district || 'Maharashtra'}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.76rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '6px' }}>
                    <span style={{ color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> GPS: {cur.latitude?.toFixed(4)}° N, {cur.longitude?.toFixed(4)}° E
                    </span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: '#94A3B8' }}>Available Beds: <b style={{ color: '#38BDF8' }}>{cur.available_beds}</b> / {cur.total_beds}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${cur.latitude},${cur.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2DD4BF', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Navigation size={12} /> Google Maps &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Doctor Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Stethoscope size={16} color="#38BDF8" /> Consulting Doctor / Specialist
            </label>
            {doctors.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                No active doctors registered for this facility. Please select another facility.
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                required
              >
                {doctors.map(d => (
                  <option key={d.staff_id} value={d.staff_id}>
                    {d.name} — {d.specialization} ({d.availability_status} • {d.working_hours})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="#FBBF24" /> Appointment Date
              </label>
              <input
                type="date"
                className="form-input"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#34D399" /> Preferred Time Slot
              </label>
              <select
                className="form-select"
                value={appointmentTime}
                onChange={e => setAppointmentTime(e.target.value)}
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="#A78BFA" /> Reason for Visit / Medical Complaint
            </label>
            <textarea
              className="form-textarea"
              placeholder="Describe your symptoms or reason for visit (e.g. routine BP checkup, severe joint pain, fever review)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('facilities')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDoctorId}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Confirming with Hospital Registry...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
