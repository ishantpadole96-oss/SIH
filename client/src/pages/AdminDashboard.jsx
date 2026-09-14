import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveMap } from '../components/InteractiveMap';
import DiseaseRadarWidget from '../components/DiseaseRadarWidget';
import { 
  Building2, Users, Bed, Pill, AlertCircle, AlertTriangle, ArrowRightLeft, 
  Star, MapPin, CheckCircle2, ShieldAlert, Edit3, Send, RefreshCw, X, Flame 
} from 'lucide-react';

export function AdminDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState('bottlenecks'); // 'bottlenecks' | 'gis-map' | 'quality' | 'grievances' | 'underserved'
  
  const [overview, setOverview] = useState(null);
  const [gisData, setGisData] = useState({ villages: [], facilities: [] });
  const [qualityData, setQualityData] = useState(null);
  const [accessibilityData, setAccessibilityData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [bottlenecksData, setBottlenecksData] = useState(null);
  const [interventionSuccess, setInterventionSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  // Complaint resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('In Progress');
  const [adminResponse, setAdminResponse] = useState('');
  const [resolveSuccess, setResolveSuccess] = useState(null);

  const fetchAdminData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/analytics/overview', { headers }).then(r => r.json()),
      fetch('/api/admin/analytics/gis-map').then(r => r.json()),
      fetch('/api/admin/analytics/quality', { headers }).then(r => r.json()),
      fetch('/api/admin/analytics/accessibility', { headers }).then(r => r.json()),
      fetch('/api/complaints', { headers }).then(r => r.json()),
      fetch('/api/admin/analytics/bottlenecks', { headers }).then(r => r.json())
    ])
      .then(([ov, gis, qual, acc, comp, btn]) => {
        setOverview(ov.overview);
        setGisData(gis);
        setQualityData(qual);
        setAccessibilityData(acc);
        setComplaints(comp.complaints || []);
        setBottlenecksData(btn);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin analytics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolvingComplaint) return;

    try {
      const res = await fetch(`/api/complaints/${resolvingComplaint.complaint_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: resolutionStatus,
          admin_response: adminResponse
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update grievance');

      setResolveSuccess('Grievance status updated and response notified to the citizen!');
      fetchAdminData();
      setTimeout(() => {
        setResolvingComplaint(null);
        setResolveSuccess(null);
      }, 1000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Building2 size={14} /> MAHARASHTRA PUBLIC HEALTH ADMINISTRATION
          </div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            Rural Healthcare Monitoring &amp; GIS Command Console
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Supervised by <b>{user?.name || 'Director of Public Health'}</b> • Maharashtra State Public Health Directorate ({gisData?.villages?.length || 137} Villages, {gisData?.facilities?.length || 95} Healthcare Facilities across 36 Districts)
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh Telemetry
        </button>
      </div>

      {/* High-Level Executive KPI Cards Strip */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Public Facilities Monitored</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8', margin: '3px 0' }}>
              {overview.total_facilities}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PHCs, CHCs &amp; Sub-Centres</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bed Occupancy &amp; Vacancy</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', margin: '3px 0' }}>
              {overview.beds.available} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {overview.beds.total} Vacant</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{overview.beds.occupancy_rate}% Occupancy rate</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', border: overview.medicine_shortages.out_of_stock > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700 }}>Medicine Shortage Alerts</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: '3px 0' }}>
              {overview.medicine_shortages.out_of_stock}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stockouts across dispensaries</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Citizen Grievances</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24', margin: '3px 0' }}>
              {overview.complaints.active_pending}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{overview.complaints.resolution_rate}% Resolution rate</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', border: overview.villages.underserved_count > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700 }}>Underserved Rural Pockets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: '3px 0' }}>
              {overview.villages.underserved_count} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {overview.villages.total}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accessibility Score &lt; 45</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Public Rating</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', margin: '3px 0' }}>
              ⭐ {overview.average_facility_rating}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on citizen reviews</div>
          </div>

        </div>
      )}

      {/* Admin Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveAdminTab('bottlenecks')}
          className={`btn btn-sm ${activeAdminTab === 'bottlenecks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 700 }}
        >
          <AlertTriangle size={16} color="#FBBF24" /> 🚨 Healthcare Bottlenecks ("Why Did This Patient Get Stuck?")
        </button>
        <button
          onClick={() => setActiveAdminTab('gis-map')}
          className={`btn btn-sm ${activeAdminTab === 'gis-map' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <MapPin size={16} /> Rural Healthcare GIS Map
        </button>
        <button
          onClick={() => setActiveAdminTab('underserved')}
          className={`btn btn-sm ${activeAdminTab === 'underserved' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertCircle size={16} /> Underserved Villages Matrix
        </button>
        <button
          onClick={() => setActiveAdminTab('quality')}
          className={`btn btn-sm ${activeAdminTab === 'quality' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Star size={16} /> Healthcare Quality &amp; Shortages
        </button>
        <button
          onClick={() => setActiveAdminTab('grievances')}
          className={`btn btn-sm ${activeAdminTab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShieldAlert size={16} /> Grievance Resolution Desk ({complaints.filter(c => c.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setActiveAdminTab('surveillance')}
          className={`btn btn-sm ${activeAdminTab === 'surveillance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Flame size={16} className="text-red-400" /> Disease Surveillance Radar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Computing administrative datasets from database...
        </div>
      ) : (
        <>
          {/* TAB: HEALTHCARE BOTTLENECK MAP & ROOT CAUSE DETECTION */}
          {activeAdminTab === 'bottlenecks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Header Title */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <AlertTriangle size={14} /> DISTRICT OPERATIONAL HEALTH INTELLIGENCE
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#11322A', fontWeight: 800 }}>
                  🚨 Healthcare Bottleneck Map &amp; Anomaly Detection
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Autonomous telemetry answering <b>“Why did this patient get stuck?”</b> — identifying referral delays, diagnostic machine breakdowns, medicine shortages, and missed high-risk follow-ups before health outcomes deteriorate.
                </p>
              </div>

              {interventionSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#34D399', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontWeight: 600 }}>
                  {interventionSuccess}
                </div>
              )}

              {/* 5 Problem Detected Key Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                {/* 1. Referral Pending */}
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F87171' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Referral Pending / Delays</span>
                    <span className="badge badge-danger">High Alert</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#EF4444', margin: '4px 0' }}>
                    {bottlenecksData?.summary?.referral_pending || 47}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Patients waiting for inter-tier hospital admission
                  </div>
                </div>

                {/* 2. Diagnostic Unavailable */}
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #FBBF24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Diagnostic Unavailable</span>
                    <span className="badge badge-warning">Equipment</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FBBF24', margin: '4px 0' }}>
                    {bottlenecksData?.summary?.diagnostic_unavailable || 23}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    USG, X-Ray &amp; lab tests delayed by machine downtime
                  </div>
                </div>

                {/* 3. Medicine Shortage */}
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #FB923C' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Medicine Shortage</span>
                    <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#FB923C' }}>Pharmacy</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F97316', margin: '4px 0' }}>
                    {bottlenecksData?.summary?.medicine_shortage || 18}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Essential medications currently out-of-stock
                  </div>
                </div>

                {/* 4. High-Risk Follow-up Missed */}
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #E11D48' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>High-Risk Follow-up Missed</span>
                    <span className="badge badge-danger">Dropout Alert</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F43F5E', margin: '4px 0' }}>
                    {bottlenecksData?.summary?.high_risk_followup_missed || 12}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Urgent patients who did not reach hospital (&gt;24 hrs)
                  </div>
                </div>

                {/* 5. Specialist Waiting */}
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #38BDF8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Specialist Waiting</span>
                    <span className="badge badge-info">Doctor Deficit</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38BDF8', margin: '4px 0' }}>
                    {bottlenecksData?.summary?.specialist_waiting || 31}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Awaiting Gynecologist / Cardiologist / Pediatrician
                  </div>
                </div>

              </div>

              {/* Health-System Anomaly Detection: "PHC-07 has unusually high referral delays" */}
              <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#FBBF24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={20} /> AI Health-System Anomaly Detection
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      Automated pattern recognition flagging systemic public healthcare bottlenecks across Maharashtra PHCs.
                    </p>
                  </div>
                  <span className="badge badge-warning">3 Anomalies Flagged Today</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
                  {bottlenecksData?.anomalies?.map((anom) => (
                    <div 
                      key={anom.id} 
                      style={{
                        background: 'var(--color-bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#2DD4BF', fontFamily: 'monospace', fontWeight: 800 }}>
                            {anom.facility_code} • {anom.district}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', color: '#11322A', fontWeight: 800, margin: '2px 0' }}>
                            {anom.facility_name}
                          </h4>
                        </div>
                        <span className={`badge ${anom.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                          {anom.severity}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', margin: '0.6rem 0', borderLeft: '3px solid #EF4444' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F87171' }}>
                          ⚠️ {anom.bottleneck_type}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#FECACA', marginTop: '2px' }}>
                          <b>{anom.avg_delay_hours} hrs average delay</b> ({anom.delay_ratio} vs {anom.district_benchmark_hours} hrs benchmark) • <b>{anom.stuck_patients_count} patients affected</b>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        <b>Root Cause:</b> {anom.root_cause}
                      </div>

                      <div style={{ background: 'rgba(45, 212, 191, 0.08)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#5EEAD4' }}>
                        💡 <b>System Recommendation:</b> {anom.ai_recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stuck Patient Registry: "Why Did This Patient Get Stuck?" */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 800 }}>
                      Stuck Patient Telemetry Registry
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Granular, patient-level delay tracking showing exactly which step caused the referral to stall.
                    </p>
                  </div>
                  <span className="badge badge-neutral">
                    {bottlenecksData?.stuckPatients?.length || 0} Cases Requiring Intervention
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Journey ID</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Patient</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Route (Source ➔ Dest)</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Priority &amp; Specialist</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Delay Hours</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Root Cause Bottleneck</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bottlenecksData?.stuckPatients?.map((p) => (
                        <tr key={p.referral_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#2DD4BF', fontWeight: 700 }}>
                            {p.health_journey_id || `MH-RURAL-2026-${String(p.referral_id).padStart(4, '0')}`}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{p.patient_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.patient_age} Y • {p.patient_gender} • {p.village_name}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ color: '#CBD5E1' }}>{p.referring_facility_name}</div>
                            <div style={{ color: '#2DD4BF', fontSize: '0.75rem' }}>➔ {p.referred_facility_name}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${p.priority === 'Emergency' ? 'badge-danger' : p.priority === 'Urgent' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                              {p.priority}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {p.specialist_required || 'Gynecology'}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 800, color: p.hours_stuck > 24 ? '#EF4444' : '#FBBF24' }}>
                            ⏱️ {p.hours_stuck} hrs
                          </td>
                          <td style={{ padding: '0.75rem', color: '#FECACA' }}>
                            <div style={{ maxWidth: '240px' }}>{p.bottleneck_reason}</div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setInterventionSuccess(`Administrative Action Dispatched for ${p.patient_name}: 108 Emergency Transit Alert sent & District Hospital Specialist OPD queue fast-tracked.`);
                                setTimeout(() => setInterventionSuccess(null), 4000);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                            >
                              Intervene &amp; Expedite
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: EPIDEMIOLOGICAL DISEASE SURVEILLANCE */}
          {activeAdminTab === 'surveillance' && (
            <DiseaseRadarWidget />
          )}

          {/* TAB 1: RURAL HEALTHCARE GIS MAP */}
          {activeAdminTab === 'gis-map' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 700 }}>
                    Rural Healthcare Coverage &amp; Accessibility GIS
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Visual geo-spatial mapping of {gisData?.villages?.length || 137} villages color-coded by Accessibility Index (🟢 &gt;70, 🟡 45-70, 🔴 &lt;45) and {gisData?.facilities?.length || 95} public healthcare facilities across all 36 districts of Maharashtra.
                  </p>
                </div>
              </div>

              <div style={{ height: '560px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <InteractiveMap
                  villages={gisData.villages}
                  facilities={gisData.facilities}
                  height="100%"
                />
              </div>
            </div>
          )}

          {/* TAB 2: UNDERSERVED VILLAGES MATRIX */}
          {activeAdminTab === 'underserved' && accessibilityData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#F87171', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} /> Critical Underserved Villages Requiring Emergency Resource Allocation
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  These villages exhibit low accessibility due to excessive distance from the nearest emergency hospital, doctor deficit, or absence of localized medicine stock.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                  {accessibilityData.underserved_villages.map(v => (
                    <div key={v.village_id} style={{ background: 'var(--color-bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className="badge badge-danger">🔴 Underserved</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>
                          Score: {v.score} / 100
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', color: '#11322A', fontWeight: 700 }}>
                        {v.village_name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                        Population: {v.population?.toLocaleString()} residents
                      </p>

                      <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.5, background: 'var(--color-bg-card)', padding: '0.6rem', borderRadius: '4px' }}>
                        <div>Nearest PHC: <b>{v.nearest_facility?.name}</b> ({v.nearest_facility?.distanceKm} km away)</div>
                        <div>Emergency Ambulance: <b style={{ color: v.nearest_emergency?.ambulance_available ? '#34D399' : '#F87171' }}>{v.nearest_emergency?.ambulance_available ? 'Available' : 'Unreliable / Delayed'}</b></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Villages Ranking Table */}
              <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700, marginBottom: '1rem' }}>
                  Complete Village Accessibility Score Rankings
                </h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Rank</th>
                      <th style={{ padding: '0.75rem' }}>Village</th>
                      <th style={{ padding: '0.75rem' }}>District</th>
                      <th style={{ padding: '0.75rem' }}>Population</th>
                      <th style={{ padding: '0.75rem' }}>Nearest PHC/CHC</th>
                      <th style={{ padding: '0.75rem' }}>Distance</th>
                      <th style={{ padding: '0.75rem' }}>Accessibility Score</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessibilityData.all_villages_ranking.map((v, idx) => (
                      <tr key={v.village_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#11322A' }}>{v.village_name}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{v.district}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{v.population?.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem', color: '#38BDF8' }}>{v.nearest_facility?.name}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{v.nearest_facility?.distanceKm} km</td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: v.score < 45 ? '#EF4444' : v.score < 70 ? '#F59E0B' : '#10B981' }}>
                          {v.score} / 100
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${v.score < 45 ? 'badge-danger' : v.score < 70 ? 'badge-warning' : 'badge-success'}`}>
                            {v.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUALITY & SHORTAGES MONITORING */}
          {activeAdminTab === 'quality' && qualityData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* Facility Ratings */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={18} color="#FBBF24" /> Facility Public Ratings Comparison
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.facilityRatings.map(fr => (
                    <div key={fr.facility_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#11322A', fontSize: '0.92rem' }}>{fr.facility_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fr.facility_type} • {fr.review_count} reviews</div>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBBF24' }}>
                        ⭐ {fr.avg_rating}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grievances by Nature */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} color="#EF4444" /> Citizen Complaints Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {qualityData.complaintsByType.map(ct => (
                    <div key={ct.complaint_type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ct.complaint_type}</span>
                      <span className="badge badge-warning">{ct.count} Reports</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicine Shortages */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill size={18} color="#EC4899" /> Medicine Stockouts per Health Centre
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.shortagesByFacility.map((sf, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#11322A', fontWeight: 600 }}>{sf.facility_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sf.facility_type}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {sf.out_of_stock > 0 && <span className="badge badge-danger">{sf.out_of_stock} Out of Stock</span>}
                        {sf.low_stock > 0 && <span className="badge badge-warning">{sf.low_stock} Low</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral Completion Rate */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#11322A', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRightLeft size={18} color="#34D399" /> Referral Delivery Performance
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.referralRates.map((rr, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#11322A' }}>{rr.facility_name}</span>
                        <span style={{ fontSize: '0.82rem', color: '#34D399', fontWeight: 700 }}>{rr.completed} Completed</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rr.total_referrals} Total Dispatched • {rr.pending} Pending
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: GRIEVANCE RESOLUTION DESK */}
          {activeAdminTab === 'grievances' && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 700 }}>
                    Citizen Grievance Resolution Desk
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Review complaints, take corrective administrative action, and notify citizens.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.map(comp => (
                  <div
                    key={comp.complaint_id}
                    style={{
                      background: 'var(--color-bg-primary)',
                      border: comp.status === 'Resolved' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <span className={`badge ${comp.status === 'Resolved' ? 'badge-success' : comp.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                          {comp.status}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          Ticket #{comp.complaint_id} • Filed by {comp.patient_name} ({comp.patient_phone})
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setResolvingComplaint(comp);
                          setResolutionStatus(comp.status === 'Submitted' ? 'In Progress' : 'Resolved');
                          setAdminResponse(comp.admin_response || '');
                          setResolveSuccess(null);
                        }}
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Edit3 size={13} /> Update Status &amp; Respond
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: '#11322A', fontWeight: 700, margin: '2px 0' }}>
                      {comp.complaint_type} at {comp.facility_name}
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#CBD5E1', margin: '0.5rem 0', background: 'var(--color-bg-elevated)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                      "{comp.description}"
                    </p>

                    {comp.admin_response && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid #10B981', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.84rem' }}>
                        <b>Official Response Logged:</b> {comp.admin_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

      {/* Admin Grievance Resolution Modal */}
      {resolvingComplaint && (
        <div className="modal-overlay" onClick={() => setResolvingComplaint(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Resolve Citizen Grievance</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ticket #{resolvingComplaint.complaint_id}: {resolvingComplaint.complaint_type}
                </p>
              </div>
              <button onClick={() => setResolvingComplaint(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {resolveSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {resolveSuccess}
              </div>
            )}

            <form onSubmit={handleResolveComplaint}>
              <div className="form-group">
                <label className="form-label">Lifecycle Status</label>
                <select
                  className="form-select"
                  value={resolutionStatus}
                  onChange={e => setResolutionStatus(e.target.value)}
                >
                  <option value="Submitted">Submitted (Under Initial Review)</option>
                  <option value="In Progress">In Progress (Action Initiated with BMO)</option>
                  <option value="Resolved">Resolved (Corrective Measures Implemented)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Government Response to Citizen</label>
                <textarea
                  className="form-textarea"
                  placeholder="State the administrative inquiry findings and actions taken (e.g. Additional doctor deployed, medicine stock replenished from district warehouse)..."
                  value={adminResponse}
                  onChange={e => setAdminResponse(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Official Resolution
                </button>
                <button type="button" onClick={() => setResolvingComplaint(null)} className="btn btn-secondary">
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
