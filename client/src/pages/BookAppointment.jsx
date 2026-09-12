import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, Hospital, Stethoscope, CheckCircle2, User, FileText, ArrowRight } from 'lucide-react';

export function BookAppointment({ setActiveTab, preselectedFacility }) {
  const { user, token, selectedVillage } = useAuth();
  const { t } = useLanguage();

  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(preselectedFacility?.facility_id || '');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
