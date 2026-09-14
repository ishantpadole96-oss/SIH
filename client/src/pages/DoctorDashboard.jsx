import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Stethoscope, Calendar, ArrowRightLeft, FileText, CheckCircle2, 
  Clock, User, Sparkles, X, Plus, AlertCircle, Phone, Pill, Video 
} from 'lucide-react';

export function DoctorDashboard({ setActiveTab, onOpenTelemed, onOpenCall }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeDoctorTab, setActiveDoctorTab] = useState('queue'); // 'queue' | 'telemed' | 'rx_builder' | 'lab_orders' | 'referrals'
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Diagnostic lab orders state
  const [labOrders, setLabOrders] = useState([
    { id: 1, patient_name: 'Sunita Patil', test: 'Complete Blood Count (CBC) & Hb', status: 'Completed', result: 'Hb: 9.8 g/dL (Mild Anemia)', time: '09:30 AM' },
    { id: 2, patient_name: 'Ramesh Jadhav', test: 'Fasting Blood Sugar & HbA1c', status: 'Sample Collected', result: 'Pending Lab Processing', time: '10:15 AM' },
    { id: 3, patient_name: 'Kavita Shinde', test: 'Chest X-Ray (PA View)', status: 'Report Ready', result: 'Clear lung fields, no infiltrates', time: '11:00 AM' }
  ]);
  const [newLabOrder, setNewLabOrder] = useState({ patient_id: 1, test_type: 'CBC', priority: 'Routine', notes: '' });

  // Digital Prescription Builder state
  const [rxForm, setRxForm] = useState({
    patient_name: 'Sunita Patil (28 yrs, Female)',
    diagnosis: 'Upper Respiratory Tract Infection & Mild Iron-Deficiency Anemia',
    medicines: [
      { name: 'Tab Paracetamol 500mg', dosage: '1 tablet', frequency: 'Three times daily (TDS) after food', duration: '3 days' },
      { name: 'Tab Iron & Folic Acid (IFA)', dosage: '1 tablet', frequency: 'Once daily (OD) after dinner', duration: '30 days' }
    ],
    diet_lifestyle: 'Drink warm fluids, high protein and green leafy vegetable diet, adequate rest.'
  });
  const [selectedMedToAdd, setSelectedMedToAdd] = useState('Tab Amoxicillin 500mg');
  const [medInputMode, setMedInputMode] = useState('type'); // 'type' | 'formulary'
  const [customMedName, setCustomMedName] = useState('');
  const [customDosage, setCustomDosage] = useState('1 tablet');
  const [customFrequency, setCustomFrequency] = useState('Twice daily (BD)');
  const [customDuration, setCustomDuration] = useState('5 days');
  const [rxGeneratedMsg, setRxGeneratedMsg] = useState(null);

  // Consultation Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [consentInfo, setConsentInfo] = useState(null);
  const [consentMsg, setConsentMsg] = useState(null);
  const [consultForm, setConsultForm] = useState({
    diagnosis_notes: '',
    prescription: '',
    symptoms: '',
    vitals: { bp: '120/80', pulse: '75 bpm', temp: '98.6 F', spo2: '98%' },
    status: 'Completed'
  });
  const [consultMsg, setConsultMsg] = useState(null);

  const openConsultation = (apt) => {
    setSelectedAppointment(apt);
    setConsultForm({
      diagnosis_notes: '',
      prescription: '',
      symptoms: apt.reason || '',
      vitals: { bp: '130/85', pulse: '76 bpm', temp: '98.6 F', spo2: '98%' },
      status: 'Completed'
    });
    setConsultMsg(null);
    setConsentMsg(null);

    // Fetch patient records with server-side consent scoping (Sec 11.1 & 25)
    fetch(`/api/patients/${apt.patient_id}/records`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPatientRecords(data.records || []);
        setConsentInfo({
          consent_required_for_full_history: data.consent_required_for_full_history,
          showing_count: data.showing_count,
          total_records: data.total_lifetime_records,
          notice: data.consent_notice
        });
      })
      .catch(err => console.error('Failed to load scoped records:', err));
  };

  const handleRequestConsent = async (patientId) => {
    try {
      const res = await fetch('/api/consent/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          scope: 'all_historical_records',
          purpose: 'Clinical evaluation during OPD consultation'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request consent');
      setConsentMsg('Consent request sent to patient mobile. Pending authorization.');
    } catch (err) {
      setConsentMsg('Error: ' + err.message);
    }
  };

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

  const [incomingCalls, setIncomingCalls] = useState([]);

  useEffect(() => {
    fetchDoctorData();
  }, [token]);

  // Poll for incoming video consultations for doctor
  useEffect(() => {
    let active = true;
    const pollCalls = async () => {
      try {
        const res = await fetch('/api/calls/incoming');
        const data = await res.json();
        if (active && data.incoming_calls) {
          setIncomingCalls(data.incoming_calls);
        }
      } catch (e) {}
    };
    pollCalls();
    const timer = setInterval(pollCalls, 2000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const handleDispatchPrescription = async () => {
    try {
      const matchedApt = appointments.find(a => `${a.patient_name} (${a.patient_age} yrs, ${a.patient_gender})` === rxForm.patient_name);
      const patientId = matchedApt ? matchedApt.patient_id : 1;

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          diagnosis: rxForm.diagnosis,
          diet_lifestyle: rxForm.diet_lifestyle,
          instructions: 'Take medications on time as prescribed. Return to PHC if fever or symptoms persist.',
          follow_up: 'Review at PHC OPD in 7 days',
          medicines: rxForm.medicines.map(m => ({
            medicine_name: m.name,
            strength: m.dosage || 'Standard dose',
            dose: m.dosage || '1 dose',
            frequency: m.frequency || 'Twice daily',
            duration: m.duration || '5 days',
            route: 'Oral',
            instructions: 'Take with warm water after meals'
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue prescription');

      setRxGeneratedMsg(`✅ Digital Prescription #${data.prescription?.prescription_id || 'Rx-NEW'} signed & delivered to Patient Portal & ABHA Health Locker!`);
      setTimeout(() => setRxGeneratedMsg(null), 5000);
      fetchDoctorData();
    } catch (err) {
      alert('Error issuing prescription: ' + err.message);
    }
  };

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

      // 2. Issue Immutable Versioned Prescription (Master Spec Sec 14)
      if (consultForm.prescription && consultForm.prescription.trim()) {
        try {
          await fetch('/api/prescriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              patient_id: selectedAppointment.patient_id,
              diagnosis: consultForm.diagnosis_notes,
              instructions: 'Take medications as instructed. Return if symptoms worsen.',
              follow_up_advice: 'Follow up in 7 days at primary health center.',
              items: [
                {
                  medicine_name: consultForm.prescription.slice(0, 80),
                  dose: '1 dose',
                  frequency: 'TDS (3 times daily)',
                  duration: '5 days'
                }
              ]
            })
          });
        } catch (rxErr) {
          console.error('Prescription generation error:', rxErr);
        }
      }

      // 3. Update appointment status
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

      setConsultMsg('Consultation completed, versioned prescription issued, and saved to patient permanent health record!');
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

      {/* Live Incoming Call Alert for Doctor */}
      {incomingCalls.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
          border: '2px solid #2DD4BF',
          borderRadius: '16px',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          color: '#FFFFFF',
          boxShadow: '0 10px 35px rgba(13, 148, 136, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#134E4A', color: '#5EEAD4', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Video size={13} /> LIVE INCOMING CALL ({incomingCalls.length})
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {incomingCalls[0].caller_name} is calling for Live Video Consultation
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CCFBF1' }}>
              Portal: {incomingCalls[0].caller_portal} • Status: Ringing now...
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                if (onOpenTelemed) {
                  onOpenTelemed({
                    doctorName: user?.name || 'Dr. Rajesh Deshmukh',
                    specialty: 'Medical Officer • General OPD',
                    facility: 'Govt PHC Khedgaon • Pune District Civil Hospital',
                    patientName: incomingCalls[0].caller_name,
                    callId: incomingCalls[0].call_id,
                    vitals: incomingCalls[0].vitals,
                    skipInitiate: true
                  });
                }
              }}
              className="btn btn-primary"
              style={{ background: '#2DD4BF', color: '#0F172A', fontWeight: 800, padding: '0.65rem 1.4rem' }}
            >
              <Video size={18} /> Answer Live Video Consultation
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
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

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Diagnostic Lab Orders</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818CF8', margin: '4px 0' }}>
            {labOrders.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CBC, Sugar, X-Ray</div>
        </div>
      </div>

      {/* Doctor OPD Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveDoctorTab('queue')}
          className={`btn btn-sm ${activeDoctorTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={15} /> OPD Patient Queue ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveDoctorTab('telemed')}
          className={`btn btn-sm ${activeDoctorTab === 'telemed' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ background: activeDoctorTab === 'telemed' ? '#0D9488' : undefined, color: activeDoctorTab === 'telemed' ? '#FFFFFF' : undefined }}
        >
          <Video size={15} /> Live Video Consult Chamber
        </button>
        <button
          type="button"
          onClick={() => setActiveDoctorTab('rx_builder')}
          className={`btn btn-sm ${activeDoctorTab === 'rx_builder' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Pill size={15} /> Digital Prescription Writer
        </button>
        <button
          type="button"
          onClick={() => setActiveDoctorTab('lab_orders')}
          className={`btn btn-sm ${activeDoctorTab === 'lab_orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={15} /> Diagnostic &amp; Lab Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveDoctorTab('referrals')}
          className={`btn btn-sm ${activeDoctorTab === 'referrals' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ArrowRightLeft size={15} /> Specialist Referrals Desk ({referrals.length})
        </button>
      </div>

      {/* VIEW 1: TELEMEDICINE CHAMBER */}
      {activeDoctorTab === 'telemed' && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: '#F0FDFA', border: '1px solid #99F6E4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#CCFBF1', color: '#0F766E', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <Video size={13} /> LIVE E-SANJEEVANI TELECONSULTATION DESK
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#11322A', fontWeight: 800 }}>Govt e-Sanjeevani Teleconsultation Room</h2>
              <p style={{ fontSize: '0.88rem', color: '#334155' }}>
                Conduct instant high-definition video consultations with rural patients and ASHA workers in the field.
              </p>
            </div>
            <button
              onClick={() => {
                if (onOpenTelemed) {
                  onOpenTelemed({
                    doctorName: user?.name || 'Dr. Rajesh Deshmukh',
                    specialty: 'Medical Officer • General OPD',
                    facility: 'Govt PHC Khedgaon • Pune District Civil Hospital',
                    patientName: appointments[0]?.patient_name || 'Waiting Patient'
                  });
                }
              }}
              className="btn btn-primary"
              style={{ background: '#0D9488', fontSize: '1rem', padding: '0.75rem 1.6rem' }}
            >
              <Video size={18} /> Launch Consultation Chamber Now
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {appointments.map((apt) => (
              <div key={apt.appointment_id} style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>{apt.patient_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Time: {apt.appointment_time} • {apt.patient_age} yrs • {apt.patient_gender}</div>
                  <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 600, marginTop: '2px' }}>Complaint: {apt.reason}</div>
                </div>
                <button
                  onClick={() => {
                    if (onOpenTelemed) {
                      onOpenTelemed({
                        doctorName: user?.name || 'Dr. Rajesh Deshmukh',
                        specialty: 'Medical Officer • General OPD',
                        facility: 'Govt PHC Khedgaon • Pune District Civil Hospital',
                        patientName: apt.patient_name
                      });
                    }
                  }}
                  className="btn btn-sm"
                  style={{ background: '#0D9488', color: '#FFFFFF', border: 'none' }}
                >
                  <Video size={14} /> Start Call
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: DIGITAL PRESCRIPTION WRITER */}
      {activeDoctorTab === 'rx_builder' && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#11322A', fontWeight: 800 }}>Digital Rx &amp; Jan Aushadhi Formulary</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Issue verified digital prescriptions mapped to government Jan Aushadhi essential drug stock.
              </p>
            </div>
            {rxGeneratedMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {rxGeneratedMsg}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div className="form-group">
                <label className="form-label">Patient Selection</label>
                <select
                  className="form-select"
                  value={rxForm.patient_name}
                  onChange={e => setRxForm({ ...rxForm, patient_name: e.target.value })}
                >
                  {appointments.map(a => (
                    <option key={a.appointment_id} value={`${a.patient_name} (${a.patient_age} yrs, ${a.patient_gender})`}>
                      {a.patient_name} ({a.patient_age} yrs, {a.patient_gender}) — {a.reason}
                    </option>
                  ))}
                  <option value="Sunita Patil (28 yrs, Female)">Sunita Patil (28 yrs, Female)</option>
                  <option value="Ramesh Jadhav (52 yrs, Male)">Ramesh Jadhav (52 yrs, Male)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  value={rxForm.diagnosis}
                  onChange={e => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                  placeholder="Clinical diagnosis..."
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Prescribe Medicine (Search, Select or Type Any Medicine)
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setMedInputMode('type')}
                      style={{
                        background: medInputMode === 'type' ? '#0D9488' : 'transparent',
                        color: medInputMode === 'type' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid #0D9488',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Type / Search Any Medicine
                    </button>
                    <button
                      type="button"
                      onClick={() => setMedInputMode('formulary')}
                      style={{
                        background: medInputMode === 'formulary' ? '#0D9488' : 'transparent',
                        color: medInputMode === 'formulary' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid #0D9488',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Pick Formulary
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {medInputMode === 'type' ? (
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        list="phc-formulary-datalist"
                        placeholder="Type any medicine name or search formulary (e.g. Tab Telmisartan 40mg, Inj Ceftriaxone 1g)..."
                        value={customMedName}
                        onChange={e => setCustomMedName(e.target.value)}
                      />
                      <datalist id="phc-formulary-datalist">
                        <option value="Tab Paracetamol 500mg" />
                        <option value="Tab Amoxicillin 500mg" />
                        <option value="Tab Metformin 500mg" />
                        <option value="Tab Amlodipine 5mg" />
                        <option value="Tab Telmisartan 40mg" />
                        <option value="Tab Atorvastatin 10mg" />
                        <option value="Tab Cetirizine 10mg" />
                        <option value="Tab Pantoprazole 40mg" />
                        <option value="Cap Omeprazole 20mg" />
                        <option value="Tab Azithromycin 500mg" />
                        <option value="Tab Ciprofloxacin 500mg" />
                        <option value="Tab Ibuprofen 400mg" />
                        <option value="Tab Iron & Folic Acid (IFA)" />
                        <option value="Oral Rehydration Salts (ORS)" />
                        <option value="Syrup Cough Relief 100ml" />
                        <option value="Syrup Paracetamol 120mg/5ml" />
                        <option value="Ointment Betamethasone 15g" />
                        <option value="Inj Dextrose 5% 500ml" />
                        <option value="Inj Normal Saline 0.9% 500ml" />
                      </datalist>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedMedToAdd}
                      onChange={e => {
                        setSelectedMedToAdd(e.target.value);
                        setCustomMedName(e.target.value);
                      }}
                    >
                      <option value="Tab Paracetamol 500mg">Tab Paracetamol 500mg (Antipyretic / Analgesic)</option>
                      <option value="Tab Amoxicillin 500mg">Tab Amoxicillin 500mg (Antibiotic)</option>
                      <option value="Tab Metformin 500mg">Tab Metformin 500mg (Anti-diabetic)</option>
                      <option value="Tab Amlodipine 5mg">Tab Amlodipine 5mg (Anti-hypertensive)</option>
                      <option value="Tab Telmisartan 40mg">Tab Telmisartan 40mg (Anti-hypertensive)</option>
                      <option value="Tab Cetirizine 10mg">Tab Cetirizine 10mg (Anti-allergic)</option>
                      <option value="Tab Iron & Folic Acid (IFA)">Tab Iron &amp; Folic Acid (IFA)</option>
                      <option value="Oral Rehydration Salts (ORS)">Oral Rehydration Salts (ORS sachet)</option>
                      <option value="Tab Azithromycin 500mg">Tab Azithromycin 500mg (Antibiotic)</option>
                      <option value="Cap Omeprazole 20mg">Cap Omeprazole 20mg (Antacid)</option>
                      <option value="Syrup Cough Relief 100ml">Syrup Cough Relief 100ml</option>
                    </select>
                  )}

                  {/* Dosage, Frequency, Duration, and Add Button */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dose / Strength</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem' }}
                        placeholder="1 tablet"
                        value={customDosage}
                        onChange={e => setCustomDosage(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Frequency</label>
                      <select
                        className="form-select"
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem' }}
                        value={customFrequency}
                        onChange={e => setCustomFrequency(e.target.value)}
                      >
                        <option value="Once daily (OD)">Once daily (OD)</option>
                        <option value="Twice daily (BD)">Twice daily (BD)</option>
                        <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                        <option value="Four times daily (QID)">Four times daily (QID)</option>
                        <option value="SOS / As needed">SOS / As needed</option>
                        <option value="At bedtime (HS)">At bedtime (HS)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Duration</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem' }}
                        placeholder="5 days"
                        value={customDuration}
                        onChange={e => setCustomDuration(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.45rem 0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          const medName = (medInputMode === 'type' ? customMedName : selectedMedToAdd || customMedName).trim();
                          if (!medName) {
                            alert('Please enter or select a medicine name first.');
                            return;
                          }
                          setRxForm({
                            ...rxForm,
                            medicines: [
                              ...rxForm.medicines,
                              { 
                                name: medName, 
                                dosage: customDosage || '1 unit', 
                                frequency: customFrequency || 'Twice daily (BD)', 
                                duration: customDuration || '5 days' 
                              }
                            ]
                          });
                          setCustomMedName('');
                        }}
                      >
                        <Plus size={14} /> Add to Rx
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dietary &amp; Lifestyle Advice</label>
                <textarea
                  className="form-textarea"
                  value={rxForm.diet_lifestyle}
                  onChange={e => setRxForm({ ...rxForm, diet_lifestyle: e.target.value })}
                  rows={2}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDispatchPrescription}
              >
                <CheckCircle2 size={16} /> Sign &amp; Dispatch Digital Prescription
              </button>
            </div>

            {/* Live Rx Preview Card */}
            <div style={{ background: '#FFFFFF', border: '2px solid #0D9488', borderRadius: '12px', padding: '1.5rem', color: '#11322A' }}>
              <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0D9488' }}>GOVT PRIMARY HEALTH CENTRE (PHC)</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Medical Council Reg: MMC-2018-09214 • Pune District</div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0D9488', fontFamily: 'serif' }}>℞</div>
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <div><b>Patient:</b> {rxForm.patient_name}</div>
                <div><b>Diagnosis:</b> {rxForm.diagnosis}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Prescribed Medicines:</div>
                {rxForm.medicines.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px dashed #E2E8F0', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{idx + 1}. {m.name}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.frequency} • {m.duration}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRxForm({ ...rxForm, medicines: rxForm.medicines.filter((_, i) => i !== idx) })}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', background: '#F8FAFC', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem' }}>
                <b>Advice:</b> {rxForm.diet_lifestyle}
              </div>

              <div style={{ textAlign: 'right', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                Digitally Signed by {user?.name || 'Dr. Rajesh Deshmukh (MBBS, DNB)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DIAGNOSTIC & LAB ORDERS */}
      {activeDoctorTab === 'lab_orders' && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#11322A', fontWeight: 800 }}>PHC Diagnostic &amp; Pathology Requisitions</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Order diagnostic tests, monitor sample processing, and access lab reports.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--color-bg-primary)', padding: '1.25rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#11322A' }}>New Lab Test Requisition</h3>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-select"
                  value={newLabOrder.patient_id}
                  onChange={e => setNewLabOrder({ ...newLabOrder, patient_id: parseInt(e.target.value) })}
                >
                  <option value={1}>Sunita Patil (28 yrs, Female)</option>
                  <option value={2}>Ramesh Jadhav (52 yrs, Male)</option>
                  <option value={3}>Kavita Shinde (34 yrs, Female)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnostic Test Required</label>
                <select
                  className="form-select"
                  value={newLabOrder.test_type}
                  onChange={e => setNewLabOrder({ ...newLabOrder, test_type: e.target.value })}
                >
                  <option value="Complete Blood Count (CBC) & Hb">Complete Blood Count (CBC) &amp; Hb</option>
                  <option value="Fasting & Post-Prandial Blood Sugar">Fasting &amp; Post-Prandial Blood Sugar</option>
                  <option value="HbA1c Glycated Hemoglobin">HbA1c Glycated Hemoglobin</option>
                  <option value="Rapid Malaria Antigen & Smear">Rapid Malaria Antigen &amp; Smear</option>
                  <option value="Urine Routine & Microscopic">Urine Routine &amp; Microscopic</option>
                  <option value="Serum Creatinine & Electrolytes">Serum Creatinine &amp; Electrolytes</option>
                  <option value="Chest X-Ray (PA View)">Chest X-Ray (PA View)</option>
                  <option value="12-Lead Electrocardiogram (ECG)">12-Lead Electrocardiogram (ECG)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={newLabOrder.priority}
                  onChange={e => setNewLabOrder({ ...newLabOrder, priority: e.target.value })}
                >
                  <option value="Routine">Routine (Today's Batch)</option>
                  <option value="Urgent">Urgent (Within 2 Hours)</option>
                  <option value="STAT">STAT / Emergency (Immediate)</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  const patName = newLabOrder.patient_id === 1 ? 'Sunita Patil' : newLabOrder.patient_id === 2 ? 'Ramesh Jadhav' : 'Kavita Shinde';
                  setLabOrders([
                    { id: Date.now(), patient_name: patName, test: newLabOrder.test_type, status: 'Requisition Sent', result: 'Sample Awaited', time: 'Just now' },
                    ...labOrders
                  ]);
                  alert(`Diagnostic test order for ${newLabOrder.test_type} sent to PHC Pathology Lab!`);
                }}
              >
                <Plus size={15} /> Submit Test Order
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#11322A' }}>Recent Diagnostic Requisitions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {labOrders.map(lo => (
                  <div key={lo.id} style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #818CF8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#11322A' }}>{lo.patient_name}</span>
                      <span className={`badge ${lo.status === 'Completed' || lo.status === 'Report Ready' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                        {lo.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>{lo.test}</div>
                    <div style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 600, marginTop: '4px' }}>Findings: {lo.result}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ordered: {lo.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Today's Appointments Queue + Referrals Queue */}
      {(activeDoctorTab === 'queue' || activeDoctorTab === 'referrals') && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Today's Appointments Queue */}
        <div style={{ display: activeDoctorTab === 'referrals' ? 'none' : 'block' }}>
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
                          onClick={() => openConsultation(apt)}
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
      )}

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

            {/* ABDM Consent & Privacy-First Scoping HUD (Master Spec Sec 11.2 & 25) */}
            <div style={{
              background: consentInfo?.consent_required_for_full_history ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${consentInfo?.consent_required_for_full_history ? '#F59E0B' : '#10B981'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: consentInfo?.consent_required_for_full_history ? '#F59E0B' : '#34D399' }}>
                    {consentInfo?.consent_required_for_full_history ? '🔒 Data Scope: Initial Encounter Only' : '✓ Full Medical History Authorized'}
                  </span>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {consentInfo?.notice || 'Showing active checkup and latest encounters.'}
                  </p>
                </div>
                {consentInfo?.consent_required_for_full_history && (
                  <button
                    type="button"
                    onClick={() => handleRequestConsent(selectedAppointment.patient_id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                  >
                    Request Consent for Full History
                  </button>
                )}
              </div>
              {consentMsg && (
                <div style={{ marginTop: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: 600 }}>
                  ℹ️ {consentMsg}
                </div>
              )}
            </div>

            {/* Recent Scoped Records Preview */}
            {patientRecords.length > 0 && (
              <div style={{ marginBottom: '1rem', background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  RECENT CLINICAL ENCOUNTERS ({patientRecords.length}):
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {patientRecords.map((rec, idx) => (
                    <div key={idx} style={{ fontSize: '0.76rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
                      <span style={{ color: '#38BDF8', fontWeight: 600 }}>{rec.record_date}:</span> {rec.diagnosis || rec.symptoms} {rec.prescription ? `| Rx: ${rec.prescription}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
