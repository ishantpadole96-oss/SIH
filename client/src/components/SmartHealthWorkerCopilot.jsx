import React, { useState } from 'react';
import { 
  X, Sparkles, AlertTriangle, Shield, CheckCircle2, Stethoscope, 
  ArrowRight, Globe, Flame, Baby, HeartPulse, Video, Send, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SmartHealthWorkerCopilot({ isOpen, onClose, onPrepopulateReferral, onOpenTelemed }) {
  const { token } = useAuth();
  const { language: currentLang } = useLanguage();

  const [copilotLang, setCopilotLang] = useState(currentLang || 'en'); // 'en' | 'hi' | 'mr'
  const [query, setQuery] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarioPresets = [
    { label: '🤰 High-Risk Pregnancy', text: 'Pregnant woman in 3rd trimester, BP 160/110, severe headache and blurred vision', sys: '160', dia: '110', spo2: '98', temp: '98.6' },
    { label: '💔 Acute Chest Pain', text: 'Male 52 yrs, heavy chest tightness radiating to left arm, cold sweating, breathless', sys: '145', dia: '95', spo2: '93', temp: '98.4' },
    { label: '👶 Pediatric Dehydration', text: 'Child 2 years, repeated watery diarrhea, vomiting, sunken eyes, lethargic', sys: '90', dia: '60', spo2: '97', temp: '101.5' },
    { label: '🦟 Severe High Fever', text: 'Adult with rigors, high fever 103F for 4 days, severe body ache, suspected malaria', sys: '110', dia: '75', spo2: '96', temp: '103.2' }
  ];

  const handleEvaluate = async (customQuery = null, customVitals = null) => {
    const q = customQuery !== null ? customQuery : query;
    if (!q && !systolic) return;

    setLoading(true);
    const vitalsObj = customVitals || {
      systolic_bp: systolic,
      diastolic_bp: diastolic,
      spo2: spo2,
      temperature: temperature
    };

    try {
      const res = await fetch('/api/copilot/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query: q,
          vitals: vitalsObj,
          language: copilotLang
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      setEvaluation(data);
    } catch (err) {
      // Offline fallback evaluation
      const text = q.toLowerCase();
      const isPregnantHighBP = text.includes('pregnant') || (parseFloat(vitalsObj.systolic_bp) >= 140);
      setEvaluation({
        triage_level: isPregnantHighBP ? 'High Risk' : 'Needs Doctor',
        color: isPregnantHighBP ? '#EF4444' : '#F59E0B',
        diagnosis: isPregnantHighBP ? 'Suspected High-Risk Gestational Hypertension / Preeclampsia (Offline Rules)' : 'Acute Clinical Symptoms Evaluated (Offline Rules)',
        specialist_required: isPregnantHighBP ? 'Gynecology & Obstetrics' : 'General Medicine',
        required_tests: isPregnantHighBP ? 'Urine Albumin, CBC, USG Obstetric' : 'Routine Hemogram, Blood Pressure',
        recommended_facility: isPregnantHighBP ? 'District Hospital' : 'Primary Health Centre (PHC)',
        actions: {
          en: [
            '🔴 Immediate medical evaluation recommended.',
            'Notify supervising Medical Officer.',
            'Prepare urgent smart referral to District Hospital.',
            'Maintain left lateral position and arrange emergency transport.'
          ],
          hi: [
            '🔴 तत्काल चिकित्सीय मूल्यांकन की सिफारिश की जाती है।',
            'पर्यवेक्षी चिकित्सा अधिकारी को तुरंत सूचित करें।',
            'जिला अस्पताल के लिए तत्काल स्मार्ट रेफरल तैयार करें।',
            'महिला को बाईं करवट लिटाएं और तुरंत वाहन प्रबंधित करें।'
          ],
          mr: [
            '🔴 तातडीने वैद्यकीय तपासणीची शिफारस केली जाते.',
            'वैद्यकीय अधिकाऱ्यांशी त्वरित संपर्क साधा.',
            'जिल्हा शासकीय रुग्णालयात तात्काळ रेफरल तयार करा.',
            'गरोदर मातेला डाव्या कुशीवर झोपवा आणि १०८ रुग्णवाहिका बोलवा.'
          ]
        },
        disclaimer: 'Offline Clinical Decision Support Protocol active.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (p) => {
    setQuery(p.text);
    setSystolic(p.sys);
    setDiastolic(p.dia);
    setSpo2(p.spo2);
    setTemperature(p.temp);
    handleEvaluate(p.text, {
      systolic_bp: p.sys,
      diastolic_bp: p.dia,
      spo2: p.spo2,
      temperature: p.temp
    });
  };

  if (!isOpen) return null;

  const currentActions = evaluation?.actions?.[copilotLang] || evaluation?.actions?.en || [];

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px', width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #0D9488 0%, #3B82F6 100%)', padding: '0.65rem', borderRadius: '12px', color: '#FFFFFF' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Smart Health Worker Copilot
                </h2>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  NHM / MoHFW Protocols
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Clinical Decision Support Assistant for ASHA, ANM &amp; Rural Medical Officers
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setCopilotLang('en')}
                style={{
                  background: copilotLang === 'en' ? '#0D9488' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                English
              </button>
              <button
                onClick={() => setCopilotLang('hi')}
                style={{
                  background: copilotLang === 'hi' ? '#0D9488' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setCopilotLang('mr')}
                style={{
                  background: copilotLang === 'mr' ? '#0D9488' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                मराठी
              </button>
            </div>

            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Clinical Scenarios */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
            Quick Rural Clinical Scenarios (1-Click Test):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {scenarioPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#CBD5E1',
                  borderRadius: '16px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs: Symptoms and Key Vitals */}
        <div style={{ background: 'var(--color-bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
            Enter Patient Symptoms or Presentation:
          </label>
          <textarea
            rows={2}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Pregnant woman, BP 160/110, severe headache, swelling in feet..."
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Systolic BP (mmHg)</label>
              <input
                type="number"
                value={systolic}
                onChange={e => setSystolic(e.target.value)}
                placeholder="120"
                style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={diastolic}
                onChange={e => setDiastolic(e.target.value)}
                placeholder="80"
                style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SpO₂ (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={e => setSpo2(e.target.value)}
                placeholder="98"
                style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                placeholder="98.6"
                style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleEvaluate()}
              disabled={loading || (!query && !systolic)}
            >
              <Sparkles size={14} className={loading ? 'animate-spin' : ''} />
              <span>Evaluate Clinical Protocol</span>
            </button>
          </div>
        </div>

        {/* Evaluation Decision Support Card */}
        {evaluation && (
          <div style={{
            background: 'var(--color-bg-primary)',
            border: `2px solid ${evaluation.color}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            {/* Triage Badge & Diagnosis */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: evaluation.color,
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {evaluation.triage_level === 'High Risk' ? '🔴 HIGH RISK' : evaluation.triage_level === 'Needs Doctor' ? '🟡 NEEDS DOCTOR' : '🟢 NORMAL'}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {evaluation.diagnosis}
                </span>
              </div>
            </div>

            {/* Step-by-Step Action Protocol */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                Approved Clinical Protocol Instructions ({copilotLang === 'en' ? 'English' : copilotLang === 'hi' ? 'हिन्दी' : 'मराठी'}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {currentActions.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#F1F5F9' }}>
                    <span style={{ color: evaluation.color, fontWeight: 700 }}>•</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Referral Pre-Fill Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.04)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Specialist Required:</span>
                <div style={{ color: '#FBBF24', fontWeight: 700 }}>{evaluation.specialist_required}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Required Diagnostic Tests:</span>
                <div style={{ color: '#38BDF8', fontWeight: 700 }}>{evaluation.required_tests}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Facility Tier:</span>
                <div style={{ color: '#34D399', fontWeight: 700 }}>{evaluation.recommended_facility}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {onOpenTelemed && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onOpenTelemed({
                      doctorName: 'On-Call Medical Officer',
                      specialty: evaluation.specialist_required,
                      facility: evaluation.recommended_facility
                    });
                    onClose();
                  }}
                >
                  <Video size={14} /> Teleconsultation
                </button>
              )}

              {onPrepopulateReferral && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onPrepopulateReferral({
                      reason: evaluation.diagnosis,
                      priority: evaluation.triage_level === 'High Risk' ? 'Urgent' : 'Routine',
                      specialist_required: evaluation.specialist_required,
                      required_tests: evaluation.required_tests,
                      clinical_summary: currentActions.join('; ')
                    });
                    onClose();
                  }}
                >
                  <FileText size={14} /> Create Smart Referral
                </button>
              )}
            </div>

            {/* Clinical Disclaimer */}
            <div style={{ marginTop: '0.85rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
              ⚖️ <b>Decision Support Notice:</b> {evaluation.disclaimer}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
