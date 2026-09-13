import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Shield, CheckCircle2, AlertTriangle, ArrowRightLeft, 
  Clock, Stethoscope, Building2, Activity, Pill, User, FileText, ChevronRight, RefreshCw, Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function QRJourneyModal({ isOpen, onClose, initialJourneyId = 'MH-RURAL-2026-0001' }) {
  const { token, user } = useAuth();
  const { language } = useLanguage();

  const [searchId, setSearchId] = useState(initialJourneyId);
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consentGranted, setConsentGranted] = useState(true);
  const [activeTierView, setActiveTierView] = useState('all'); // 'all' | 'subcentre' | 'phc' | 'chc' | 'district'

  const quickSamples = [
    { id: 'MH-RURAL-2026-0001', name: 'Ramesh Patil (Cardiac Follow-up)' },
    { id: 'MH-RURAL-2026-0002', name: 'Sunita Jadhav (High-Risk Pregnancy)' },
    { id: 'MH-RURAL-2026-0003', name: 'Amit Shinde (Pediatric Dehydration)' }
  ];

  const fetchJourney = (idToFetch) => {
    const id = idToFetch || searchId;
    if (!id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/patients/journey/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setJourneyData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to retrieve patient health journey');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchJourney(initialJourneyId);
    }
  }, [isOpen, initialJourneyId]);

  if (!isOpen) return null;

  const patient = journeyData?.patient;
  const timeline = journeyData?.journey_timeline;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '940px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.2)', padding: '0.6rem', borderRadius: '12px', color: '#2DD4BF' }}>
              <QrCode size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Authorized Digital Health Journey
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Shield size={12} /> Role-Based Privacy Verified
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Seamless Cross-Tier Continuity: Sub-Centre ➔ PHC ➔ Rural Hospital ➔ District Hospital
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Quick Demo Pills */}
        <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="Scan QR or Enter Health Journey ID (e.g. MH-RURAL-2026-0001)"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => fetchJourney(searchId)}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Verify &amp; Load Journey</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print Summary
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Demos:</span>
            {quickSamples.map(sample => (
              <button
                key={sample.id}
                onClick={() => {
                  setSearchId(sample.id);
                  fetchJourney(sample.id);
                }}
                style={{
                  background: searchId === sample.id ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: searchId === sample.id ? '#2DD4BF' : 'var(--text-secondary)',
                  border: searchId === sample.id ? '1px solid #2DD4BF' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Retrieving authorized health journey records across government tiers...
          </div>
        ) : patient ? (
          <div>
            {/* Patient Baseline Identity Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '1.25rem',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '2px solid #2DD4BF',
                borderRadius: '12px',
                width: '64px',
                height: '64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2DD4BF'
              }}>
                <User size={28} />
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>VERIFIED</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {patient.name}
                  </h3>
                  <span style={{
                    fontFamily: 'monospace',
                    background: 'rgba(45, 212, 191, 0.2)',
                    color: '#2DD4BF',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    {patient.health_journey_id}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Age/Gender: <b>{patient.age} Y / {patient.gender}</b></span>
                  <span>Village: <b>{patient.village_name || 'Shivapur'}, {patient.district || 'Pune'}</b></span>
                  <span>Contact: <b>{patient.phone}</b></span>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid #EF4444' }}>
                    Blood: {patient.blood_group || 'O+'}
                  </span>
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: '1px solid #F59E0B' }}>
                    Allergies: {patient.allergies || 'None'}
                  </span>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid #38BDF8' }}>
                    Conditions: {patient.existing_conditions || 'None'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Emergency Care Contact</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {patient.emergency_contact_name || 'Relative'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#34D399' }}>
                  📞 {patient.emergency_contact_phone || '108'}
                </div>
              </div>
            </div>

            {/* 4-Tier Visual Continuum Pipeline */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', fontWeight: 700 }}>
                Four-Tier Public Healthcare Continuum
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '0.75rem'
              }}>
                {/* Tier 1: Sub-Centre */}
                <div style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>TIER 1 • VILLAGE</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Sub-Centre</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>ASHA Field Triage</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {timeline?.sub_centre?.length || 0} screenings recorded
                  </div>
                </div>

                {/* Tier 2: PHC */}
                <div style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700 }}>TIER 2 • PRIMARY</span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>PHC</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Doctor Consultations</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {timeline?.consultations?.length || 0} visits on record
                  </div>
                </div>

                {/* Tier 3: CHC */}
                <div style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#FBBF24', fontWeight: 700 }}>TIER 3 • SECONDARY</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>CHC / Rural Hosp</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Diagnostics &amp; Labs</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    USG, CBC &amp; X-Ray
                  </div>
                </div>

                {/* Tier 4: District Hospital */}
                <div style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 700 }}>TIER 4 • TERTIARY</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>District Hospital</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Specialist &amp; Inpatient</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {timeline?.referrals?.length || 0} smart referrals
                  </div>
                </div>
              </div>
            </div>

            {/* Active Smart Referrals Strip with 6-Stage Progression */}
            {timeline?.referrals?.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', fontWeight: 700 }}>
                  Active Smart Referral Progression
                </div>
                {timeline.referrals.map(ref => {
                  const stages = ['Created', 'Patient Reached', 'Consultation', 'Test', 'Treatment', 'Follow-up'];
                  const curIdx = stages.indexOf(ref.current_stage || 'Created');
                  const isStuck = ref.current_stage === 'Stuck - Follow-up Required';

                  return (
                    <div 
                      key={ref.referral_id} 
                      style={{
                        background: 'var(--color-bg-primary)',
                        border: isStuck ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge" style={{
                              background: ref.priority === 'Emergency' ? 'rgba(239, 68, 68, 0.2)' : ref.priority === 'Urgent' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: ref.priority === 'Emergency' ? '#F87171' : ref.priority === 'Urgent' ? '#FBBF24' : '#38BDF8',
                              border: '1px solid currentColor',
                              fontWeight: 700
                            }}>
                              {ref.priority} Priority
                            </span>
                            <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                              Token: {ref.queue_token || 'Q-DH-042'}
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.35rem' }}>
                            {ref.reason}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${isStuck ? 'badge-danger' : ref.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                            Stage: {ref.current_stage || 'Created'}
                          </span>
                        </div>
                      </div>

                      {/* Where to go + Details */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.85rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>From:</span>
                          <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{ref.referring_facility_name}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Destination Hospital:</span>
                          <div style={{ color: '#2DD4BF', fontWeight: 700 }}>{ref.referred_facility_name}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Specialist:</span>
                          <div style={{ color: '#FBBF24', fontWeight: 600 }}>{ref.specialist_required || 'Gynecology & Obstetrics'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Required Tests:</span>
                          <div style={{ color: '#38BDF8', fontWeight: 600 }}>{ref.required_tests || 'CBC, USG'}</div>
                        </div>
                      </div>

                      {/* 6-Stage Visual Stepper */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '5%',
                            right: '5%',
                            height: '2px',
                            background: 'var(--border-subtle)',
                            zIndex: 1
                          }} />

                          {stages.map((st, sIdx) => {
                            const isDone = curIdx >= sIdx;
                            const isCurrent = curIdx === sIdx && !isStuck;
                            return (
                              <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                                <div style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  background: isStuck ? '#EF4444' : isDone ? '#0D9488' : 'var(--color-bg-elevated)',
                                  color: '#FFFFFF',
                                  border: isCurrent ? '2px solid #2DD4BF' : '1px solid var(--border-strong)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}>
                                  {isDone ? '✓' : sIdx + 1}
                                </div>
                                <span style={{ fontSize: '0.68rem', color: isDone ? '#FFFFFF' : 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                                  {st}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {isStuck && (
                        <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#F87171' }}>
                          <b>⚠️ Referral not completed – follow-up required:</b> {ref.bottleneck_reason || 'Patient has not reported to destination hospital.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prescriptions & Diagnostics Traveling with Patient */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Prescriptions */}
              <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2DD4BF', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  <Pill size={16} /> Traveling Prescriptions &amp; Medications
                </div>
                {journeyData?.active_prescriptions?.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active medications on record.</p>
                ) : (
                  journeyData?.active_prescriptions?.map((pr, idx) => (
                    <div key={idx} style={{ borderLeft: '3px solid #2DD4BF', paddingLeft: '0.6rem', marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>{pr.prescription}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By {pr.doctor} • {pr.facility}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Consultation Diagnoses */}
              <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  <Stethoscope size={16} /> Clinical History &amp; Test Notes
                </div>
                {timeline?.consultations?.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No past clinical consultation visits.</p>
                ) : (
                  timeline?.consultations?.slice(0, 3).map(c => (
                    <div key={c.event_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFFFFF' }}>{c.diagnosis_notes}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {c.facility} ({c.tier}) • Dr. {c.doctor_name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : null}

        {/* Modal Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Health Journey
          </button>
        </div>

      </div>
    </div>
  );
}
