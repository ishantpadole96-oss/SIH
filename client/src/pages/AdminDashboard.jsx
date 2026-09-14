import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveMap } from '../components/InteractiveMap';
import DiseaseRadarWidget from '../components/DiseaseRadarWidget';
import { 
  Building2, Users, Bed, Pill, AlertCircle, AlertTriangle, ArrowRightLeft, 
  Star, MapPin, CheckCircle2, ShieldAlert, Edit3, Send, RefreshCw, X, Flame, Plus, Phone
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'All', 'Pune', 'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg',
  'Nashik', 'Dhule', 'Nandurbar', 'Jalgaon', 'Ahmednagar',
  'Chhatrapati Sambhajinagar', 'Jalna', 'Parbhani', 'Hingoli', 'Nanded', 'Beed', 'Latur', 'Dharashiv',
  'Kolhapur', 'Solapur', 'Sangli', 'Satara',
  'Amravati', 'Akola', 'Yavatmal', 'Buldhana', 'Washim',
  'Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli'
];

const DISTRICT_COORDS = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Kolhapur: { lat: 16.7050, lng: 74.2433 },
  Solapur: { lat: 17.6599, lng: 75.9064 },
  Satara: { lat: 17.6805, lng: 73.9997 },
  Amravati: { lat: 20.9374, lng: 77.7796 },
  Nanded: { lat: 19.1383, lng: 77.3210 },
  Latur: { lat: 18.4088, lng: 76.5604 },
  Ahmednagar: { lat: 19.0952, lng: 74.7496 },
  Jalgaon: { lat: 21.0077, lng: 75.5626 },
  Chandrapur: { lat: 19.9615, lng: 79.2961 }
};

