import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Stethoscope, Calendar, ArrowRightLeft, FileText, CheckCircle2, 
  Clock, User, Sparkles, X, Plus, AlertCircle, Phone, Pill, Video 
} from 'lucide-react';

export function DoctorDashboard({ setActiveTab, onOpenTelemed }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Consultation Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultForm, setConsultForm] = useState({
    diagnosis_notes: '',
    prescription: '',
    symptoms: '',
    vitals: { bp: '120/80', pulse: '75 bpm', temp: '98.6 F', spo2: '98%' },
    status: 'Completed'
  });
  const [consultMsg, setConsultMsg] = useState(null);

  // Referral Modal
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralTargetPatient, setReferralTargetPatient] = useState(null);
  const [refForm, setRefForm] = useState({
    referring_facility_id: 1,
    referred_facility_id: 2,
    reason: '',
    priority: 'Urgent',
    clinical_summary: ''
  });

  const fetchDoctorData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/appointments/doctor/today', { headers }).then(r => r.json()),
      fetch('/api/referrals', { headers }).then(r => r.json())
    ])
      .then(([aptData, refData]) => {
        setAppointments(aptData.appointments || []);
        setReferrals(refData.referrals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load doctor dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctorData();
  }, [token]);

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      // 1. Add health record
      await fetch(`/api/patients/${selectedAppointment.patient_id}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          symptoms: consultForm.symptoms || selectedAppointment.reason,
          diagnosis_notes: consultForm.diagnosis_notes,
          prescription: consultForm.prescription,
          vitals: consultForm.vitals
        })
      });

      // 2. Update appointment status
      await fetch(`/api/appointments/${selectedAppointment.appointment_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Completed',
          doctor_notes: consultForm.diagnosis_notes
        })
      });

      setConsultMsg('Consultation completed and saved to patient permanent health record!');
      fetchDoctorData();
      setTimeout(() => {
        setSelectedAppointment(null);
        setConsultMsg(null);
      }, 1200);
    } catch (err) {
      alert('Error updating consultation: ' + err.message);
    }
  };

  const handleUpdateReferralStatus = async (referralId, newStatus) => {
    try {
      const res = await fetch(`/api/referrals/${referralId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDoctorData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDoctorReferral = async (e) => {
    e.preventDefault();
    if (!referralTargetPatient) return;

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...refForm,
          patient_id: referralTargetPatient.patient_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue referral');

      alert(`Referral #${data.referral.referral_id} generated successfully!`);
      setShowReferralModal(false);
      fetchDoctorData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Stethoscope size={14} /> MEDICAL OFFICER OPD CONSOLE
        </div>
        <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
          {user?.name || 'Dr. Rajesh Deshmukh'}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Khed Primary Health Centre (PHC) • OPD Consultation Desk & Inter-Facility Referrals
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Scheduled OPD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8', margin: '4px 0' }}>
            {appointments.filter(a => a.status === 'Scheduled').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Patients waiting</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Consultations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', margin: '4px 0' }}>
            {appointments.filter(a => a.status === 'Completed').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prescriptions issued</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Referrals Tracked</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24', margin: '4px 0' }}>
            {referrals.filter(r => r.status === 'Pending').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transferred to CHC/Hospital</div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments Queue + Referrals Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Today's Appointments Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={20} color="#38BDF8" /> OPD Consultations Queue
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live Patient List
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No appointments booked for today yet.</p>
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt.appointment_id} className="card" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                      {apt.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#38BDF8', fontWeight: 700 }}>
                      ⏰ {apt.appointment_time}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700 }}>
                    {apt.patient_name} ({apt.patient_age} yrs • {apt.patient_gender})
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Phone: {apt.patient_phone} • Blood Group: <b style={{ color: '#F87171' }}>{apt.blood_group || 'O+'}</b>
                  </div>

                  <div style={{ background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Chief Complaint / Reason:
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginTop: '2px' }}>
                      {apt.reason}
                    </p>
                    {apt.existing_conditions && (
                      <div style={{ fontSize: '0.75rem', color: '#FBBF24', marginTop: '4px' }}>
                        Medical History: {apt.existing_conditions}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {apt.status === 'Scheduled' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setConsultForm({
                              diagnosis_notes: '',
                              prescription: '',
                              symptoms: apt.reason,
                              vitals: { bp: '130/85', pulse: '76 bpm', temp: '98.6 F', spo2: '98%' },
                              status: 'Completed'
                            });
                            setConsultMsg(null);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <Stethoscope size={14} /> Conduct Consultation
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenTelemed) {
                              onOpenTelemed({
                                doctorName: user?.name || 'Dr. Rajesh Deshmukh',
                                specialty: 'General Medicine & Family Health',
                                facility: 'Govt PHC Khedgaon • Pune District Civil Hospital',
                                patientName: apt.patient_name
                              });
                            }
                          }}
                          className="btn btn-sm"
                          style={{
                            background: '#0D9488',
                            color: '#FFFFFF',
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                          title="Start encrypted live video consultation with patient"
                        >
                          <Video size={14} /> Video Call
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Consultation Completed
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setReferralTargetPatient(apt);
                        setShowReferralModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <ArrowRightLeft size={14} /> Refer to CHC
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referrals In/Out Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowRightLeft size={20} color="#FBBF24" /> Inter-Tier Referral Desk
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total: {referrals.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {referrals.map(ref => (
              <div key={ref.referral_id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                    {ref.priority} Priority
                  </span>
                  <span className={`badge ${ref.status === 'Completed' ? 'badge-success' : ref.status === 'Accepted' ? 'badge-info' : 'badge-neutral'}`}>
                    {ref.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', color: '#11322A', fontWeight: 700 }}>
                  {ref.patient_name} — {ref.reason}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Transfer: <b>{ref.referring_facility_name}</b> ➔ <b>{ref.referred_facility_name}</b>
                </div>

                {ref.clinical_summary && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--color-bg-primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                    "{ref.clinical_summary}"
                  </p>
                )}

                {/* Status action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                  {ref.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateReferralStatus(ref.referral_id, 'Accepted')}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Accept Patient Admission
                    </button>
                  )}
                  {ref.status === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateReferralStatus(ref.referral_id, 'Completed')}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Mark Treatment Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Clinical Consultation Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800 }}>Clinical Consultation</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient: <b>{selectedAppointment.patient_name}</b> ({selectedAppointment.patient_age} yrs, {selectedAppointment.patient_gender})
                </p>
              </div>
              <button onClick={() => setSelectedAppointment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {consultMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {consultMsg}
              </div>
            )}

            <form onSubmit={handleCompleteConsultation}>
              <div className="form-group">
                <label className="form-label">Clinical Diagnosis & Examination Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter your clinical diagnosis and examination findings..."
                  value={consultForm.diagnosis_notes}
                  onChange={e => setConsultForm({ ...consultForm, diagnosis_notes: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prescription (Medicines, Dosage & Diet Advice)</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Tab Amlodipine 5mg (1-0-0) x 30 days; Paracetamol 500mg SOS; Low salt diet..."
                  value={consultForm.prescription}
                  onChange={e => setConsultForm({ ...consultForm, prescription: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recorded BP</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    value={consultForm.vitals.bp}
                    onChange={e => setConsultForm({ ...consultForm, vitals: { ...consultForm.vitals, bp: e.target.value } })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SpO₂ (%)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    value={consultForm.vitals.spo2}
                    onChange={e => setConsultForm({ ...consultForm, vitals: { ...consultForm.vitals, spo2: e.target.value } })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temperature</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    value={consultForm.vitals.temp}
                    onChange={e => setConsultForm({ ...consultForm, vitals: { ...consultForm.vitals, temp: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  <CheckCircle2 size={18} /> Save & Complete Consultation
                </button>
                <button type="button" onClick={() => setSelectedAppointment(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Referral Modal from Doctor Desk */}
      {showReferralModal && referralTargetPatient && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Issue Specialist Referral</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient: {referralTargetPatient.patient_name || referralTargetPatient.name}
                </p>
              </div>
              <button onClick={() => setShowReferralModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateDoctorReferral}>
              <div className="form-group">
                <label className="form-label">Refer to Facility (Secondary / Tertiary Tier)</label>
                <select
                  className="form-select"
                  value={refForm.referred_facility_id}
                  onChange={e => setRefForm({ ...refForm, referred_facility_id: parseInt(e.target.value) })}
                >
                  <option value={2}>Manchar Community Health Centre (CHC) — Gynecology &amp; Diagnostics</option>
                  <option value={3}>Bhor Sub-District Government Hospital — ICU, Surgery &amp; Trauma</option>
                  <option value={6}>Saswad Rural CHC</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-select"
                  value={refForm.priority}
                  onChange={e => setRefForm({ ...refForm, priority: e.target.value })}
                >
                  <option value="Urgent">Urgent (Within 24 Hours)</option>
                  <option value="Emergency">Emergency (Immediate Ambulance Transfer)</option>
                  <option value="Routine">Routine (Elective Specialist Opinion)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Indication for Referral</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suspected Acute Coronary Syndrome requiring 2D Echo &amp; ICU..."
                  value={refForm.reason}
                  onChange={e => setRefForm({ ...refForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Transfer Summary</label>
                <textarea
                  className="form-textarea"
                  placeholder="Patient vital signs, preliminary labs, treatments initiated at PHC..."
                  value={refForm.clinical_summary}
                  onChange={e => setRefForm({ ...refForm, clinical_summary: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Dispatch Official Referral
                </button>
                <button type="button" onClick={() => setShowReferralModal(false)} className="btn btn-secondary">
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
