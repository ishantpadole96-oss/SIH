import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Building2, Users, Bed, Pill, AlertCircle, ArrowRightLeft, 
  Star, MapPin, CheckCircle2, ShieldAlert, Edit3, Send, RefreshCw, X 
} from 'lucide-react';

export function AdminDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState('gis-map'); // 'gis-map' | 'quality' | 'grievances' | 'underserved'
  
  const [overview, setOverview] = useState(null);
  const [gisData, setGisData] = useState({ villages: [], facilities: [] });
  const [qualityData, setQualityData] = useState(null);
  const [accessibilityData, setAccessibilityData] = useState(null);
  const [complaints, setComplaints] = useState([]);
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
      fetch('/api/complaints', { headers }).then(r => r.json())
    ])
      .then(([ov, gis, qual, acc, comp]) => {
        setOverview(ov.overview);
        setGisData(gis);
        setQualityData(qual);
        setAccessibilityData(acc);
        setComplaints(comp.complaints || []);
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
            <Building2 size={14} /> DISTRICT HEALTH ADMINISTRATION
          </div>
          <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
            Rural Healthcare Monitoring &amp; GIS Command Console
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Supervised by <b>{user?.name || 'District Officer Sharma'}</b> • Pune Rural Division (8 Villages, 6 Facilities)
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Computing administrative datasets from database...
        </div>
      ) : (
        <>
          {/* TAB 1: RURAL HEALTHCARE GIS MAP */}
          {activeAdminTab === 'gis-map' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 700 }}>
                    Rural Healthcare Coverage &amp; Accessibility GIS
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Visual geo-spatial mapping of 8 villages color-coded by Accessibility Index (🟢 &gt;70, 🟡 45-70, 🔴 &lt;45) and 6 public healthcare facilities.
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
                      <h4 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700 }}>
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
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem' }}>
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
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#FFFFFF' }}>{v.village_name}</td>
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
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={18} color="#FBBF24" /> Facility Public Ratings Comparison
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.facilityRatings.map(fr => (
                    <div key={fr.facility_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>{fr.facility_name}</div>
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
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill size={18} color="#EC4899" /> Medicine Stockouts per Health Centre
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.shortagesByFacility.map((sf, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>{sf.facility_name}</div>
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
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRightLeft size={18} color="#34D399" /> Referral Delivery Performance
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {qualityData.referralRates.map((rr, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>{rr.facility_name}</span>
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
                  <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 700 }}>
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

                    <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700, margin: '2px 0' }}>
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
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Resolve Citizen Grievance</h3>
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