export function AdminDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  // District-wise Admin Control (Requirement 7)
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');

  // Default active tab is now GIS Map & Facilities (Bottlenecks removed per Requirement 8a)
  const [activeAdminTab, setActiveAdminTab] = useState('gis-map'); // 'gis-map' | 'quality' | 'grievances' | 'underserved' | 'surveillance' | 'medicines' | 'staff' | 'audit'
  
  const [overview, setOverview] = useState(null);
  const [gisData, setGisData] = useState({ villages: [], facilities: [] });
  const [qualityData, setQualityData] = useState(null);
  const [accessibilityData, setAccessibilityData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Master Spec: Medicine Requests & Audit Logs
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Add Hospital / Healthcare Facility Modal (Requirement 8b)
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [hospitalForm, setHospitalForm] = useState({
    facility_name: '',
    facility_type: 'Primary Health Centre (PHC)',
    district: 'Pune',
    village_name: 'Khedgaon',
    address: 'Near Gram Panchayat, Khedgaon',
    latitude: '18.8415',
    longitude: '73.9125',
    contact: '020-26127394',
    total_beds: 30,
    available_beds: 24,
    emergency_available: true,
    ambulance_phone: '108',
    operating_hours: '24/7',
    services: ['Emergency Care', 'OPD Services', 'Maternity & Delivery', 'Pharmacy', 'Diagnostic Lab']
  });
  const [hospitalSuccess, setHospitalSuccess] = useState(null);
  const [hospitalSubmitting, setHospitalSubmitting] = useState(false);

  // Staff Onboarding State
  const [staffTab, setStaffTab] = useState('doctor'); // 'doctor' | 'worker'
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'General Medicine',
    registration_number: '',
    facility_id: 1
  });
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    facility_id: 1,
    assigned_villages: 'Khedgaon, Nimgaon'
  });
  const [staffSuccess, setStaffSuccess] = useState(null);

  // Complaint resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('In Progress');
  const [adminResponse, setAdminResponse] = useState('');
  const [resolveSuccess, setResolveSuccess] = useState(null);

  const fetchAdminData = (districtOverride) => {
    setLoading(true);
    const dist = districtOverride !== undefined ? districtOverride : selectedDistrict;
    const distQuery = dist && dist !== 'All' ? `?district=${encodeURIComponent(dist)}` : '';
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/admin/analytics/overview${distQuery}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/analytics/gis-map${distQuery}`).then(r => r.json()),
      fetch(`/api/admin/analytics/quality${distQuery}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/analytics/accessibility${distQuery}`, { headers }).then(r => r.json()),
      fetch('/api/complaints', { headers }).then(r => r.json()),
      fetch('/api/medicines/requests', { headers }).then(r => r.json()).catch(() => ({ requests: [] })),
      fetch('/api/admin/audit-logs', { headers }).then(r => r.json()).catch(() => ({ logs: [] }))
    ])
      .then(([ov, gis, qual, acc, comp, medReqs, audits]) => {
        setOverview(ov.overview);
        setGisData(gis);
        setQualityData(qual);
        setAccessibilityData(acc);
        setComplaints(comp.complaints || []);
        setMedicineRequests(medReqs.requests || []);
        setAuditLogs(audits.logs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin analytics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminData(selectedDistrict);
  }, [token, selectedDistrict]);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    setHospitalSubmitting(true);
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...hospitalForm,
          total_beds: parseInt(hospitalForm.total_beds) || 20,
          available_beds: parseInt(hospitalForm.available_beds) || 15,
          latitude: parseFloat(hospitalForm.latitude),
          longitude: parseFloat(hospitalForm.longitude)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register facility');

      setHospitalSuccess(`Hospital "${data.facility?.facility_name}" registered & plotted at GPS coordinates (${hospitalForm.latitude}, ${hospitalForm.longitude})!`);
      if (data.facility) {
        setGisData(prev => ({
          ...prev,
          facilities: [data.facility, ...(prev.facilities || [])]
        }));
      }
      fetchAdminData(selectedDistrict);
      setTimeout(() => {
        setShowAddHospitalModal(false);
        setHospitalSuccess(null);
        setHospitalForm({
          facility_name: '',
          facility_type: 'Primary Health Centre (PHC)',
          district: selectedDistrict !== 'All' ? selectedDistrict : 'Pune',
          village_name: '',
          address: '',
          latitude: '18.8415',
          longitude: '73.9125',
          contact: '020-26127394',
          total_beds: 30,
          available_beds: 24,
          emergency_available: true,
          ambulance_phone: '108',
          operating_hours: '24/7',
          services: ['Emergency Care', 'OPD Services', 'Maternity & Delivery', 'Pharmacy', 'Diagnostic Lab']
        });
      }, 1500);
    } catch (err) {
      alert('Error registering hospital: ' + err.message);
    } finally {
      setHospitalSubmitting(false);
    }
  };

  const handleUpdateMedRequest = async (requestId, status) => {
    try {
      const res = await fetch(`/api/medicines/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          admin_notes: `Processed and marked as ${status} by District Administrative Officer.`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update requisition');
      alert(`Requisition #${requestId} updated to ${status}! Stock updated automatically.`);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(doctorForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create doctor account');
      setStaffSuccess(`Medical Officer ${doctorForm.name} onboarded! Credentials sent.`);
      setDoctorForm({ name: '', email: '', phone: '', specialty: 'General Medicine', registration_number: '', facility_id: 1 });
      setTimeout(() => setStaffSuccess(null), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff/worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create health worker account');
      setStaffSuccess(`Health Worker ${workerForm.name} onboarded! Assigned to Sub-Centre.`);
      setWorkerForm({ name: '', email: '', phone: '', facility_id: 1, assigned_villages: 'Khedgaon, Nimgaon' });
      setTimeout(() => setStaffSuccess(null), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

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
      fetchAdminData(selectedDistrict);
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
      
      {/* Top Header with District-wise Administration (Requirement 7) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Building2 size={14} /> MAHARASHTRA PUBLIC HEALTH ADMINISTRATION
          </div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            Rural Healthcare Monitoring &amp; GIS Command Console
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Supervised by <b>{user?.name || 'District Health Officer'}</b> • District Jurisdiction: <b>{selectedDistrict === 'All' ? 'All Maharashtra State' : `${selectedDistrict} District`}</b> ({gisData?.villages?.length || 0} Villages, {gisData?.facilities?.length || 0} Public Facilities)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--color-bg-card)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="#38BDF8" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const newDist = e.target.value;
                setSelectedDistrict(newDist);
                fetchAdminData(newDist);
              }}
              style={{
                background: 'var(--color-bg-primary)',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {MAHARASHTRA_DISTRICTS.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? '🏛️ All Maharashtra State' : `📍 ${d} District`}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => fetchAdminData(selectedDistrict)} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Telemetry
          </button>
        </div>
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

      {/* Admin Sub-Tabs (Bottlenecks removed per Requirement 8a) */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveAdminTab('gis-map')}
          className={`btn btn-sm ${activeAdminTab === 'gis-map' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <MapPin size={16} /> District Healthcare Facilities &amp; GIS Map
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
        <button
          onClick={() => setActiveAdminTab('medicines')}
          className={`btn btn-sm ${activeAdminTab === 'medicines' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Pill size={16} /> Medicine Requisitions ({medicineRequests.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveAdminTab('staff')}
          className={`btn btn-sm ${activeAdminTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} /> Staff Onboarding
        </button>
        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`btn btn-sm ${activeAdminTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShieldAlert size={16} /> Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Computing administrative datasets from database...
        </div>
      ) : (
        <>
          {/* TAB 1: RURAL HEALTHCARE GIS MAP & ADD HOSPITAL (Requirement 8b) */}
          {activeAdminTab === 'gis-map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={22} color="#2DD4BF" /> District Healthcare Facilities &amp; GIS Map
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Geo-spatial network of public health centres, hospitals, and rural accessibility in <b>{selectedDistrict === 'All' ? 'All Maharashtra State' : `${selectedDistrict} District`}</b> ({gisData?.facilities?.length || 0} Facilities, {gisData?.villages?.length || 0} Villages).
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setHospitalForm(prev => ({
                        ...prev,
                        district: selectedDistrict !== 'All' ? selectedDistrict : 'Pune',
                        latitude: DISTRICT_COORDS[selectedDistrict]?.lat ? String(DISTRICT_COORDS[selectedDistrict].lat) : '18.8415',
                        longitude: DISTRICT_COORDS[selectedDistrict]?.lng ? String(DISTRICT_COORDS[selectedDistrict].lng) : '73.9125'
                      }));
                      setShowAddHospitalModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Building2 size={16} /> ➕ Add Hospital / Health Facility
                  </button>
                </div>

                <div style={{ height: '540px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <InteractiveMap
                    villages={gisData.villages}
                    facilities={gisData.facilities}
                    height="100%"
                  />
                </div>
              </div>

              {/* District Hospitals Directory Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#11322A', fontWeight: 700 }}>
                    Hospitals &amp; Healthcare Centres in {selectedDistrict === 'All' ? 'Maharashtra' : `${selectedDistrict} District`} ({gisData?.facilities?.length || 0})
                  </h3>
                  <button
                    onClick={() => {
                      setHospitalForm(prev => ({
                        ...prev,
                        district: selectedDistrict !== 'All' ? selectedDistrict : 'Pune',
                        latitude: DISTRICT_COORDS[selectedDistrict]?.lat ? String(DISTRICT_COORDS[selectedDistrict].lat) : '18.8415',
                        longitude: DISTRICT_COORDS[selectedDistrict]?.lng ? String(DISTRICT_COORDS[selectedDistrict].lng) : '73.9125'
                      }));
                      setShowAddHospitalModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add New Facility
                  </button>
                </div>

                {gisData?.facilities?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No facilities recorded in this district yet. Click "Add Hospital" to add one.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Facility Name</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Type</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Location / Taluka</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Beds (Vacant / Total)</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>24/7 Emergency</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Contact / Ambulance</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>GPS Coordinates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gisData.facilities.map(f => (
                          <tr key={f.facility_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {f.facility_name}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{f.facility_type}</span>
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>
                              {f.village_name || f.address || 'District Centre'} ({f.district || selectedDistrict})
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              <span style={{ fontWeight: 700, color: f.available_beds > 0 ? '#34D399' : '#EF4444' }}>
                                {f.available_beds}
                              </span> / {f.total_beds}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              <span className={`badge ${f.emergency_available ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                                {f.emergency_available ? '🚨 24/7 Emergency' : 'Standard'}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              <a href={`tel:${f.contact || f.emergency_contact || '108'}`} style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>
                                📞 {f.contact || f.ambulance_phone || '108'}
                              </a>
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#2DD4BF' }}>
                              {f.latitude?.toFixed(4)}° N, {f.longitude?.toFixed(4)}° E
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

          {/* TAB: MEDICINE REQUISITION & DISPATCH DESK (Master Spec Sec 15 & 24) */}
          {activeAdminTab === 'medicines' && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={20} color="#2DD4BF" /> Central Medicine Requisitions &amp; Dispensary Replenishment Desk
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Review stock demands submitted by Health Workers, authorize bulk dispatches, and trigger immutable inventory transactions.
                  </p>
                </div>
                <span className="badge badge-info">{medicineRequests.length} Total Demands</span>
              </div>

              {medicineRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No medicine replenishment requests currently recorded in district system.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Req ID</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Facility / Requester</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Medicine Required</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Quantity</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Urgency</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Date</th>
                        <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineRequests.map(r => (
                        <tr key={r.request_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{r.request_id}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{r.facility_name || 'Sub-Centre Khed'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By: {r.requester_name || 'Health Worker'}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{r.medicine_name}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>{r.quantity_requested}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span className={`badge ${r.urgency === 'Emergency' ? 'badge-danger' : r.urgency === 'Urgent' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.72rem' }}>
                              {r.urgency}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span className={`badge ${r.status === 'Fulfilled' ? 'badge-success' : r.status === 'Approved' ? 'badge-info' : r.status === 'Rejected' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.72rem' }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.created_at}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              {r.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateMedRequest(r.request_id, 'Approved')}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMedRequest(r.request_id, 'Fulfilled')}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                    title="Dispatches stock and triggers atomic inventory transaction"
                                  >
                                    Fulfill Stock
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMedRequest(r.request_id, 'Rejected')}
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: '#F87171' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {r.status === 'Approved' && (
                                <button
                                  onClick={() => handleUpdateMedRequest(r.request_id, 'Fulfilled')}
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                >
                                  Complete Fulfillment
                                </button>
                              )}
                              {r.status === 'Fulfilled' && (
                                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>✓ Inventory Credited</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: STAFF ONBOARDING & CREDENTIALS ISSUANCE (Master Spec Sec 36) */}
          {activeAdminTab === 'staff' && (
            <div className="card" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="#38BDF8" /> Verified Healthcare Staff Onboarding
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Enforces administrative control (Master Spec Sec 0 &amp; 36): Only Authorized Administrators may create Doctor and Health Worker accounts.
                </p>
              </div>

              {staffSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  {staffSuccess}
                </div>
              )}

              {/* Toggle Staff Type */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--color-bg-primary)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => setStaffTab('doctor')}
                  className={`btn btn-sm ${staffTab === 'doctor' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Onboard Medical Officer (Doctor)
                </button>
                <button
                  type="button"
                  onClick={() => setStaffTab('worker')}
                  className={`btn btn-sm ${staffTab === 'worker' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Onboard Health Worker (ASHA / ANM)
                </button>
              </div>

              {staffTab === 'doctor' ? (
                <form onSubmit={handleCreateDoctor}>
                  <div className="form-group">
                    <label className="form-label">Full Doctor Name (with Title)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Rajesh Deshmukh"
                      value={doctorForm.name}
                      onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="doctor@phd.maharashtra.gov.in"
                        value={doctorForm.email}
                        onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="9876543210"
                        value={doctorForm.phone}
                        onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Clinical Specialty</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. General Medicine / Pediatrics"
                        value={doctorForm.specialty}
                        onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medical Council Reg. No. (MCI / MMC)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="MMC-2018-09874"
                        value={doctorForm.registration_number}
                        onChange={e => setDoctorForm({ ...doctorForm, registration_number: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Issue Verified Doctor Account &amp; Assign to Center
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateWorker}>
                  <div className="form-group">
                    <label className="form-label">Health Worker Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sunita Suresh Patil"
                      value={workerForm.name}
                      onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Official Email / ID</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="worker@ruralhealth.org"
                        value={workerForm.email}
                        onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="9876543210"
                        value={workerForm.phone}
                        onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Village Jurisdiction / Hamlet Scope</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Khedgaon, Nimgaon, Chakan Wadi"
                      value={workerForm.assigned_villages}
                      onChange={e => setWorkerForm({ ...workerForm, assigned_villages: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Issue Health Worker Account &amp; Map Scope
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB: CENTRAL SECURITY AUDIT LOG VIEWER (Master Spec Sec 27 & 35) */}
          {activeAdminTab === 'audit' && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} color="#34D399" /> Central Security &amp; Compliance Audit Ledger
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Immutable trace of all logins, record views, consent changes, prescription issuances, and administrative updates (DPDP Section 26 &amp; 35).
                  </p>
                </div>
                <span className="badge badge-success">{auditLogs.length} Events Recorded</span>
              </div>

              {auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No security audit events recorded yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>ID</th>
                        <th style={{ padding: '0.5rem' }}>Timestamp</th>
                        <th style={{ padding: '0.5rem' }}>Actor</th>
                        <th style={{ padding: '0.5rem' }}>Role</th>
                        <th style={{ padding: '0.5rem' }}>Action</th>
                        <th style={{ padding: '0.5rem' }}>Resource</th>
                        <th style={{ padding: '0.5rem' }}>Details</th>
                        <th style={{ padding: '0.5rem' }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.log_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{log.log_id}</td>
                          <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.timestamp}</td>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{log.actor_name || `User #${log.actor_id}`}</td>
                          <td style={{ padding: '0.6rem 0.5rem' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{log.actor_role}</span>
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem' }}>
                            <span className={`badge ${log.action.includes('unauthorized') || log.action.includes('fail') ? 'badge-danger' : log.action.includes('create') ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem' }}>{log.resource_type ? `${log.resource_type} #${log.resource_id}` : '—'}</td>
                          <td style={{ padding: '0.6rem 0.5rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                            {log.details || '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{log.ip_address || '127.0.0.1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      {/* Admin Add Hospital / Health Facility Modal (Requirement 8b) */}
      {showAddHospitalModal && (
        <div className="modal-overlay" onClick={() => setShowAddHospitalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={20} color="#0D9488" /> Add Hospital / Healthcare Facility
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Register a new government hospital or health center and plot it on the GIS interactive map
                </p>
              </div>
              <button onClick={() => setShowAddHospitalModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {hospitalSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {hospitalSuccess}
              </div>
            )}

            <form onSubmit={handleAddHospital}>
              <div className="form-group">
                <label className="form-label">Hospital / Healthcare Facility Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shirur Sub-District Hospital or Nimgaon PHC"
                  value={hospitalForm.facility_name}
                  onChange={e => setHospitalForm({ ...hospitalForm, facility_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Facility Tier / Type *</label>
                  <select
                    className="form-select"
                    value={hospitalForm.facility_type}
                    onChange={e => setHospitalForm({ ...hospitalForm, facility_type: e.target.value })}
                    required
                  >
                    <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                    <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                    <option value="Sub-District Hospital (SDH)">Sub-District Hospital (SDH)</option>
                    <option value="District Hospital (DH)">District Hospital (DH)</option>
                    <option value="Rural Hospital">Rural Hospital</option>
                    <option value="Sub-Centre">Sub-Centre (Health & Wellness)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">District *</label>
                  <select
                    className="form-select"
                    value={hospitalForm.district}
                    onChange={e => {
                      const dist = e.target.value;
                      const coords = DISTRICT_COORDS[dist] || { lat: 19.75, lng: 75.71 };
                      setHospitalForm({
                        ...hospitalForm,
                        district: dist,
                        latitude: String(coords.lat),
                        longitude: String(coords.lng)
                      });
                    }}
                    required
                  >
                    {MAHARASHTRA_DISTRICTS.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Village / Taluka Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shirur Rural, Khed, Baramati"
                    value={hospitalForm.village_name}
                    onChange={e => setHospitalForm({ ...hospitalForm, village_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact / Helpline Phone *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 020-26127394 or 9822012345"
                    value={hospitalForm.contact}
                    onChange={e => setHospitalForm({ ...hospitalForm, contact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Near Gram Panchayat Office, Main Road"
                  value={hospitalForm.address}
                  onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                />
              </div>

              {/* GPS Coordinates Section with Auto-Fill helper */}
              <div style={{ background: 'var(--color-bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8' }}>
                    📍 Map GPS Coordinates (Latitude &amp; Longitude) *
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const coords = DISTRICT_COORDS[hospitalForm.district] || { lat: 18.5204, lng: 73.8567 };
                      // Add slight randomized offset so multiple added hospitals don't overlap completely
                      const offsetLat = (Math.random() - 0.5) * 0.08;
                      const offsetLng = (Math.random() - 0.5) * 0.08;
                      setHospitalForm({
                        ...hospitalForm,
                        latitude: (coords.lat + offsetLat).toFixed(4),
                        longitude: (coords.lng + offsetLng).toFixed(4)
                      });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    📍 Set {hospitalForm.district} GPS
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem' }}>Latitude (Decimal)</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-input"
                      placeholder="18.5204"
                      value={hospitalForm.latitude}
                      onChange={e => setHospitalForm({ ...hospitalForm, latitude: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem' }}>Longitude (Decimal)</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-input"
                      placeholder="73.8567"
                      value={hospitalForm.longitude}
                      onChange={e => setHospitalForm({ ...hospitalForm, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Beds & Emergency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Beds *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={hospitalForm.total_beds}
                    onChange={e => setHospitalForm({ ...hospitalForm, total_beds: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Beds *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={hospitalForm.available_beds}
                    onChange={e => setHospitalForm({ ...hospitalForm, available_beds: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ambulance Hotline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="108"
                    value={hospitalForm.ambulance_phone}
                    onChange={e => setHospitalForm({ ...hospitalForm, ambulance_phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="emergency_avail"
                  checked={hospitalForm.emergency_available}
                  onChange={e => setHospitalForm({ ...hospitalForm, emergency_available: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#EF4444' }}
                />
                <label htmlFor="emergency_avail" style={{ fontSize: '0.85rem', color: '#11322A', fontWeight: 600, cursor: 'pointer' }}>
                  🚨 24/7 Emergency Care &amp; Casualty Available
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Available Healthcare Services</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.5rem' }}>
                  {[
                    'Emergency Care',
                    'OPD Services',
                    'Maternity & Delivery',
                    'Pediatrics',
                    'General Surgery',
                    'Diagnostic Lab',
                    'Pharmacy',
                    'Blood Storage',
                    'ICU / High Dependency'
                  ].map(serviceName => {
                    const isChecked = hospitalForm.services.includes(serviceName);
                    return (
                      <label key={serviceName} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#11322A', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setHospitalForm({ ...hospitalForm, services: [...hospitalForm.services, serviceName] });
                            } else {
                              setHospitalForm({ ...hospitalForm, services: hospitalForm.services.filter(s => s !== serviceName) });
                            }
                          }}
                          style={{ accentColor: '#0D9488' }}
                        />
                        {serviceName}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={hospitalSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {hospitalSubmitting ? 'Registering...' : 'Add Hospital & Plot on Map'}
                </button>
                <button type="button" onClick={() => setShowAddHospitalModal(false)} className="btn btn-secondary">
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
