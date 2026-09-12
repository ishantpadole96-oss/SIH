import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, AlertTriangle, ArrowRightLeft, Calendar, UserPlus, 
  Activity, CheckCircle2, Phone, Stethoscope, ChevronRight, X, Heart 
} from 'lucide-react';

export function AshaDashboard({ setActiveTab }) {
  const { user, token, selectedVillage, villages } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [highRiskCases, setHighRiskCases] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Field Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    village_id: selectedVillage?.village_id || 1,
    blood_group: 'Unknown',
    allergies: 'None',
    existing_conditions: 'None',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [regSuccess, setRegSuccess] = useState(null);

  // Create Referral Modal
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [refPatient, setRefPatient] = useState(null);
  const [refForm, setRefForm] = useState({
    referring_facility_id: 1,
    referred_facility_id: 2,
    reason: '',
    priority: 'Urgent',
    clinical_summary: ''
  });

  const fetchData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/patients', { headers }).then(r => r.json()),
      fetch('/api/screenings/high-risk', { headers }).then(r => r.json()),
      fetch('/api/referrals', { headers }).then(r => r.json())
    ])
      .then(([patData, riskData, refData]) => {
        setPatients(patData.patients || []);
        setHighRiskCases(riskData.highRiskCases || []);
        setReferrals(refData.referrals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load ASHA data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setRegSuccess(`Patient ${data.patient.name} registered successfully! Profile linked.`);
      fetchData();
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(null);
      }, 1200);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!refPatient) return;

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...refForm,
          patient_id: refPatient.patient_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Referral creation failed');

      alert(`Referral #${data.referral.referral_id} created and dispatched!`);
      setShowReferralModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(13, 148, 136, 0.2)', color: '#2DD4BF', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Activity size={14} /> COMMUNITY HEALTH WORKER (ASHA / ANM)
          </div>
          <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
            ASHA Community Health Portal
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Serving <b>{user?.name || 'Sunita Bai'}</b> • Assigned Jurisdiction: <b>{selectedVillage?.village_name} & Khed Sub-Centre</b>
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn btn-primary"
        >
          <UserPlus size={18} /> Register Patient in Field
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Villagers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2DD4BF', margin: '4px 0' }}>
            {patients.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Under community supervision</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700 }}>Critical AI Screenings Flagged</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: '4px 0' }}>
            {highRiskCases.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent triage or home visit required</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Referrals Tracked</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24', margin: '4px 0' }}>
            {referrals.filter(r => r.status === 'Pending').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting secondary hospital admission</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Follow-ups</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', margin: '4px 0' }}>
            {referrals.filter(r => r.status === 'Completed').length + 2}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Treatment adherence confirmed</div>
        </div>
      </div>

      {/* Main Grid: High Risk Cases Queue + Patient Registry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* Urgent High-Risk Screening Cases */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={20} /> High-Risk AI Screening Triage Queue
            </h2>
            <span className="badge badge-danger">Immediate Action</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {highRiskCases.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={36} color="#34D399" style={{ margin: '0 auto 0.5rem auto' }} />
                <p>No critical screening cases flagged in your village today.</p>
              </div>
            ) : (
              highRiskCases.map(c => (
                <div
                  key={c.screening_id}
                  className="card"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge badge-danger">
                      {c.ai_risk_level} Risk
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.created_at ? c.created_at.substring(11, 16) : ''}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700, margin: '2px 0' }}>
                    {c.patient_name} ({c.patient_age} yrs • {c.patient_gender})
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    Village: <b>{c.village_name}</b> • Phone: <a href={`tel:${c.patient_phone}`} style={{ color: '#38BDF8', fontWeight: 600 }}>{c.patient_phone}</a>
                  </div>

                  <div style={{ background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reported Symptoms:
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#FECACA', fontWeight: 600, marginTop: '2px' }}>
                      {c.symptoms ? c.symptoms.join(', ') : 'Severe acute symptoms'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '4px' }}>
                      Vitals: Temp {c.vitals?.temp || c.vitals?.temperature || 'N/A'} • SpO₂ {c.vitals?.spo2 || 'N/A'}% • BP {c.vitals?.bp || `${c.vitals?.systolic_bp}/${c.vitals?.diastolic_bp}`}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                    {c.recommendation}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`tel:${c.patient_phone}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      <Phone size={14} /> Call Patient
                    </a>
                    <button
                      onClick={() => {
                        setRefPatient(c);
                        setShowReferralModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <ArrowRightLeft size={14} /> Create Referral
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Registered Patients List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={20} color="#2DD4BF" /> Registered Village Patients
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Total: {patients.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patients.map(p => (
              <div key={p.patient_id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {p.age} yrs • {p.gender} • Blood: <b style={{ color: '#F87171' }}>{p.blood_group}</b>
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Conditions: {p.existing_conditions || 'None reported'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setRefPatient(p);
                      setShowReferralModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                  >
                    Refer to CHC
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span>Appts: <b>{p.total_appointments || 0}</b></span>
                  <span>Screenings: <b>{p.total_screenings || 0}</b></span>
                  <span>Pending Referrals: <b style={{ color: p.pending_referrals > 0 ? '#FBBF24' : '#34D399' }}>{p.pending_referrals || 0}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Field Patient Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Register Villager in Field</h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {regSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {regSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterPatient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    value={regForm.age}
                    onChange={e => setRegForm({ ...regForm, age: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={regForm.gender}
                    onChange={e => setRegForm({ ...regForm, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Known Chronic Conditions (BP, Sugar, Asthma, Pregnancy)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hypertension 2 yrs, Pregnant 20 wks..."
                  value={regForm.existing_conditions}
                  onChange={e => setRegForm({ ...regForm, existing_conditions: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Patient Record
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Referral Modal */}
      {showReferralModal && refPatient && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Generate Inter-Facility Referral</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patient: {refPatient.name || refPatient.patient_name}</p>
              </div>
              <button onClick={() => setShowReferralModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateReferral}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Source Facility</label>
                  <select
                    className="form-select"
                    value={refForm.referring_facility_id}
                    onChange={e => setRefForm({ ...refForm, referring_facility_id: parseInt(e.target.value) })}
                  >
                    <option value={1}>Khed Primary Health Centre (PHC)</option>
                    <option value={4}>Shivapur Health Sub-Centre</option>
                    <option value={5}>Velhe Primary Health Centre (PHC)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Facility (Higher Care)</label>
                  <select
                    className="form-select"
                    value={refForm.referred_facility_id}
                    onChange={e => setRefForm({ ...refForm, referred_facility_id: parseInt(e.target.value) })}
                  >
                    <option value={2}>Manchar Community Health Centre (CHC)</option>
                    <option value={3}>Bhor Sub-District Government Hospital</option>
                    <option value={6}>Saswad Rural CHC</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-select"
                  value={refForm.priority}
                  onChange={e => setRefForm({ ...refForm, priority: e.target.value })}
                >
                  <option value="Routine">Routine (Within 3-5 days)</option>
                  <option value="Urgent">Urgent (Within 24 hours)</option>
                  <option value="Emergency">Emergency (Immediate transfer with ambulance)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Reason for Referral</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Needs ultrasound scan & gynecologist consultation..."
                  value={refForm.reason}
                  onChange={e => setRefForm({ ...refForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Summary & Vitals</label>
                <textarea
                  className="form-textarea"
                  placeholder="Vitals recorded, symptoms duration, medications already administered..."
                  value={refForm.clinical_summary}
                  onChange={e => setRefForm({ ...refForm, clinical_summary: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Issue Official Referral Ticket
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
