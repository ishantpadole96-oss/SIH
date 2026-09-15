import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Building2, Users, Bed, Pill, AlertTriangle, ArrowRightLeft, 
  MapPin, CheckCircle2, ShieldAlert, Edit3, RefreshCw, X, Plus, Phone, Stethoscope, Activity, Search, Filter
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg',
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

  // District-wise Admin Control (Requirement 2 & 7)
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');

  // Purposeful Tabs: GIS Map, Doctors & Village Assignments, ASHA Workers, Medicine Inventory, Grievances
  const [activeAdminTab, setActiveAdminTab] = useState('gis-map'); // 'gis-map' | 'doctors' | 'asha-workers' | 'medicine-inventory' | 'grievances'
  
  const [overview, setOverview] = useState(null);
  const [gisData, setGisData] = useState({ villages: [], facilities: [] });
  const [districtStaff, setDistrictStaff] = useState({ doctors: [], asha_workers: [], villages: [], facilities: [] });
  const [districtInventory, setDistrictInventory] = useState({ kpis: {}, medicines: [], transactions: [] });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Appoint Doctor Modal (Requirement 3)
  const [showAppointDoctorModal, setShowAppointDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General Medicine',
    facility_id: 1,
    assigned_villages: [],
    custom_village_input: '',
    working_days: 'Mon-Sat',
    working_hours: '09:00 AM - 05:00 PM'
  });
  const [doctorSuccess, setDoctorSuccess] = useState(null);
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);

  // Onboard ASHA Worker Modal (Requirement 2)
  const [showOnboardAshaModal, setShowOnboardAshaModal] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    village_id: 1,
    assigned_villages: 'Shivapur, Khedgaon Sub-Centre'
  });
  const [workerSuccess, setWorkerSuccess] = useState(null);
  const [workerSubmitting, setWorkerSubmitting] = useState(false);

  // District Inventory Filters (Requirement 7)
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFacilityFilter, setInventoryFacilityFilter] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('All');

  // Complaint resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('Resolved');
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
      fetch(`/api/admin/district-staff${distQuery}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/district-inventory${distQuery}`, { headers }).then(r => r.json()),
      fetch('/api/complaints', { headers }).then(r => r.json())
    ])
      .then(([ov, gis, staff, inv, comp]) => {
        setOverview(ov.overview || null);
        setGisData(gis || { villages: [], facilities: [] });
        setDistrictStaff(staff || { doctors: [], asha_workers: [], villages: [], facilities: [] });
        setDistrictInventory(inv || { kpis: {}, medicines: [], transactions: [] });
        setComplaints(comp.complaints || []);
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
      fetchAdminData(selectedDistrict);
      setTimeout(() => {
        setShowAddHospitalModal(false);
        setHospitalSuccess(null);
        setHospitalForm({
          facility_name: '',
          facility_type: 'Primary Health Centre (PHC)',
          district: selectedDistrict,
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
      }, 1400);
    } catch (err) {
      alert('Error registering hospital: ' + err.message);
    } finally {
      setHospitalSubmitting(false);
    }
  };

  const handleAppointDoctor = async (e) => {
    e.preventDefault();
    setDoctorSubmitting(true);
    try {
      let finalAssigned = [...doctorForm.assigned_villages];
      if (doctorForm.custom_village_input.trim()) {
        finalAssigned.push(doctorForm.custom_village_input.trim());
      }
      const assignedStr = finalAssigned.join(', ') || 'District Headquarters';

      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...doctorForm,
          assigned_villages: assignedStr
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to appoint doctor');

      setDoctorSuccess(data.message || `Dr. ${doctorForm.name} appointed successfully!`);
      fetchAdminData(selectedDistrict);
      setTimeout(() => {
        setShowAppointDoctorModal(false);
        setDoctorSuccess(null);
        setDoctorForm({
          name: '',
          email: '',
          phone: '',
          specialization: 'General Medicine',
          facility_id: districtStaff?.facilities?.[0]?.facility_id || 1,
          assigned_villages: [],
          custom_village_input: '',
          working_days: 'Mon-Sat',
          working_hours: '09:00 AM - 05:00 PM'
        });
      }, 1400);
    } catch (err) {
      alert('Error appointing doctor: ' + err.message);
    } finally {
      setDoctorSubmitting(false);
    }
  };

  const handleOnboardWorker = async (e) => {
    e.preventDefault();
    setWorkerSubmitting(true);
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
      if (!res.ok) throw new Error(data.error || 'Failed to onboard health worker');

      setWorkerSuccess(data.message || `Health Worker ${workerForm.name} onboarded!`);
      fetchAdminData(selectedDistrict);
      setTimeout(() => {
        setShowOnboardAshaModal(false);
        setWorkerSuccess(null);
        setWorkerForm({
          name: '',
          email: '',
          phone: '',
          village_id: districtStaff.villages[0]?.village_id || 1,
          assigned_villages: ''
        });
      }, 1400);
    } catch (err) {
      alert('Error onboarding health worker: ' + err.message);
    } finally {
      setWorkerSubmitting(false);
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
          admin_response: adminResponse || 'Reviewed and resolved by District Public Health Authority.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update grievance');

      setResolveSuccess('Grievance status updated and resolution notified to the patient / ASHA worker!');
      fetchAdminData(selectedDistrict);
      setTimeout(() => {
        setResolvingComplaint(null);
        setResolveSuccess(null);
        setAdminResponse('');
      }, 1000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered Inventory List
  const filteredMedicines = (districtInventory.medicines || []).filter(m => {
    const matchesSearch = !inventorySearch || 
      m.medicine_name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(inventorySearch.toLowerCase())) ||
      (m.facility_name && m.facility_name.toLowerCase().includes(inventorySearch.toLowerCase()));
    const matchesFacility = !inventoryFacilityFilter || String(m.facility_id) === String(inventoryFacilityFilter);
    const matchesStatus = inventoryStatusFilter === 'All' || m.stock_status === inventoryStatusFilter;
    return matchesSearch && matchesFacility && matchesStatus;
  });

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Top Header with District Jurisdiction Controls (Requirement 2 & 7) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(13, 148, 136, 0.15)', color: '#0D9488', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Building2 size={14} /> DISTRICT HEALTH ADMINISTRATION CONSOLE
          </div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            {selectedDistrict} District Healthcare Console
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Supervised by <b>{user?.name || 'District Health Officer'}</b> &bull; Managing Healthcare Facilities, Staff Appointments &amp; Drug Inventory for <b>{selectedDistrict} District</b>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="#0D9488" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Appointed District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const newDist = e.target.value;
                setSelectedDistrict(newDist);
                fetchAdminData(newDist);
              }}
              style={{
                background: 'transparent',
                color: '#11322A',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {MAHARASHTRA_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist} District</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchAdminData(selectedDistrict)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '38px' }}
            title="Refresh district data"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* 6 Essential, Purposeful District KPIs */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Public Facilities Monitored</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D9488', margin: '3px 0' }}>
              {overview.total_facilities ?? overview.facilities?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hospitals, PHCs &amp; Sub-Centres</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bed Availability &amp; Occupancy</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', margin: '3px 0' }}>
              {overview.beds?.available ?? 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {overview.beds?.total ?? 0} Vacant</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{overview.beds?.occupancy_rate ?? 0}% Occupancy Rate</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Appointed Doctors</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284C7', margin: '3px 0' }}>
              {districtStaff.doctors?.length ?? overview.doctors?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stationed in {selectedDistrict}</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASHA &amp; Health Workers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6', margin: '3px 0' }}>
              {districtStaff.asha_workers?.length || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active in village jurisdictions</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', border: ((districtInventory.kpis?.low_stock_count || 0) > 0 || (districtInventory.kpis?.out_of_stock_count || 0) > 0) ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700 }}>Medicine Shortage Alerts</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: '3px 0' }}>
              {districtInventory.kpis?.out_of_stock_count || 0} <span style={{ fontSize: '0.85rem', color: '#F59E0B' }}>+ {districtInventory.kpis?.low_stock_count || 0} Low</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across PHCs &amp; Sub-Centres</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Citizen Grievances</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', margin: '3px 0' }}>
              {(complaints || []).filter(c => c.status !== 'Resolved').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending administrative resolution</div>
          </div>

        </div>
      )}

      {/* 5 Clear, Purposeful Healthcare Administration Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveAdminTab('gis-map')}
          className={`btn btn-sm ${activeAdminTab === 'gis-map' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <MapPin size={16} /> District Healthcare Facilities &amp; GIS Map ({gisData?.facilities?.length || 0})
        </button>
        <button
          onClick={() => setActiveAdminTab('doctors')}
          className={`btn btn-sm ${activeAdminTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Stethoscope size={16} /> Doctors &amp; Village Assignments ({districtStaff.doctors?.length || 0})
        </button>
        <button
          onClick={() => setActiveAdminTab('asha-workers')}
          className={`btn btn-sm ${activeAdminTab === 'asha-workers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={16} /> ASHA &amp; Field Health Workers ({districtStaff.asha_workers?.length || 0})
        </button>
        <button
          onClick={() => setActiveAdminTab('medicine-inventory')}
          className={`btn btn-sm ${activeAdminTab === 'medicine-inventory' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Pill size={16} /> District Medicine Inventory &amp; Stock ({districtInventory.medicines?.length || 0})
        </button>
        <button
          onClick={() => setActiveAdminTab('grievances')}
          className={`btn btn-sm ${activeAdminTab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ShieldAlert size={16} /> Grievance Resolution Desk ({complaints.filter(c => c.status !== 'Resolved').length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading {selectedDistrict} district healthcare management data...
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: DISTRICT HEALTHCARE FACILITIES & GIS MAP (Requirement 8b) */}
          {/* ========================================================================= */}
          {activeAdminTab === 'gis-map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800 }}>
                    {selectedDistrict} District Healthcare Facility Map &amp; Coverage
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Visual spatial distribution of Sub-Centres, PHCs, CHCs, and District Hospitals. Add new health centres to plot them on the map.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const coords = DISTRICT_COORDS[selectedDistrict] || { lat: 18.5204, lng: 73.8567 };
                    setHospitalForm(prev => ({
                      ...prev,
                      district: selectedDistrict,
                      latitude: coords.lat.toString(),
                      longitude: coords.lng.toString()
                    }));
                    setShowAddHospitalModal(true);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Plus size={16} /> Add Hospital / Centre to {selectedDistrict}
                </button>
              </div>

              {/* Leaflet Map */}
              <div style={{ height: '520px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <InteractiveMap
                  villages={gisData.villages}
                  facilities={gisData.facilities}
                  centerCoords={DISTRICT_COORDS[selectedDistrict]}
                />
              </div>

              {/* Facilities Directory Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A' }}>
                    Registered Healthcare Facilities in {selectedDistrict} ({gisData.facilities?.length || 0})
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Total Beds: {overview?.beds?.total || 0} &bull; Vacant: {overview?.beds?.available || 0}
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Facility Name</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Type</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Village / Location</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>GPS Coordinates</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Total Beds</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Available Beds</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Emergency Care</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(gisData?.facilities || []).map((f, idx) => (
                        <tr key={f.facility_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#11322A' }}>{f.facility_name}</td>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{f.facility_type}</span>
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>{f.village_name || f.address || 'District Centre'}</td>
                          <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {f.latitude?.toFixed(4)}, {f.longitude?.toFixed(4)}
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{f.total_beds}</td>
                          <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: f.available_beds > 0 ? '#10B981' : '#EF4444' }}>
                            {f.available_beds} beds
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <span className={`badge ${f.emergency_available ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                              {f.emergency_available ? '24x7 Available' : 'Routine Only'}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>{f.contact || '108'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DOCTORS & VILLAGE ASSIGNMENTS (Requirement 2 & 3) */}
          {/* ========================================================================= */}
          {activeAdminTab === 'doctors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={22} color="#0284C7" /> Doctors &amp; Appointed Village Jurisdictions
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Medical Officers and Specialists stationed in <b>{selectedDistrict} District</b> and their assigned villages or village clusters.
                  </p>
                </div>

                <button
                  onClick={() => setShowAppointDoctorModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Plus size={16} /> Appoint New Doctor to {selectedDistrict}
                </button>
              </div>

              {/* Doctors Directory Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Doctor Name</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Specialization</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Appointed Health Centre / Hospital</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Assigned Village(s) / Coverage Area</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Working Schedule</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!districtStaff?.doctors || districtStaff.doctors.length === 0) ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No doctors currently assigned to {selectedDistrict}. Use the button above to appoint a doctor.
                          </td>
                        </tr>
                      ) : (
                        (districtStaff.doctors || []).map((doc, idx) => (
                          <tr key={doc.staff_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#11322A' }}>
                              Dr. {doc.name}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                                {doc.specialization}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                              <b>{doc.facility_name}</b> ({doc.facility_type})
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ 
                                background: 'rgba(13, 148, 136, 0.1)', 
                                color: '#0D9488', 
                                border: '1px solid rgba(13, 148, 136, 0.3)',
                                padding: '0.25rem 0.6rem', 
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700 
                              }}>
                                📍 {doc.assigned_villages || doc.village_name || 'Shivapur, Khedgaon'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {doc.working_days} &bull; {doc.working_hours}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span className={`badge ${doc.availability_status === 'Available' ? 'badge-success' : doc.availability_status === 'In Consultation' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                                {doc.availability_status || 'Available'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {doc.phone || '9822012345'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ASHA & VILLAGE HEALTH WORKERS (Requirement 2) */}
          {/* ========================================================================= */}
          {activeAdminTab === 'asha-workers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={22} color="#8B5CF6" /> ASHA &amp; Field Health Workers
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Accredited Social Health Activists (ASHA) and Auxiliary Nurse Midwives (ANM) assigned to villages in <b>{selectedDistrict} District</b>.
                  </p>
                </div>

                <button
                  onClick={() => setShowOnboardAshaModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Plus size={16} /> Onboard ASHA Worker
                </button>
              </div>

              {/* ASHA Directory Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Health Worker</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Contact Phone</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Base Village</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Assigned Field Jurisdiction</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Monitored Patients</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Affiliated Sub-Centre / PHC</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!districtStaff?.asha_workers || districtStaff.asha_workers.length === 0) ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No ASHA workers currently registered in {selectedDistrict}.
                          </td>
                        </tr>
                      ) : (
                        (districtStaff.asha_workers || []).map((w, idx) => (
                          <tr key={w.user_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#11322A' }}>
                              {w.name}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                              {w.phone}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                              {w.village_name || 'Shivapur'}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ 
                                background: 'rgba(139, 92, 246, 0.1)', 
                                color: '#8B5CF6', 
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                padding: '0.25rem 0.6rem', 
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700 
                              }}>
                                🏡 {w.assigned_villages || `${w.village_name || 'Shivapur'} Jurisdiction`}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}>
                              {w.village_patients_count || 12} registered
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                              {w.affiliated_facility || 'Shivapur Health Sub-Centre'}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                Active in Field
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DISTRICT MEDICINE INVENTORY & STOCK MONITORING (Requirement 7) */}
          {/* ========================================================================= */}
          {activeAdminTab === 'medicine-inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill size={22} color="#10B981" /> District Medicine Inventory &amp; Stock Monitoring
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Comprehensive stock ledger across all Primary Health Centres, CHCs, and Sub-Centres in <b>{selectedDistrict} District</b>. Monitor available units, distribution, and shortages.
                </p>
              </div>

              {/* Inventory Overview Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Stock Available</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#11322A' }}>
                    {districtInventory.kpis.total_units || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>units</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Across all essential drugs</div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monitored Dispensaries</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7' }}>
                    {districtInventory.kpis.facilities_count || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sub-Centres &amp; PHC stores</div>
                </div>

                <div className="card" style={{ padding: '1.25rem', border: districtInventory.kpis.low_stock_count > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#F59E0B' }}>Low Stock Items</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>
                    {districtInventory.kpis.low_stock_count || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>&lt; 20 units remaining</div>
                </div>

                <div className="card" style={{ padding: '1.25rem', border: districtInventory.kpis.out_of_stock_count > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#EF4444' }}>Critical Stockouts</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444' }}>
                    {districtInventory.kpis.out_of_stock_count || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Zero units available</div>
                </div>
              </div>

              {/* Filters & Search Controls */}
              <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search medicine by name or category..."
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Facility:</span>
                  <select
                    className="form-select"
                    value={inventoryFacilityFilter}
                    onChange={e => setInventoryFacilityFilter(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                  >
                    <option value="">All Facilities in {selectedDistrict}</option>
                    {(districtStaff?.facilities || []).map(f => (
                      <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock Status:</span>
                  <select
                    className="form-select"
                    value={inventoryStatusFilter}
                    onChange={e => setInventoryStatusFilter(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Complete District Medicine Inventory Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A' }}>
                    Medicine Stock Ledger ({filteredMedicines.length} items found)
                  </h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Medicine Name</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Category</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Healthcare Facility</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Location / Village</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Available Stock</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Stock Status</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Units Dispensed</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No medicines match the selected filter in {selectedDistrict}.
                          </td>
                        </tr>
                      ) : (
                        filteredMedicines.map(m => {
                          const isOut = m.stock_status === 'Out of Stock' || m.quantity === 0;
                          const isLow = m.stock_status === 'Low Stock' || (m.quantity > 0 && m.quantity < 30);
                          return (
                            <tr key={m.medicine_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#11322A' }}>
                                {m.medicine_name}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                {m.category || 'Essential'}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>
                                {m.facility_name} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({m.facility_type})</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                                {m.village_name || 'District Centre'}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, fontSize: '0.95rem', color: isOut ? '#EF4444' : isLow ? '#F59E0B' : '#11322A' }}>
                                {m.quantity} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{m.unit || 'units'}</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                                  {m.stock_status}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#0D9488' }}>
                                {m.total_dispensed || 0} {m.unit || 'units'}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {m.last_updated ? m.last_updated.substring(0, 10) : 'Recent'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Movement & Dispensing Transaction Audit History */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={18} color="#0D9488" /> District Stock Movement &amp; Dispensing Audit History
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Audited record of medicines dispensed to patients and replenishment supplies received across {selectedDistrict} facilities.
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Tx ID</th>
                        <th style={{ padding: '0.5rem' }}>Facility</th>
                        <th style={{ padding: '0.5rem' }}>Medicine</th>
                        <th style={{ padding: '0.5rem' }}>Transaction</th>
                        <th style={{ padding: '0.5rem' }}>Quantity</th>
                        <th style={{ padding: '0.5rem' }}>Balance After</th>
                        <th style={{ padding: '0.5rem' }}>Recorded By</th>
                        <th style={{ padding: '0.5rem' }}>Notes</th>
                        <th style={{ padding: '0.5rem' }}>Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(districtInventory.transactions || []).length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            No recent stock transactions recorded for {selectedDistrict}.
                          </td>
                        </tr>
                      ) : (
                        (districtInventory.transactions || []).map(tx => (
                          <tr key={tx.transaction_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{tx.transaction_id}</td>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>{tx.facility_name}</td>
                            <td style={{ padding: '0.55rem 0.5rem' }}>{tx.medicine_name}</td>
                            <td style={{ padding: '0.55rem 0.5rem' }}>
                              <span className={`badge ${tx.transaction_type === 'Dispensed' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, color: tx.transaction_type === 'Dispensed' ? '#EF4444' : '#10B981' }}>
                              {tx.transaction_type === 'Dispensed' ? `-${tx.quantity}` : `+${tx.quantity}`}
                            </td>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700 }}>{tx.balance_after}</td>
                            <td style={{ padding: '0.55rem 0.5rem' }}>{tx.actor_name || 'Staff'}</td>
                            <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>{tx.notes}</td>
                            <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.created_at}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: GRIEVANCE RESOLUTION DESK (Requirement 4) */}
          {/* ========================================================================= */}
          {activeAdminTab === 'grievances' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={22} color="#F59E0B" /> District Grievance Redressal Desk
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Review, assign, and officially resolve complaints lodged by citizens or ASHA health workers across <b>{selectedDistrict} District</b>.
                </p>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Ticket ID</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Citizen / Patient</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Category</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Healthcare Facility</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Description</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Priority</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Admin Response</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                            <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
                            All citizen grievances in {selectedDistrict} have been resolved!
                          </td>
                        </tr>
                      ) : (
                        complaints.map(c => (
                          <tr key={c.complaint_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{c.complaint_id}</td>
                            <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{c.patient_name || c.user_name || 'Village Resident'}</td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>{c.complaint_type}</td>
                            <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>{c.facility_name || 'Public Health Centre'}</td>
                            <td style={{ padding: '0.65rem 0.5rem', maxWidth: '280px', fontSize: '0.8rem', color: '#334155' }}>
                              {c.description}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span className={`badge ${c.priority === 'Urgent' || c.priority === 'High' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                                {c.priority || 'Normal'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : c.status === 'In Progress' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', maxWidth: '180px', fontSize: '0.78rem', color: c.admin_response ? '#0D9488' : 'var(--text-muted)' }}>
                              {c.admin_response || 'Pending Review'}
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              {c.status !== 'Resolved' ? (
                                <button
                                  onClick={() => {
                                    setResolvingComplaint(c);
                                    setResolutionStatus('Resolved');
                                    setAdminResponse('');
                                  }}
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                >
                                  Resolve
                                </button>
                              ) : (
                                <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                                  ✓ Closed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD HOSPITAL / HEALTHCARE FACILITY (Requirement 8b) */}
      {/* ========================================================================= */}
      {showAddHospitalModal && (
        <div className="modal-overlay" onClick={() => setShowAddHospitalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={20} color="#0D9488" /> Add Healthcare Centre to {selectedDistrict}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Enter facility details, capacity, and GPS coordinates to plot it onto the GIS map.
                </p>
              </div>
              <button onClick={() => setShowAddHospitalModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {hospitalSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {hospitalSuccess}
              </div>
            )}

            <form onSubmit={handleAddHospital}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Facility Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shirwal Primary Health Centre (PHC)"
                    value={hospitalForm.facility_name}
                    onChange={e => setHospitalForm({ ...hospitalForm, facility_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Facility Classification</label>
                  <select
                    className="form-select"
                    value={hospitalForm.facility_type}
                    onChange={e => setHospitalForm({ ...hospitalForm, facility_type: e.target.value })}
                  >
                    <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                    <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                    <option value="Sub-Centre">Sub-Centre</option>
                    <option value="Sub-District Hospital">Sub-District Hospital</option>
                    <option value="Government Hospital">District Civil Hospital</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">District Jurisdiction</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.district}
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 700 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Village / Town Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shirwal"
                    value={hospitalForm.village_name}
                    onChange={e => setHospitalForm({ ...hospitalForm, village_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Near Taluka Panchayat Office, Main Highway Road"
                  value={hospitalForm.address}
                  onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Latitude GPS Coordinate</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="18.5204"
                    value={hospitalForm.latitude}
                    onChange={e => setHospitalForm({ ...hospitalForm, latitude: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Longitude GPS Coordinate</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="73.8567"
                    value={hospitalForm.longitude}
                    onChange={e => setHospitalForm({ ...hospitalForm, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Bed Capacity</label>
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
                  <label className="form-label">Available Beds</label>
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
                  <label className="form-label">Help Desk / Ambulance Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.contact}
                    onChange={e => setHospitalForm({ ...hospitalForm, contact: e.target.value })}
                    placeholder="020-26127394"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={hospitalSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  {hospitalSubmitting ? 'Registering Facility...' : `Plot & Add Hospital to ${selectedDistrict}`}
                </button>
                <button type="button" onClick={() => setShowAddHospitalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: APPOINT DOCTOR WITH VILLAGE ASSIGNMENT (Requirement 2 & 3) */}
      {/* ========================================================================= */}
      {showAppointDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowAppointDoctorModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={20} color="#0284C7" /> Appoint Doctor &amp; Assign Villages
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Appoint a new doctor and select which village or group of villages they are responsible for.
                </p>
              </div>
              <button onClick={() => setShowAppointDoctorModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {doctorSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {doctorSuccess}
              </div>
            )}

            <form onSubmit={handleAppointDoctor}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Rajesh Deshmukh"
                    value={doctorForm.name}
                    onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Specialization</label>
                  <select
                    className="form-select"
                    value={doctorForm.specialization}
                    onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  >
                    <option value="General Medicine">General Medicine / Medical Officer</option>
                    <option value="Pediatrics">Pediatrics &amp; Child Health</option>
                    <option value="Gynecology & Obstetrics">Gynecology &amp; Obstetrics</option>
                    <option value="Cardiology">Cardiology &amp; Emergency</option>
                    <option value="Orthopedics">Orthopedics &amp; Trauma Care</option>
                    <option value="Public Health Specialist">Public Health Specialist</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="doctor@ruralcare.in"
                    value={doctorForm.email}
                    onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Contact</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="9822012345"
                    value={doctorForm.phone}
                    onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stationed Healthcare Facility ({selectedDistrict})</label>
                <select
                  className="form-select"
                  value={doctorForm.facility_id}
                  onChange={e => setDoctorForm({ ...doctorForm, facility_id: parseInt(e.target.value) })}
                  required
                >
                  {districtStaff.facilities.map(f => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.facility_name} ({f.facility_type}) &bull; {f.village_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village or Group of Villages Assignment (Requirement 3) */}
              <div className="form-group" style={{ background: 'var(--color-bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <label className="form-label" style={{ color: '#0284C7', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Select Assigned Village or Group of Villages
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Select villages in {selectedDistrict} under this doctor's clinical jurisdiction for teleconsultation and field referrals:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.4rem', maxHeight: '110px', overflowY: 'auto', marginBottom: '0.6rem' }}>
                  {districtStaff.villages.map(v => {
                    const isChecked = doctorForm.assigned_villages.includes(v.village_name);
                    return (
                      <label key={v.village_id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#11322A' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setDoctorForm({
                                ...doctorForm,
                                assigned_villages: [...doctorForm.assigned_villages, v.village_name]
                              });
                            } else {
                              setDoctorForm({
                                ...doctorForm,
                                assigned_villages: doctorForm.assigned_villages.filter(name => name !== v.village_name)
                              });
                            }
                          }}
                        />
                        {v.village_name}
                      </label>
                    );
                  })}
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Or add custom village names / clusters (comma-separated):</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                    placeholder="e.g. Shivapur, Khedgaon, Saswad Cluster"
                    value={doctorForm.custom_village_input}
                    onChange={e => setDoctorForm({ ...doctorForm, custom_village_input: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Working Days</label>
                  <input
                    type="text"
                    className="form-input"
                    value={doctorForm.working_days}
                    onChange={e => setDoctorForm({ ...doctorForm, working_days: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duty Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    value={doctorForm.working_hours}
                    onChange={e => setDoctorForm({ ...doctorForm, working_hours: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={doctorSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {doctorSubmitting ? 'Appointing Doctor...' : `Appoint & Assign Doctor to Villages`}
                </button>
                <button type="button" onClick={() => setShowAppointDoctorModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ONBOARD ASHA WORKER (Requirement 2) */}
      {/* ========================================================================= */}
      {showOnboardAshaModal && (
        <div className="modal-overlay" onClick={() => setShowOnboardAshaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="#8B5CF6" /> Onboard ASHA / Field Health Worker
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Assign village health coverage and jurisdiction in {selectedDistrict}.
                </p>
              </div>
              <button onClick={() => setShowOnboardAshaModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {workerSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {workerSuccess}
              </div>
            )}

            <form onSubmit={handleOnboardWorker}>
              <div className="form-group">
                <label className="form-label">Worker Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sunita Patil"
                  value={workerForm.name}
                  onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="9822012345"
                    value={workerForm.phone}
                    onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="asha@ruralcare.in"
                    value={workerForm.email}
                    onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Village Station</label>
                <select
                  className="form-select"
                  value={workerForm.village_id}
                  onChange={e => setWorkerForm({ ...workerForm, village_id: parseInt(e.target.value) })}
                  required
                >
                  {districtStaff.villages.map(v => (
                    <option key={v.village_id} value={v.village_id}>{v.village_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Field Coverage / Jurisdictional Villages</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shivapur, Khedgaon Sub-Centre Cluster"
                  value={workerForm.assigned_villages}
                  onChange={e => setWorkerForm({ ...workerForm, assigned_villages: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={workerSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {workerSubmitting ? 'Onboarding...' : 'Onboard & Assign ASHA Worker'}
                </button>
                <button type="button" onClick={() => setShowOnboardAshaModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESOLVE GRIEVANCE TICKET (Requirement 4) */}
      {/* ========================================================================= */}
      {resolvingComplaint && (
        <div className="modal-overlay" onClick={() => setResolvingComplaint(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800 }}>
                  Resolve Grievance Ticket #{resolvingComplaint.complaint_id}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Citizen: <b>{resolvingComplaint.patient_name || resolvingComplaint.user_name || 'Village Resident'}</b> &bull; Category: {resolvingComplaint.complaint_type}
                </p>
              </div>
              <button onClick={() => setResolvingComplaint(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {resolveSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {resolveSuccess}
              </div>
            )}

            <form onSubmit={handleResolveComplaint}>
              <div className="form-group">
                <label className="form-label">Grievance Description</label>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  "{resolvingComplaint.description}"
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select
                  className="form-select"
                  value={resolutionStatus}
                  onChange={e => setResolutionStatus(e.target.value)}
                >
                  <option value="Resolved">Resolved &bull; Issue Rectified</option>
                  <option value="In Progress">In Progress &bull; Under District Investigation</option>
                  <option value="Pending">Pending &bull; Awaiting Field Response</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Administrative Response</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter actions taken, e.g. Medicine stock dispatched from district warehouse / PHC Medical Officer reprimanded / Equipment repaired..."
                  value={adminResponse}
                  onChange={e => setAdminResponse(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
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
