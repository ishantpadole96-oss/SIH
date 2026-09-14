import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MaternalChildTracker from '../components/MaternalChildTracker';
import SmartHealthWorkerCopilot from '../components/SmartHealthWorkerCopilot';
import QRJourneyModal from '../components/QRJourneyModal';
import { offlineStorage } from '../services/offlineStorage';
import { 
  Users, AlertTriangle, ArrowRightLeft, Calendar, UserPlus, 
  Activity, CheckCircle2, Phone, Stethoscope, ChevronRight, X, Heart, Baby,
  Wifi, WifiOff, RefreshCw, Sparkles, QrCode, Shield, Clock, MapPin, Pill,
  Video, ShieldAlert, Thermometer, Send, MessageSquare
} from 'lucide-react';

export function AshaDashboard({ setActiveTab, onOpenTelemed, onOpenCall }) {
  const { user, token, selectedVillage, villages } = useAuth();
  const { t } = useLanguage();

  const [ashaSubTab, setAshaSubTab] = useState('triage'); // 'triage' | 'tracking' | 'mch' | 'pharmacy' | 'grievances'
  const [patients, setPatients] = useState([]);
  const [highRiskCases, setHighRiskCases] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Offline Engine State
  const [offlineStatus, setOfflineStatus] = useState(offlineStorage.getStatus());
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Modals
  const [showCopilot, setShowCopilot] = useState(false);
  const [showQRJourney, setShowQRJourney] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState('MH-RURAL-2026-0001');

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
    specialist_required: 'Gynecology & Obstetrics',
    required_tests: 'CBC, USG Pelvis',
    clinical_summary: ''
  });

  // Sub-Centre Pharmacy & Replenishment (Master Spec Sec 15)
  const [medicines, setMedicines] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [showMedRequestModal, setShowMedRequestModal] = useState(false);
  const [medRequestForm, setMedRequestForm] = useState({
    medicine_id: 1,
    medicine_name: 'Paracetamol 500mg Tablets',
    quantity_requested: 100,
    urgency: 'Routine',
    notes: ''
  });
  const [medRequestMsg, setMedRequestMsg] = useState(null);

  // ASHA Medicine Dispense to Patient (Requirement 6)
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseForm, setDispenseForm] = useState({
    medicine_id: '',
    medicine_name: '',
    unit: 'tablets',
    quantity: 10,
    patient_id: '',
    patient_name: '',
    notes: 'Routine dose given during home visit'
  });
  const [dispenseMsg, setDispenseMsg] = useState(null);
  const [dispensingLoading, setDispensingLoading] = useState(false);

  // ASHA Medicine Restock / Manual Adjustment (Requirement 6)
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    medicine_id: '',
    medicine_name: '',
    facility_id: 1,
    quantity: 50,
    unit: 'tablets',
    adjustment_type: 'add',
    notes: 'Received replenishment stock supply from PHC'
  });
  const [restockMsg, setRestockMsg] = useState(null);
  const [restockLoading, setRestockLoading] = useState(false);
  const [inventoryTransactions, setInventoryTransactions] = useState([]);

  // Patient Grievances Desk State (Requirement 4)
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    patient_id: '',
    complaint_type: 'Medicine Shortage',
    facility_id: 1,
    description: '',
    priority: 'Normal'
  });
  const [complaintMsg, setComplaintMsg] = useState(null);

  // Vitals Recording & Telemetry Modal (Requirement 6)
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '98.6',
    heart_rate: '76',
    bp: '120/80',
    systolic_bp: '120',
    diastolic_bp: '80',
    spo2: '98',
    respiratory_rate: '18',
    blood_sugar: '',
    notes: ''
  });
  const [vitalsMsg, setVitalsMsg] = useState(null);
  const [transmittingVitals, setTransmittingVitals] = useState(false);

  const fetchMedicineData = () => {
    fetch('/api/medicines')
      .then(r => r.json())
      .then(d => {
        const rawList = d.medicines || [];
        const map = new Map();
        rawList.forEach(m => {
          const name = (m.medicine_name || '').trim();
          const key = name.toLowerCase();
          const qty = Number(m.quantity ?? m.stock_quantity ?? 0);
          const unit = m.unit || 'strips';
          if (!map.has(key)) {
            map.set(key, {
              ...m,
              medicine_name: name,
              quantity: qty,
              unit: unit,
              facilities: m.facility_name ? [m.facility_name] : []
            });
          } else {
            const existing = map.get(key);
            existing.quantity += qty;
            if (m.facility_name && !existing.facilities.includes(m.facility_name)) {
              existing.facilities.push(m.facility_name);
            }
          }
        });
        const aggregated = Array.from(map.values()).map(item => ({
          ...item,
          stock_status: item.quantity === 0 ? 'Out of Stock' : item.quantity < 30 ? 'Low Stock' : 'In Stock'
        }));
        setMedicines(aggregated);
      })
      .catch(err => console.error('Failed to load medicines:', err));

    if (token) {
      fetch('/api/medicines/requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setMedicineRequests(d.requests || []))
        .catch(err => console.error('Failed to load medicine requests:', err));

      fetch('/api/medicines/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setInventoryTransactions(d.transactions || []))
        .catch(err => console.error('Failed to load transactions:', err));
    }
  };

  const handleDispenseMedicine = async (e) => {
    e.preventDefault();
    setDispensingLoading(true);
    try {
      const res = await fetch('/api/medicines/dispense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dispenseForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispense medicine');

      setDispenseMsg(data.message);
      fetchMedicineData();
      setTimeout(() => {
        setShowDispenseModal(false);
        setDispenseMsg(null);
      }, 1400);
    } catch (err) {
      alert(err.message);
    } finally {
      setDispensingLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    setRestockLoading(true);
    try {
      const res = await fetch('/api/medicines/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(restockForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust stock');

      setRestockMsg(data.message);
      fetchMedicineData();
      setTimeout(() => {
        setShowRestockModal(false);
        setRestockMsg(null);
      }, 1400);
    } catch (err) {
      alert(err.message);
    } finally {
      setRestockLoading(false);
    }
  };

  const fetchComplaints = () => {
    if (!token) return;
    setComplaintsLoading(true);
    fetch('/api/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setComplaints(d.complaints || []);
        setComplaintsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load complaints:', err);
        setComplaintsLoading(false);
      });
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(complaintForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grievance');
      setComplaintMsg(`Grievance #${data.complaint?.complaint_id || 'TICKET'} registered successfully on behalf of patient!`);
      fetchComplaints();
      setTimeout(() => {
        setShowComplaintModal(false);
        setComplaintMsg(null);
        setComplaintForm({
          patient_id: '',
          complaint_type: 'Medicine Shortage',
          facility_id: 1,
          description: '',
          priority: 'Normal'
        });
      }, 1500);
    } catch (err) {
      setComplaintMsg('Error: ' + err.message);
    }
  };

  const handleTransmitVitals = async (launchVideo = false) => {
    if (!vitalsPatient) return;
    setTransmittingVitals(true);
    try {
      const payload = {
        ...vitalsForm,
        temperature: vitalsForm.temperature ? parseFloat(vitalsForm.temperature) : undefined,
        heart_rate: vitalsForm.heart_rate ? parseInt(vitalsForm.heart_rate) : undefined,
        spo2: vitalsForm.spo2 ? parseInt(vitalsForm.spo2) : undefined,
        respiratory_rate: vitalsForm.respiratory_rate ? parseInt(vitalsForm.respiratory_rate) : undefined,
        blood_sugar: vitalsForm.blood_sugar ? parseFloat(vitalsForm.blood_sugar) : undefined
      };
      const res = await fetch(`/api/patients/${vitalsPatient.patient_id}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transmit vitals');

      setVitalsMsg('✅ Vitals recorded and transmitted to Doctor portal successfully!');
      fetchData();

      if (launchVideo && onOpenTelemed) {
        setTimeout(() => {
          setShowVitalsModal(false);
          setVitalsMsg(null);
          onOpenTelemed({
            doctorName: 'Dr. Rajesh Deshmukh',
            facility: 'District General Hospital',
            patientId: vitalsPatient.patient_id,
            patientName: vitalsPatient.name,
            patientAge: vitalsPatient.age,
            patientGender: vitalsPatient.gender,
            incomingVitals: payload
          });
        }, 800);
      } else {
        setTimeout(() => {
          setShowVitalsModal(false);
          setVitalsMsg(null);
        }, 1500);
      }
    } catch (err) {
      alert('Error transmitting vitals: ' + err.message);
    } finally {
      setTransmittingVitals(false);
    }
  };

  const handleSubmitMedicineRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medicines/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(medRequestForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setMedRequestMsg('Requisition dispatched to District Drug Warehouse! Request ID: #' + (data.request?.request_id || 'REQ'));
      fetchMedicineData();
      setTimeout(() => {
        setShowMedRequestModal(false);
        setMedRequestMsg(null);
      }, 1400);
    } catch (err) {
      setMedRequestMsg('Error: ' + err.message);
    }
  };

  // Subscribe to offline storage state changes
  useEffect(() => {
    const unsub = offlineStorage.subscribe((status) => {
      setOfflineStatus(status);
    });
    return unsub;
  }, []);

  const fetchData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    if (!offlineStatus.isOnline) {
      // Load from local storage cache when offline
      const cachedPats = offlineStorage.getCachedPatients();
      if (cachedPats.length > 0) setPatients(cachedPats);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch('/api/patients', { headers }).then(r => r.json()),
      fetch('/api/screenings/high-risk', { headers }).then(r => r.json()),
      fetch('/api/referrals', { headers }).then(r => r.json())
    ])
      .then(([patData, riskData, refData]) => {
        const pList = patData.patients || [];
        // Ensure pending offline and newly added patients never disappear
        const pendingQueue = offlineStorage.getQueue().patients || [];
        const existingIds = new Set(pList.map(p => p.patient_id));
        const unSynced = pendingQueue.filter(p => !existingIds.has(p.patient_id) && !existingIds.has(p.temp_id));
        const combined = [...unSynced, ...pList];
        setPatients(combined);
        offlineStorage.cachePatients(combined); // cache locally for offline persistence

        setHighRiskCases(riskData.highRiskCases || []);
        setReferrals(refData.referrals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load ASHA data:', err);
        // Fallback to local cache
        const cachedPats = offlineStorage.getCachedPatients();
        if (cachedPats.length > 0) setPatients(cachedPats);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    fetchMedicineData();
    fetchComplaints();
  }, [token, offlineStatus.isOnline]);

  const handleToggleOfflineMode = () => {
    const nextVal = !offlineStatus.isSimulatedOffline;
    offlineStorage.setSimulatedOffline(nextVal);
    setSyncMessage(nextVal ? '📴 Simulated Offline Village Field Mode activated. All records will be stored locally.' : '📶 Reconnected to live network.');
    setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await offlineStorage.syncWithServer(token);
      setSyncMessage(`✅ Central Sync Completed: ${res.synced} offline records synchronized with District Server.`);
      fetchData();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    // Check if offline
    if (!offlineStatus.isOnline) {
      const offlinePat = offlineStorage.saveOfflinePatient(regForm);
      setPatients(prev => [offlinePat, ...prev]);
      setRegSuccess(`Offline Registration Saved! Health Journey ID: ${offlinePat.health_journey_id}. Queued for central sync.`);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(null);
        setRegForm({
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
      }, 1500);
      return;
    }

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

      if (data.patient) {
        setPatients(prev => [data.patient, ...prev.filter(p => p.patient_id !== data.patient.patient_id)]);
        const cached = offlineStorage.getCachedPatients();
        offlineStorage.cachePatients([data.patient, ...cached.filter(p => p.patient_id !== data.patient.patient_id)]);
      }
      setRegSuccess(`Patient ${data.patient.name} registered! Health Journey ID: ${data.patient.health_journey_id}`);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(null);
        setRegForm({
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
        fetchData();
      }, 1200);
    } catch (err) {
      console.warn('Network registration failed, fallback to local offline queue:', err);
      const offlinePat = offlineStorage.saveOfflinePatient(regForm);
      setPatients(prev => [offlinePat, ...prev]);
      setRegSuccess(`Saved to Offline Queue (No Server Connection): ${offlinePat.name} (${offlinePat.health_journey_id})`);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(null);
        setRegForm({
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
      }, 1500);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!refPatient) return;

    const refPayload = {
      ...refForm,
      patient_id: refPatient.patient_id,
      temp_patient_id: refPatient.temp_id || null
    };

    // Check if offline
    if (!offlineStatus.isOnline) {
      const offlineRef = offlineStorage.saveOfflineReferral(refPayload);
      setReferrals(prev => [offlineRef, ...prev]);
      alert(`📴 Smart Referral queued offline! Queue Token: ${offlineRef.queue_token}. Will auto-sync when network returns.`);
      setShowReferralModal(false);
      return;
    }

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(refPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Referral creation failed');

      alert(`Smart Referral #${data.referral.referral_id} created! Pre-booked Queue Token: ${data.referral.queue_token || 'Q-DH-042'}`);
      setShowReferralModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProgressStage = async (referralId, nextStage) => {
    try {
      const res = await fetch(`/api/referrals/${referralId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage: nextStage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stage update failed');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAshaFollowup = async (referralId, actionNotes, markReached = false) => {
    try {
      const res = await fetch(`/api/referrals/${referralId}/asha-followup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          asha_followup_status: markReached ? 'Resolved' : 'Home Visited',
          asha_followup_notes: actionNotes || 'Conducted ASHA home visit; verified patient status and arranged transit support.',
          mark_reached: markReached
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Follow-up update failed');
      alert('ASHA follow-up action logged successfully!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const pendingCount = offlineStatus.pending.total;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Offline Mode Banner & Simulation Strip (Crucial for SIH Demo) */}
      <div style={{
        background: !offlineStatus.isOnline 
          ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(180, 83, 9, 0.2) 100%)'
          : 'rgba(15, 23, 42, 0.6)',
        border: !offlineStatus.isOnline ? '1px solid #F97316' : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: !offlineStatus.isOnline ? '#EA580C' : '#0D9488',
            color: '#FFFFFF',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!offlineStatus.isOnline ? <WifiOff size={18} /> : <Wifi size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                {!offlineStatus.isOnline ? '📴 Offline Field Mode Active (Village Zero-Connectivity)' : '📶 Online Central Connectivity'}
              </span>
              {pendingCount > 0 && (
                <span className="badge badge-warning" style={{ fontWeight: 800 }}>
                  {pendingCount} Pending Local Sync
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {!offlineStatus.isOnline 
                ? 'Health worker can register patients, record vitals & issue referrals locally in IndexedDB/Storage. Auto-syncs on reconnect.'
                : 'All patient registrations, vitals, and smart referrals synchronize automatically with central district hospital databases.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {pendingCount > 0 && offlineStatus.isOnline && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="btn btn-primary btn-sm"
              style={{ background: '#0D9488' }}
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : `Sync ${pendingCount} Records Now`}</span>
            </button>
          )}

          <button
            onClick={handleToggleOfflineMode}
            className={`btn btn-sm ${!offlineStatus.isOnline ? 'btn-warning' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem' }}
          >
            {!offlineStatus.isOnline ? '📶 Switch to Online' : '📴 Simulate Offline Field Mode'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div style={{ background: 'rgba(45, 212, 191, 0.15)', border: '1px solid #2DD4BF', color: '#2DD4BF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          {syncMessage}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(13, 148, 136, 0.2)', color: '#2DD4BF', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Activity size={14} /> COMMUNITY HEALTH WORKER (ASHA / ANM)
          </div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            ASHA Community Health Portal
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Serving <b>{user?.name || 'Sunita Bai'}</b> • Assigned Jurisdiction: <b>{selectedVillage?.village_name} &amp; Khed Sub-Centre</b>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (onOpenTelemed) {
                onOpenTelemed({
                  doctorName: 'Dr. Rajesh Deshmukh',
                  facility: 'District General Hospital'
                });
              }
            }}
            className="btn btn-secondary"
            style={{ border: '1px solid #38BDF8', color: '#38BDF8' }}
          >
            <Video size={16} /> Video Call Doctor
          </button>

          <button
            onClick={() => setShowCopilot(true)}
            className="btn btn-secondary"
            style={{ border: '1px solid #A855F7', color: '#C084FC' }}
          >
            <Sparkles size={16} /> Ask Smart Copilot
          </button>

          <button
            onClick={() => {
              setSelectedJourneyId('MH-RURAL-2026-0001');
              setShowQRJourney(true);
            }}
            className="btn btn-secondary"
            style={{ border: '1px solid #2DD4BF', color: '#2DD4BF' }}
          >
            <QrCode size={16} /> Scan Patient QR
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-primary"
          >
            <UserPlus size={18} /> Register Patient in Field
          </button>
        </div>
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Referrals Monitored</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24', margin: '4px 0' }}>
            {referrals.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>6-stage cross-tier journey</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
          <div style={{ fontSize: '0.75rem', color: '#FB923C', fontWeight: 700 }}>⚠️ Uncompleted Referrals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F97316', margin: '4px 0' }}>
            {referrals.filter(r => r.current_stage === 'Stuck - Follow-up Required' || (r.current_stage === 'Created' && r.status !== 'Completed')).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dropout alert: follow-up required</div>
        </div>
      </div>

      {/* ASHA Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setAshaSubTab('triage')}
          className={`btn btn-sm ${ashaSubTab === 'triage' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} /> Community Triage &amp; Villagers
        </button>
        <button
          type="button"
          onClick={() => setAshaSubTab('tracking')}
          className={`btn btn-sm ${ashaSubTab === 'tracking' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ArrowRightLeft size={16} /> 🔥 6-Stage Referral Tracking &amp; Dropout Watchlist ({referrals.length})
        </button>
        <button
          type="button"
          onClick={() => setAshaSubTab('mch')}
          className={`btn btn-sm ${ashaSubTab === 'mch' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Baby size={16} className="text-teal" /> Maternal &amp; Child Health (MCH / RCH) Registry
        </button>
        <button
          type="button"
          onClick={() => setAshaSubTab('pharmacy')}
          className={`btn btn-sm ${ashaSubTab === 'pharmacy' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Pill size={16} /> Sub-Centre Pharmacy &amp; Requisitions
        </button>
        <button
          type="button"
          onClick={() => { setAshaSubTab('grievances'); fetchComplaints(); }}
          className={`btn btn-sm ${ashaSubTab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShieldAlert size={16} /> Patient Grievances Desk ({complaints.length})
        </button>
      </div>

      {ashaSubTab === 'mch' ? (
        <MaternalChildTracker />
      ) : ashaSubTab === 'tracking' ? (
        /* TAB 2: 6-STAGE REFERRAL TRACKING & DROPOUT WATCHLIST */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRightLeft size={22} color="#2DD4BF" /> Cross-Tier Referral Tracking &amp; Dropout Watchlist
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Tracks complete lifecycle: Referral Created ➔ Patient Reached ➔ Consultation ➔ Test ➔ Treatment ➔ Follow-up
              </p>
            </div>
            <span className="badge badge-warning">Active Dropout Watchdog Enabled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {referrals.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <ArrowRightLeft size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p>No referrals issued yet. Refer a patient from the Triage tab.</p>
              </div>
            ) : (
              referrals.map(ref => {
                const stages = ['Created', 'Patient Reached', 'Consultation', 'Test', 'Treatment', 'Follow-up'];
                const curIdx = stages.indexOf(ref.current_stage || 'Created');
                const isStuck = ref.current_stage === 'Stuck - Follow-up Required' || (ref.current_stage === 'Created' && ref.status !== 'Completed');

                return (
                  <div 
                    key={ref.referral_id} 
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: isStuck ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge" style={{
                            background: ref.priority === 'Emergency' ? 'rgba(239, 68, 68, 0.2)' : ref.priority === 'Urgent' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            color: ref.priority === 'Emergency' ? '#F87171' : ref.priority === 'Urgent' ? '#FBBF24' : '#38BDF8',
                            fontWeight: 700
                          }}>
                            {ref.priority} Priority
                          </span>
                          <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                            Token: {ref.queue_token || 'Q-DH-042'}
                          </span>
                          <span className="badge badge-neutral">
                            Ref #{ref.referral_id}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', color: '#11322A', fontWeight: 800, marginTop: '0.4rem' }}>
                          {ref.patient_name} • {ref.reason}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          Destination: <b style={{ color: '#2DD4BF' }}>{ref.referred_facility_name}</b> • Specialist: <b>{ref.specialist_required || 'Gynecology & Obstetrics'}</b> • Tests: <b>{ref.required_tests || 'CBC, USG'}</b>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${isStuck ? 'badge-danger' : ref.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                          Stage: {ref.current_stage || 'Created'}
                        </span>
                        {ref.hours_elapsed && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {ref.hours_elapsed} hrs since referral
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6-Stage Visual Stepper */}
                    <div style={{ margin: '1.25rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          top: '13px',
                          left: '6%',
                          right: '6%',
                          height: '2px',
                          background: 'var(--border-subtle)',
                          zIndex: 1
                        }} />

                        {stages.map((st, sIdx) => {
                          const isDone = curIdx >= sIdx;
                          const isCurrent = curIdx === sIdx;
                          return (
                            <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isStuck && isCurrent ? '#EF4444' : isDone ? '#0D9488' : 'var(--color-bg-elevated)',
                                color: '#FFFFFF',
                                border: isCurrent ? '2px solid #2DD4BF' : '1px solid var(--border-strong)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: isDone ? '#FFFFFF' : 'var(--text-muted)', marginTop: '4px', textAlign: 'center', fontWeight: isCurrent ? 700 : 500 }}>
                                {st}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dropout Alert Box if patient hasn't reached */}
                    {isStuck && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #EF4444',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ color: '#F87171', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertTriangle size={16} /> ⚠️ Referral not completed – follow-up required!
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#FECACA', marginTop: '2px' }}>
                            Patient did not arrive at {ref.referred_facility_name}. Bottleneck: {ref.bottleneck_reason || 'Transport unavailable / patient delayed'}.
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleAshaFollowup(ref.referral_id, 'Conducted home visit. Arranged village transit.')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Log Home Visit
                          </button>
                          <button
                            onClick={() => handleAshaFollowup(ref.referral_id, 'Patient reached hospital OPD.', true)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', background: '#0D9488' }}
                          >
                            Mark Patient Reached
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Stage Transition Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      {ref.current_stage === 'Created' && (
                        <button 
                          onClick={() => handleProgressStage(ref.referral_id, 'Patient Reached')} 
                          className="btn btn-secondary btn-sm"
                        >
                          Check-in: Patient Reached
                        </button>
                      )}
                      {ref.current_stage === 'Patient Reached' && (
                        <button 
                          onClick={() => handleProgressStage(ref.referral_id, 'Consultation')} 
                          className="btn btn-secondary btn-sm"
                        >
                          Doctor Consultation Done
                        </button>
                      )}
                      {ref.current_stage === 'Consultation' && (
                        <button 
                          onClick={() => handleProgressStage(ref.referral_id, 'Test')} 
                          className="btn btn-secondary btn-sm"
                        >
                          Tests / Labs Completed
                        </button>
                      )}
                      {ref.current_stage === 'Test' && (
                        <button 
                          onClick={() => handleProgressStage(ref.referral_id, 'Treatment')} 
                          className="btn btn-secondary btn-sm"
                        >
                          Treatment Dispensed
                        </button>
                      )}
                      {ref.current_stage === 'Treatment' && (
                        <button 
                          onClick={() => handleProgressStage(ref.referral_id, 'Follow-up')} 
                          className="btn btn-primary btn-sm"
                        >
                          Mark Completed &amp; Back to PHC
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : ashaSubTab === 'pharmacy' ? (
        /* TAB 4: SUB-CENTRE PHARMACY & REQUISITIONS (Master Spec Sec 15) */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={22} color="#2DD4BF" /> Sub-Centre Essential Medicine Formulary &amp; Stock
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Authoritative Health Center stock balance and transactional replenishment requisitions (Section 15)
              </p>
            </div>
            <button
              onClick={() => setShowMedRequestModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Pill size={15} /> Request Stock Replenishment
            </button>
          </div>

          {/* Medicine Stock Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {medicines.map(m => {
              const isLow = m.quantity < 30;
              const isOut = m.quantity === 0;
              return (
                <div key={m.medicine_id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${isOut ? '#EF4444' : isLow ? '#F59E0B' : '#10B981'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#11322A' }}>{m.medicine_name}</span>
                    <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                      {isOut ? 'Stock Out' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Category: {m.category || 'Essential Drug List (EDL)'} &bull; {m.dosage_form || 'Tablet'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Available Stock</div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isOut ? '#EF4444' : '#11322A' }}>
                        {m.quantity} {m.unit || 'units'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setDispenseForm({
                            medicine_id: m.medicine_id,
                            medicine_name: m.medicine_name,
                            unit: m.unit || 'tablets',
                            quantity: Math.min(m.quantity, 10) || 1,
                            patient_id: patients[0]?.patient_id || '',
                            patient_name: patients[0]?.name || '',
                            notes: 'Dispensed during field visit'
                          });
                          setShowDispenseModal(true);
                        }}
                        disabled={isOut}
                        className="btn btn-sm"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.55rem',
                          background: isOut ? '#E2E8F0' : '#10B981',
                          color: isOut ? '#94A3B8' : '#FFFFFF',
                          border: 'none',
                          cursor: isOut ? 'not-allowed' : 'pointer',
                          fontWeight: 600
                        }}
                        title="Record giving medicine to a patient (auto decreases stock)"
                      >
                        Dispense
                      </button>

                      <button
                        onClick={() => {
                          setRestockForm({
                            medicine_id: m.medicine_id,
                            medicine_name: m.medicine_name,
                            facility_id: m.facility_id || 1,
                            quantity: 50,
                            unit: m.unit || 'tablets',
                            adjustment_type: 'add',
                            notes: 'Stock received from PHC'
                          });
                          setShowRestockModal(true);
                        }}
                        className="btn btn-sm"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.55rem',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#0284C7',
                          border: '1px solid #0284C7',
                          fontWeight: 600
                        }}
                        title="Manually adjust or add received stock"
                      >
                        + Stock
                      </button>

                      <button
                        onClick={() => {
                          setMedRequestForm({
                            medicine_id: m.medicine_id,
                            medicine_name: m.medicine_name,
                            quantity_requested: 100,
                            urgency: isOut ? 'Emergency' : isLow ? 'Urgent' : 'Routine',
                            notes: `Replenishment requisition for Sub-Centre stock (Current balance: ${m.quantity} ${m.unit || 'units'})`
                          });
                          setShowMedRequestModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                      >
                        Requisition
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Replenishment Requisitions Tracking Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A', marginBottom: '1rem' }}>
              Submitted Requisitions to District / Block Health Administration
            </h3>
            {medicineRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No replenishment requests currently active.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.5rem' }}>Req ID</th>
                      <th style={{ padding: '0.5rem' }}>Medicine</th>
                      <th style={{ padding: '0.5rem' }}>Qty</th>
                      <th style={{ padding: '0.5rem' }}>Urgency</th>
                      <th style={{ padding: '0.5rem' }}>Status</th>
                      <th style={{ padding: '0.5rem' }}>Requested Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicineRequests.map(r => (
                      <tr key={r.request_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{r.request_id}</td>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{r.medicine_name}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{r.quantity_requested}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <span className={`badge ${r.urgency === 'Emergency' ? 'badge-danger' : r.urgency === 'Urgent' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                            {r.urgency}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <span className={`badge ${r.status === 'Fulfilled' ? 'badge-success' : r.status === 'Approved' ? 'badge-info' : r.status === 'Rejected' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dispensing & Stock Transaction Audit Log (Requirement 6) */}
          <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={18} color="#10B981" /> Medicine Dispensing &amp; Stock Movement Log
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Automatic real-time ledger of medicines given to patients and stock replenishment received at this Sub-Centre.
            </p>
            {inventoryTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dispensing or restock activity logged yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.5rem' }}>Tx ID</th>
                      <th style={{ padding: '0.5rem' }}>Medicine</th>
                      <th style={{ padding: '0.5rem' }}>Type</th>
                      <th style={{ padding: '0.5rem' }}>Qty</th>
                      <th style={{ padding: '0.5rem' }}>Balance After</th>
                      <th style={{ padding: '0.5rem' }}>Recorded By</th>
                      <th style={{ padding: '0.5rem' }}>Notes / Patient</th>
                      <th style={{ padding: '0.5rem' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryTransactions.map(tx => (
                      <tr key={tx.transaction_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{tx.transaction_id}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>{tx.medicine_name}</td>
                        <td style={{ padding: '0.55rem 0.5rem' }}>
                          <span className={`badge ${tx.transaction_type === 'Dispensed' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, color: tx.transaction_type === 'Dispensed' ? '#EF4444' : '#10B981' }}>
                          {tx.transaction_type === 'Dispensed' ? `-${tx.quantity}` : `+${tx.quantity}`}
                        </td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700 }}>{tx.balance_after}</td>
                        <td style={{ padding: '0.55rem 0.5rem' }}>{tx.actor_name || 'ASHA Worker'}</td>
                        <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>{tx.notes}</td>
                        <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : ashaSubTab === 'grievances' ? (
        /* TAB 5: PATIENT GRIEVANCE REDRESSAL DESK (Requirement 4) */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={22} color="#FBBF24" /> Patient Grievance Registration &amp; Management Desk
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                ASHA Health Workers can log and track patient grievances regarding facilities, care quality, medicine availability, and staff conduct.
              </p>
            </div>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldAlert size={16} /> Lodge Patient Grievance
            </button>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A', marginBottom: '1rem' }}>
              Registered Village Grievance Tickets
            </h3>
            {complaintsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading grievance tickets...</p>
            ) : complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <CheckCircle2 size={36} color="#34D399" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ color: 'var(--text-muted)' }}>No grievances registered yet. Use the button above to lodge an issue on behalf of a villager.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Ticket ID</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Patient Name</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Type</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Facility / Jurisdiction</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Description</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Priority</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Administrative Response</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.complaint_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: '#38BDF8' }}>#{c.complaint_id}</td>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{c.patient_name || c.user_name || 'Village Patient'}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{c.complaint_type}</td>
                        <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>{c.facility_name || 'Sub-Centre / PHC'}</td>
                        <td style={{ padding: '0.6rem 0.5rem', maxWidth: '280px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>{c.description}</span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <span className={`badge ${c.priority === 'High' || c.priority === 'Urgent' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                            {c.priority || 'Normal'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : c.status === 'In Progress' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', maxWidth: '200px', fontSize: '0.78rem', color: c.admin_response ? '#34D399' : 'var(--text-muted)' }}>
                          {c.admin_response || 'Pending District Review'}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {c.created_at ? c.created_at.substring(0, 10) : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 1: COMMUNITY TRIAGE & VILLAGERS DIRECTORY */
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

                    <h3 style={{ fontSize: '1.15rem', color: '#11322A', fontWeight: 700, margin: '2px 0' }}>
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

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setVitalsPatient({
                            patient_id: c.patient_id || c.user_id,
                            name: c.patient_name,
                            age: c.patient_age,
                            gender: c.patient_gender
                          });
                          setShowVitalsModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ border: '1px solid #10B981', color: '#10B981', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Activity size={13} /> Send Vitals
                      </button>
                      <button
                        onClick={() => {
                          if (onOpenTelemed) {
                            onOpenTelemed({
                              doctorName: 'Dr. Rajesh Deshmukh',
                              facility: 'District General Hospital',
                              patientId: c.patient_id || c.user_id,
                              patientName: c.patient_name,
                              patientAge: c.patient_age,
                              patientGender: c.patient_gender,
                              incomingVitals: c.vitals
                            });
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ border: '1px solid #38BDF8', color: '#38BDF8', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Video size={13} /> Video Call
                      </button>
                      <a
                        href={`tel:${c.patient_phone}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Phone size={13} /> Call
                      </a>
                      <button
                        onClick={() => {
                          setRefPatient(c);
                          setRefForm({
                            ...refForm,
                            reason: c.symptoms ? c.symptoms.join(', ') : 'Urgent high-risk triage referral',
                            priority: 'Urgent',
                            clinical_summary: `AI Risk: ${c.ai_risk_level}. Vitals: Temp ${c.vitals?.temp || 'N/A'}, SpO2 ${c.vitals?.spo2 || 'N/A'}%`
                          });
                          setShowReferralModal(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <ArrowRightLeft size={13} /> Smart Refer
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
              <h2 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={20} color="#2DD4BF" /> Registered Village Patients
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Total: {patients.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patients.map(p => (
                <div key={p.patient_id || p.temp_id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#11322A', fontWeight: 700 }}>
                          {p.name}
                        </h3>
                        {p.is_offline && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            Local Offline
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {p.age} yrs • {p.gender} • Blood: <b style={{ color: '#F87171' }}>{p.blood_group}</b>
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Conditions: {p.existing_conditions || 'None reported'}
                      </p>
                      <div style={{ fontSize: '0.72rem', color: '#2DD4BF', fontFamily: 'monospace', marginTop: '2px' }}>
                        ID: {p.health_journey_id || `MH-RURAL-2026-${String(p.patient_id).padStart(4, '0')}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setVitalsPatient(p);
                          setShowVitalsModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', border: '1px solid #10B981', color: '#10B981' }}
                        title="Record & send vitals to doctor"
                      >
                        <Activity size={12} /> Vitals
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenTelemed) {
                            onOpenTelemed({
                              doctorName: 'Dr. Rajesh Deshmukh',
                              facility: 'District General Hospital',
                              patientId: p.patient_id,
                              patientName: p.name,
                              patientAge: p.age,
                              patientGender: p.gender
                            });
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', border: '1px solid #38BDF8', color: '#38BDF8' }}
                        title="Connect video call with doctor"
                      >
                        <Video size={12} /> Call
                      </button>

                      <button
                        onClick={() => {
                          setSelectedJourneyId(p.health_journey_id || `MH-RURAL-2026-${String(p.patient_id).padStart(4, '0')}`);
                          setShowQRJourney(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                        title="View Authorized Health Journey"
                      >
                        <QrCode size={12} /> Journey
                      </button>

                      <button
                        onClick={() => {
                          setRefPatient(p);
                          setShowReferralModal(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        Smart Refer
                      </button>
                    </div>
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
      )}

      {/* Field Patient Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Register Villager in Field</h3>
                <span style={{ fontSize: '0.78rem', color: !offlineStatus.isOnline ? '#F97316' : '#2DD4BF' }}>
                  {!offlineStatus.isOnline ? '📴 Offline Mode Active: Saving to local device queue' : '📶 Online Mode: Central cloud verification'}
                </span>
              </div>
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
                  {!offlineStatus.isOnline ? 'Save to Offline Queue' : 'Create Patient Record'}
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Referral Modal */}
      {showReferralModal && refPatient && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Generate Smart Referral</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient: <b>{refPatient.name || refPatient.patient_name}</b> ({refPatient.health_journey_id || 'MH-RURAL-2026-0001'})
                </p>
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
                  <label className="form-label">Destination Facility (Where to Go)</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Urgency &amp; Priority</label>
                  <select
                    className="form-select"
                    value={refForm.priority}
                    onChange={e => setRefForm({ ...refForm, priority: e.target.value })}
                  >
                    <option value="Routine">🟢 Routine (Within 3-5 days)</option>
                    <option value="Urgent">🟠 Urgent (Within 24 hours)</option>
                    <option value="Emergency">🔴 Emergency (Immediate transfer with ambulance)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Specialist Required</label>
                  <select
                    className="form-select"
                    value={refForm.specialist_required}
                    onChange={e => setRefForm({ ...refForm, specialist_required: e.target.value })}
                  >
                    <option value="Gynecology & Obstetrics">Gynecology &amp; Obstetrics</option>
                    <option value="Cardiology">Cardiology &amp; Emergency Medicine</option>
                    <option value="Pediatrics">Pediatrics &amp; Child Health</option>
                    <option value="General Medicine">General Medicine &amp; Physician</option>
                    <option value="Orthopedics">Orthopedics &amp; Trauma Care</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Reason for Referral (Why)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suspected high-risk pregnancy with elevated BP..."
                  value={refForm.reason}
                  onChange={e => setRefForm({ ...refForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Diagnostic Tests</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CBC, USG Pelvis, Urine Albumin, ECG..."
                  value={refForm.required_tests}
                  onChange={e => setRefForm({ ...refForm, required_tests: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Summary &amp; Vitals</label>
                <textarea
                  className="form-textarea"
                  placeholder="Vitals recorded, symptoms duration, medications already administered..."
                  value={refForm.clinical_summary}
                  onChange={e => setRefForm({ ...refForm, clinical_summary: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {!offlineStatus.isOnline ? 'Issue Offline Smart Referral' : 'Issue Smart Referral with Pre-booked Queue Token'}
                </button>
                <button type="button" onClick={() => setShowReferralModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine Replenishment Requisition Modal (Master Spec Sec 15) */}
      {showMedRequestModal && (
        <div className="modal-overlay" onClick={() => setShowMedRequestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800 }}>
                  Medicine Replenishment Requisition
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Dispatch stock demand to District / Block Drug Warehouse
                </p>
              </div>
              <button onClick={() => setShowMedRequestModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {medRequestMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.84rem' }}>
                {medRequestMsg}
              </div>
            )}

            <form onSubmit={handleSubmitMedicineRequest}>
              <div className="form-group">
                <label className="form-label">Select Medicine from Formulary</label>
                <select
                  className="form-select"
                  value={medRequestForm.medicine_id}
                  onChange={e => {
                    const selId = parseInt(e.target.value);
                    const selMed = medicines.find(m => m.medicine_id === selId);
                    setMedRequestForm({
                      ...medRequestForm,
                      medicine_id: selId,
                      medicine_name: selMed ? selMed.medicine_name : ''
                    });
                  }}
                  required
                >
                  {medicines.map(m => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.medicine_name} (Current Stock: {m.quantity} {m.unit || 'units'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity Required (Units)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={medRequestForm.quantity_requested}
                    onChange={e => setMedRequestForm({ ...medRequestForm, quantity_requested: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requisition Urgency</label>
                  <select
                    className="form-select"
                    value={medRequestForm.urgency}
                    onChange={e => setMedRequestForm({ ...medRequestForm, urgency: e.target.value })}
                  >
                    <option value="Routine">🟢 Routine Batch (5-7 days)</option>
                    <option value="Urgent">🟠 Urgent Stock-out (24-48 hrs)</option>
                    <option value="Emergency">🔴 Emergency / Epidemic (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Justification / Operational Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Seasonal spike in viral fever cases; current stock running under safety threshold..."
                  value={medRequestForm.notes}
                  onChange={e => setMedRequestForm({ ...medRequestForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Requisition to District
                </button>
                <button type="button" onClick={() => setShowMedRequestModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Grievance Registration Modal (Requirement 4) */}
      {showComplaintModal && (
        <div className="modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800 }}>
                  Lodge Patient Grievance
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Record official public healthcare grievance on behalf of a rural patient
                </p>
              </div>
              <button onClick={() => setShowComplaintModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {complaintMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.84rem' }}>
                {complaintMsg}
              </div>
            )}

            <form onSubmit={handleSubmitComplaint}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-select"
                  value={complaintForm.patient_id}
                  onChange={e => setComplaintForm({ ...complaintForm, patient_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Villager / Patient --</option>
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.name} ({p.age} Y • {p.gender} • ID: {p.health_journey_id || p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Grievance Category</label>
                  <select
                    className="form-select"
                    value={complaintForm.complaint_type}
                    onChange={e => setComplaintForm({ ...complaintForm, complaint_type: e.target.value })}
                    required
                  >
                    <option value="Medicine Shortage">Medicine Stock-out / Shortage</option>
                    <option value="Staff Behavior">Doctor / Staff Conduct</option>
                    <option value="Cleanliness">Facility Hygiene &amp; Sanitation</option>
                    <option value="Denial of Service">Denial of Emergency / OPD Care</option>
                    <option value="Overcharging">Overcharging / Unofficial Fee</option>
                    <option value="Delay in Care">Excessive Waiting / Delay in Care</option>
                    <option value="Ambulance Delay">Ambulance 108 Transit Delay</option>
                    <option value="Diagnostic Failure">Lab / Equipment Non-Functional</option>
                    <option value="Other">Other Operational Grievance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency / Severity</label>
                  <select
                    className="form-select"
                    value={complaintForm.priority}
                    onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                  >
                    <option value="Normal">🟢 Routine / Normal</option>
                    <option value="High">🟠 High Priority</option>
                    <option value="Urgent">🔴 Urgent Emergency</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Healthcare Facility / Center</label>
                <select
                  className="form-select"
                  value={complaintForm.facility_id}
                  onChange={e => setComplaintForm({ ...complaintForm, facility_id: parseInt(e.target.value) })}
                >
                  <option value="1">Khed Primary Health Centre (PHC)</option>
                  <option value="2">Pune District General Hospital</option>
                  <option value="3">Manchar Community Health Centre (CHC)</option>
                  <option value="4">Shirur Sub-District Hospital</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Grievance Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe the incident, issue encountered by the patient, date/time, and impact..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Official Grievance
                </button>
                <button type="button" onClick={() => setShowComplaintModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record & Transmit Patient Vitals Modal (Requirement 6) */}
      {showVitalsModal && (
        <div className="modal-overlay" onClick={() => setShowVitalsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="#10B981" /> Record &amp; Transmit Patient Vitals
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Patient: <b>{vitalsPatient?.name}</b> ({vitalsPatient?.age} yrs • {vitalsPatient?.gender})
                </p>
              </div>
              <button onClick={() => setShowVitalsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {vitalsMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.84rem' }}>
                {vitalsMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Body Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="e.g. 98.6"
                  value={vitalsForm.temperature}
                  onChange={e => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heart / Pulse Rate (BPM)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 76"
                  value={vitalsForm.heart_rate}
                  onChange={e => setVitalsForm({ ...vitalsForm, heart_rate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Pressure (Systolic / Diastolic)</label>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="120"
                    value={vitalsForm.systolic_bp}
                    onChange={e => {
                      const sys = e.target.value;
                      setVitalsForm({ ...vitalsForm, systolic_bp: sys, bp: `${sys}/${vitalsForm.diastolic_bp}` });
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="80"
                    value={vitalsForm.diastolic_bp}
                    onChange={e => {
                      const dia = e.target.value;
                      setVitalsForm({ ...vitalsForm, diastolic_bp: dia, bp: `${vitalsForm.systolic_bp}/${dia}` });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Oxygen Saturation - SpO₂ (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 98"
                  value={vitalsForm.spo2}
                  onChange={e => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 18"
                  value={vitalsForm.respiratory_rate}
                  onChange={e => setVitalsForm({ ...vitalsForm, respiratory_rate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Glucose (mg/dL - Optional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 110"
                  value={vitalsForm.blood_sugar}
                  onChange={e => setVitalsForm({ ...vitalsForm, blood_sugar: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Field Clinical Observations / Symptoms</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Observed pallor, shortness of breath, dehydration, active complaints..."
                value={vitalsForm.notes}
                onChange={e => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={transmittingVitals}
                onClick={() => handleTransmitVitals(false)}
                className="btn btn-secondary"
                style={{ flex: 1, border: '1px solid #10B981', color: '#10B981' }}
              >
                💾 Save &amp; Transmit Vitals
              </button>

              <button
                type="button"
                disabled={transmittingVitals}
                onClick={() => handleTransmitVitals(true)}
                className="btn btn-primary"
                style={{ flex: 1.2, background: 'linear-gradient(135deg, #0D9488 0%, #0284C7 100%)' }}
              >
                <Video size={16} /> Transmit &amp; Video Call Doctor
              </button>

              <button
                type="button"
                onClick={() => setShowVitalsModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispense Medicine to Patient Modal (Requirement 6) */}
      {showDispenseModal && (
        <div className="modal-overlay" onClick={() => setShowDispenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Pill size={20} color="#10B981" /> Dispense Medicine to Patient
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Record medicine distribution. Available Sub-Centre stock will automatically decrease.
                </p>
              </div>
              <button onClick={() => setShowDispenseModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {dispenseMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.84rem' }}>
                {dispenseMsg}
              </div>
            )}

            <form onSubmit={handleDispenseMedicine}>
              <div className="form-group">
                <label className="form-label">Medicine</label>
                <input
                  type="text"
                  className="form-input"
                  value={dispenseForm.medicine_name}
                  disabled
                  style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Patient</label>
                <select
                  className="form-select"
                  value={dispenseForm.patient_id}
                  onChange={e => {
                    const pid = e.target.value;
                    const pat = patients.find(p => String(p.patient_id) === pid);
                    setDispenseForm({
                      ...dispenseForm,
                      patient_id: pid,
                      patient_name: pat ? pat.name : ''
                    });
                  }}
                  required
                >
                  <option value="">-- Select Patient from Village --</option>
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.name} ({p.age} yrs • {p.gender} • ID: {p.health_journey_id || p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity to Dispense</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={dispenseForm.quantity}
                    onChange={e => setDispenseForm({ ...dispenseForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Type</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dispenseForm.unit || 'units'}
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Reason for Giving</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1 tab thrice daily after meals for acute fever"
                  value={dispenseForm.notes}
                  onChange={e => setDispenseForm({ ...dispenseForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  disabled={dispensingLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#10B981' }}
                >
                  {dispensingLoading ? 'Recording...' : 'Confirm & Dispense Medicine'}
                </button>
                <button type="button" onClick={() => setShowDispenseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manually Adjust / Add Stock Modal (Requirement 6) */}
      {showRestockModal && (
        <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={20} color="#0284C7" /> Add / Adjust Medicine Stock
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Record newly received medicine supplies or calibrate inventory count.
                </p>
              </div>
              <button onClick={() => setShowRestockModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {restockMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.84rem' }}>
                {restockMsg}
              </div>
            )}

            <form onSubmit={handleAdjustStock}>
              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={restockForm.medicine_name}
                  onChange={e => setRestockForm({ ...restockForm, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg, Amoxicillin 500mg..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={restockForm.quantity}
                    onChange={e => setRestockForm({ ...restockForm, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Packaging Unit</label>
                  <select
                    className="form-select"
                    value={restockForm.unit}
                    onChange={e => setRestockForm({ ...restockForm, unit: e.target.value })}
                  >
                    <option value="tablets">tablets</option>
                    <option value="strips">strips</option>
                    <option value="bottles">bottles</option>
                    <option value="vials">vials</option>
                    <option value="sachets">sachets</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Source / Supply Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Received monthly replenishment batch from Khed PHC"
                  value={restockForm.notes}
                  onChange={e => setRestockForm({ ...restockForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  disabled={restockLoading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {restockLoading ? 'Updating...' : 'Confirm Stock Receipt'}
                </button>
                <button type="button" onClick={() => setShowRestockModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Health Worker Copilot Modal */}
      <SmartHealthWorkerCopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        onPrepopulateReferral={(prefill) => {
          setRefForm(prev => ({
            ...prev,
            reason: prefill.reason,
            priority: prefill.priority,
            specialist_required: prefill.specialist_required,
            required_tests: prefill.required_tests,
            clinical_summary: prefill.clinical_summary
          }));
          if (patients.length > 0) {
            setRefPatient(patients[0]);
          }
          setShowReferralModal(true);
        }}
      />

      {/* QR Journey Explorer Modal */}
      <QRJourneyModal
        isOpen={showQRJourney}
        initialJourneyId={selectedJourneyId}
        onClose={() => setShowQRJourney(false)}
      />

    </div>
  );
}
