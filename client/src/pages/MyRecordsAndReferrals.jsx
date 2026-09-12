import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, ArrowRightLeft, Calendar, Stethoscope, Hospital, 
  Activity, AlertCircle, CheckCircle2, Clock, ChevronRight 
} from 'lucide-react';

export function MyRecordsAndReferrals({ initialTab = 'records' }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'records' | 'referrals' | 'appointments'
  const [data, setData] = useState({
    patient: null,
    records: [],
    appointments: [],
    referrals: [],
    screenings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    // Fetch patient records using logged-in profile
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(authData => {
        const patientId = authData.user?.patient_id || 1;
        return fetch(`/api/patients/${patientId}/records`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(recordData => {
        setData(recordData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load health records:', err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
          {activeSubTab === 'referrals' ? t('tile_my_referrals') : t('tile_my_records')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Secure, linked digital health records, consultations, inter-tier referrals, and appointment schedules
        </p>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('records')}
          className={`btn btn-sm ${activeSubTab === 'records' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} /> Clinical Consultations ({data.records?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('referrals')}
          className={`btn btn-sm ${activeSubTab === 'referrals' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ArrowRightLeft size={16} /> Inter-Facility Referrals ({data.referrals?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('appointments')}
          className={`btn btn-sm ${activeSubTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={16} /> Scheduled Appointments ({data.appointments?.length || 0})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Retrieving health records...
        </div>
      ) : (
        <>
          {/* Patient Baseline Banner */}
          {data.patient && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'var(--color-bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Registered Patient Profile
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {data.patient.name} ({data.patient.age} yrs • {data.patient.gender})
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    📍 {data.patient.village_name} Village • Phone: {data.patient.phone}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--color-bg-elevated)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Blood Group</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F87171' }}>{data.patient.blood_group || 'O+'}</div>
                  </div>
                  <div style={{ background: 'var(--color-bg-elevated)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Allergies</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FBBF24' }}>{data.patient.allergies || 'None'}</div>
                  </div>
                  <div style={{ background: 'var(--color-bg-elevated)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conditions</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38BDF8' }}>{data.patient.existing_conditions || 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CLINICAL HEALTH RECORDS */}
          {activeSubTab === 'records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.records.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No past consultation records found.</p>
                </div>
              ) : (
                data.records.map(r => (
                  <div key={r.record_id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span className="badge badge-info" style={{ marginBottom: '0.3rem' }}>
                          {r.facility_type || 'PHC'}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700 }}>
                          {r.facility_name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Consulting Doctor: <b>{r.doctor_name || 'Medical Officer'}</b> ({r.specialization || 'General Medicine'})
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 600 }}>
                          📅 {r.visit_date ? r.visit_date.substring(0, 10) : 'Recent Visit'}
                        </span>
                      </div>
                    </div>

                    {/* Symptoms & Diagnosis */}
                    <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '0.75rem 0' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Reported Symptoms:
                        </span>
                        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '2px' }}>
                          {r.symptoms || 'General routine consultation'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Clinical Diagnosis & Doctor Advice:
                        </span>
                        <p style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 600, marginTop: '2px' }}>
                          {r.diagnosis_notes}
                        </p>
                      </div>
                    </div>

                    {/* Prescription */}
                    {r.prescription && (
                      <div style={{ borderLeft: '3px solid #2DD4BF', paddingLeft: '0.75rem', margin: '0.75rem 0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#2DD4BF', fontWeight: 700, textTransform: 'uppercase' }}>
                          Prescribed Medication & Dosage:
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#F8FAFC', marginTop: '2px' }}>
                          💊 {r.prescription}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: INTER-FACILITY REFERRALS */}
          {activeSubTab === 'referrals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.referrals.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <ArrowRightLeft size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No referrals issued for this patient.</p>
                </div>
              ) : (
                data.referrals.map(ref => {
                  const statusSteps = ['Pending', 'Accepted', 'Completed'];
                  const currentIndex = statusSteps.indexOf(ref.status);

                  return (
                    <div key={ref.referral_id} className="card" style={{ padding: '1.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge" style={{
                              background: ref.priority === 'Emergency' ? 'rgba(239, 68, 68, 0.2)' : ref.priority === 'Urgent' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: ref.priority === 'Emergency' ? '#F87171' : ref.priority === 'Urgent' ? '#FBBF24' : '#38BDF8',
                              border: '1px solid currentColor',
                              fontWeight: 700
                            }}>
                              {ref.priority} Priority Referral
                            </span>
                            <span className="badge badge-neutral">
                              Referral #{ref.referral_id}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, marginTop: '0.5rem' }}>
                            {ref.reason}
                          </h3>
                        </div>

                        <span className={`badge ${ref.status === 'Completed' ? 'badge-success' : ref.status === 'Accepted' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
                          Status: {ref.status}
                        </span>
                      </div>

                      {/* Source -> Destination Transfer Card */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '1rem',
                        alignItems: 'center',
                        background: 'var(--color-bg-primary)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem'
                      }}>
                        {/* Source Facility */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Referring Facility (Source)
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#CBD5E1', marginTop: '2px' }}>
                            {ref.referring_facility_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            By Dr. {ref.doctor_name}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2DD4BF' }}>
                          <ArrowRightLeft size={24} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Transfer</span>
                        </div>

                        {/* Destination Facility */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Referred Facility (Destination)
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2DD4BF', marginTop: '2px' }}>
                            {ref.referred_facility_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Specialist / Secondary Care
                          </div>
                        </div>
                      </div>

                      {/* Visual Referral Lifecycle Progress Bar */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Referral Progression Lifecycle:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '3px', background: 'var(--border-subtle)', transform: 'translateY(-50%)', zIndex: 1 }} />
                          
                          {statusSteps.map((stepName, i) => {
                            const isCompleted = i <= currentIndex;
                            const isCurrent = i === currentIndex;
                            return (
                              <div key={stepName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: isCompleted ? '#0D9488' : 'var(--color-bg-elevated)',
                                  color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                                  border: isCurrent ? '2px solid #2DD4BF' : '1px solid var(--border-strong)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  boxShadow: isCurrent ? '0 0 10px rgba(45, 212, 191, 0.5)' : 'none'
                                }}>
                                  {isCompleted ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: isCompleted ? '#FFFFFF' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 500, marginTop: '4px' }}>
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {ref.clinical_summary && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <b>Clinical Summary:</b> {ref.clinical_summary}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeSubTab === 'appointments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.appointments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Calendar size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No booked consultations found.</p>
                </div>
              ) : (
                data.appointments.map(apt => (
                  <div key={apt.appointment_id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                          {apt.status}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ticket #{apt.appointment_id}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700 }}>
                        {apt.facility_name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Doctor: <b>{apt.doctor_name}</b> ({apt.specialization})
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Reason: {apt.reason}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', background: 'var(--color-bg-primary)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Slot</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38BDF8' }}>
                        {apt.appointment_date}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34D399' }}>
                        {apt.appointment_time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
