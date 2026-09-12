import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, Hospital, 
  ChevronRight, ArrowLeft, Activity, Thermometer, Heart, Droplets, Calendar, Stethoscope 
} from 'lucide-react';

export function AIScreening({ setActiveTab, setSelectedFacilityForBooking }) {
  const { user, token, selectedVillage } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Vitals & Basics, 2: Symptoms, 3: Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    age: user?.age || 35,
    gender: user?.gender || 'Male',
    temperature: '98.6',
    systolic_bp: '120',
    diastolic_bp: '80',
    spo2: '98',
    blood_sugar: '',
    existing_conditions: user?.existing_conditions || 'None',
    duration_days: 2,
    severity: 'Moderate',
    symptoms: []
  });

  const [screeningResult, setScreeningResult] = useState(null);

  const commonSymptoms = [
    'Fever / Chills',
    'Persistent Cough',
    'Shortness of Breath',
    'Chest Pain / Pressure',
    'Severe Headache',
    'Dizziness / Vertigo',
    'Loose Stools / Diarrhea',
    'Vomiting / Nausea',
    'Severe Abdominal Pain',
    'Body Ache / Joint Pain',
    'Left Arm Numbness',
    'Facial Weakness / Slurred Speech',
    'Excessive Thirst / Frequent Urination',
    'Pregnancy Pelvic Cramps / Spotting'
  ];

  const toggleSymptom = (sym) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(sym);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== sym) : [...prev.symptoms, sym]
      };
    });
  };

  const handleSubmitScreening = async () => {
    if (formData.symptoms.length === 0) {
      setError('Please select at least one symptom to proceed with screening.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/screenings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          symptoms: formData.symptoms,
          duration_days: parseInt(formData.duration_days) || 1,
          severity: formData.severity,
          vitals: {
            temperature: formData.temperature,
            systolic_bp: formData.systolic_bp,
            diastolic_bp: formData.diastolic_bp,
            spo2: formData.spo2,
            blood_sugar: formData.blood_sugar
          },
          existing_conditions: formData.existing_conditions,
          user_lat: selectedVillage?.latitude,
          user_lng: selectedVillage?.longitude
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Screening evaluation failed');

      setScreeningResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Emergency': return '#EF4444';
      case 'High': return '#F87171';
      case 'Moderate': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          <Sparkles size={16} /> AI CLINICAL TRIAGE & DECISION SUPPORT
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#FFFFFF', fontWeight: 800 }}>
          {t('ai_screening_title')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.4rem auto 0 auto' }}>
          Guided step-by-step health questionnaire with vital signs red-flag verification and automatic appropriate facility routing.
        </p>
      </div>

      {/* Mandatory Clinical Disclaimer Alert */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        <AlertTriangle size={22} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#FEF3C7', lineHeight: 1.5 }}>
          <b>{t('ai_disclaimer')}</b>
        </div>
      </div>

      {/* Wizard Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'var(--color-brand-500)' : 'var(--color-bg-card)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            1
          </div>
          <span style={{ fontSize: '0.85rem', color: step >= 1 ? '#FFFFFF' : 'var(--text-muted)' }}>Vitals & Baseline</span>
        </div>
        <div style={{ width: '40px', height: '2px', background: step >= 2 ? 'var(--color-brand-500)' : 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'var(--color-brand-500)' : 'var(--color-bg-card)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            2
          </div>
          <span style={{ fontSize: '0.85rem', color: step >= 2 ? '#FFFFFF' : 'var(--text-muted)' }}>Symptoms & Severity</span>
        </div>
        <div style={{ width: '40px', height: '2px', background: step >= 3 ? 'var(--color-brand-500)' : 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'var(--color-brand-500)' : 'var(--color-bg-card)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            3
          </div>
          <span style={{ fontSize: '0.85rem', color: step >= 3 ? '#FFFFFF' : 'var(--text-muted)' }}>Decision Support</span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      {/* STEP 1: Vitals & Baseline Details */}
      {step === 1 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={22} color="#2DD4BF" /> Step 1: Patient Vitals & Health Baseline
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Patient Age (Years)</label>
              <input
                type="number"
                className="form-input"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                min="1"
                max="120"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Body Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 98.6"
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Normal: 97.5 - 99.0 °F</span>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Oxygen SpO₂ (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 98"
                value={formData.spo2}
                onChange={e => setFormData({ ...formData, spo2: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Normal: 95 - 100% (Critical if &lt; 92%)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Pressure (Systolic / Diastolic)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Sys (120)"
                  value={formData.systolic_bp}
                  onChange={e => setFormData({ ...formData, systolic_bp: e.target.value })}
                />
                <span>/</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Dia (80)"
                  value={formData.diastolic_bp}
                  onChange={e => setFormData({ ...formData, diastolic_bp: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Glucose / Sugar (mg/dL) — Optional</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 110"
                value={formData.blood_sugar}
                onChange={e => setFormData({ ...formData, blood_sugar: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Normal Fasting: 70 - 110 mg/dL</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Existing Conditions / Chronic Illnesses (if any)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Hypertension, Diabetes, Asthma, Pregnancy Trimester 2..."
              value={formData.existing_conditions}
              onChange={e => setFormData({ ...formData, existing_conditions: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Continue to Symptoms <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Symptoms Selection */}
      {step === 2 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={22} color="#A78BFA" /> Step 2: Current Symptoms & Onset
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Tap all symptoms that you or the patient are currently experiencing:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {commonSymptoms.map(sym => {
              const selected = formData.symptoms.includes(sym);
              return (
                <div
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: selected ? 'rgba(13, 148, 136, 0.25)' : 'var(--color-bg-primary)',
                    border: selected ? '1px solid #2DD4BF' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: selected ? '#FFFFFF' : 'var(--text-secondary)', fontWeight: selected ? 600 : 400 }}>
                    {sym}
                  </span>
                  {selected && <CheckCircle2 size={18} color="#2DD4BF" />}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Symptom Duration (Days)</label>
              <input
                type="number"
                className="form-input"
                value={formData.duration_days}
                onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Perceived Severity</label>
              <select
                className="form-select"
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="Mild">Mild (Noticeable but does not restrict normal activities)</option>
                <option value="Moderate">Moderate (Interferes with daily routine)</option>
                <option value="Severe">Severe (Incapacitating, continuous pain/discomfort)</option>
                <option value="Critical">Critical (Sudden, extreme, or life-threatening)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <button
              type="button"
              onClick={handleSubmitScreening}
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Analyzing Clinical Indicators...' : 'Generate Decision Support'} <Sparkles size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Screening Results & Facility Routing */}
      {step === 3 && screeningResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Triage Result Card */}
          <div className="card" style={{
            padding: '2rem',
            border: `2px solid ${getRiskColor(screeningResult.screening_data.ai_risk_level)}`,
            background: 'linear-gradient(135deg, rgba(20, 30, 51, 0.95) 0%, rgba(10, 15, 29, 0.95) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge" style={{
                  background: `${getRiskColor(screeningResult.screening_data.ai_risk_level)}25`,
                  color: getRiskColor(screeningResult.screening_data.ai_risk_level),
                  border: `1px solid ${getRiskColor(screeningResult.screening_data.ai_risk_level)}60`,
                  fontSize: '0.82rem',
                  padding: '4px 10px',
                  marginBottom: '0.5rem'
                }}>
                  {screeningResult.screening_data.ai_risk_level} Risk Assessment
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', fontWeight: 800 }}>
                  Clinical Decision Support Summary
                </h2>
              </div>

              {/* Urgency Badge */}
              <div style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Action Urgency</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: getRiskColor(screeningResult.screening_data.ai_risk_level) }}>
                  {screeningResult.screening_data.urgency}
                </div>
              </div>
            </div>

            {/* Red Flags if any */}
            {screeningResult.screening_data.red_flags && screeningResult.screening_data.red_flags.length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <ShieldAlert size={18} /> Vital Sign / Clinical Red Flags Identified:
                </div>
                <ul style={{ paddingLeft: '1.5rem', color: '#FECACA', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {screeningResult.screening_data.red_flags.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Recommendation Text */}
            <div style={{ background: 'var(--color-bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '0.4rem' }}>
                {t('recommendation')}
              </div>
              <p style={{ fontSize: '0.96rem', color: '#FFFFFF', lineHeight: 1.6 }}>
                {screeningResult.screening_data.recommendation}
              </p>
            </div>

            {/* Possible Conditions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '0.5rem' }}>
                Possible Conditions (To be verified by Doctor)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {screeningResult.screening_data.possible_conditions.map((cond, idx) => (
                  <span key={idx} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
                    • {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Restart button */}
            <button
              onClick={() => { setStep(1); setScreeningResult(null); }}
              className="btn btn-secondary btn-sm"
            >
              Start New Screening
            </button>
          </div>

          {/* Prominent Action: Find Appropriate Healthcare Facility */}
          <div className="card" style={{ padding: '1.75rem', background: 'var(--color-bg-card)', border: '1px solid rgba(13, 148, 136, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Hospital size={22} color="#2DD4BF" /> Recommended Healthcare Facilities for this Case
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Auto-matched based on your location (<b>{selectedVillage?.village_name}</b>) and required clinical capabilities
                </p>
              </div>

              <button
                onClick={() => setActiveTab('facilities')}
                className="btn btn-primary"
              >
                {t('find_facility_btn')} <ChevronRight size={18} />
              </button>
            </div>

            {/* Matched Facilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {screeningResult.matched_facilities.map(fac => (
                <div
                  key={fac.facility_id}
                  style={{
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {fac.facility_type}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2DD4BF' }}>
                        {fac.distanceKm} km
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 700, margin: '4px 0' }}>
                      {fac.facility_name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {fac.address}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      <span>Beds: <b>{fac.available_beds}</b></span>
                      <span>•</span>
                      <span>Doctors: <b>{fac.doctors_available}</b></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (setSelectedFacilityForBooking) setSelectedFacilityForBooking(fac);
                      setActiveTab('book-appointment');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <Calendar size={14} /> Book Appointment
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
