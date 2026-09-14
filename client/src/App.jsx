import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TopHeader } from './components/TopHeader';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { CallModal } from './components/CallModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';

import { LandingNavbar } from './components/LandingNavbar';
import { LandingPage } from './pages/LandingPage';
import { CitizenHome } from './pages/CitizenHome';
import { FacilityFinder } from './pages/FacilityFinder';
import { HospitalAvailability } from './pages/HospitalAvailability';
import { AIScreening } from './pages/AIScreening';
import { BookAppointment } from './pages/BookAppointment';
import { MyRecordsAndReferrals } from './pages/MyRecordsAndReferrals';
import { MedicineSearch } from './pages/MedicineSearch';
import { HealthCamps } from './pages/HealthCamps';
import { FeedbackAndComplaints } from './pages/FeedbackAndComplaints';
import { MaharashtraServices } from './pages/MaharashtraServices';
import { TelemedicineHub } from './pages/TelemedicineHub';
import { AshaDashboard } from './pages/AshaDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PortalLoginPage } from './pages/PortalLoginPage';

import TelemedicineRoom from './components/TelemedicineRoom';
import DigitalHealthCard from './components/DigitalHealthCard';
import QRJourneyModal from './components/QRJourneyModal';
import SmartHealthWorkerCopilot from './components/SmartHealthWorkerCopilot';

import { 
  Home, MapPin, Sparkles, Calendar, Pill, Activity, FileText, 
  MessageSquare, Video, ShieldAlert, LogOut, ArrowLeft, Shield,
  Stethoscope, Building2, HeartPulse, Users, Bed, Check, ExternalLink
} from 'lucide-react';

function AppContent() {
  const { user, role, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();

  // URL Hash-based portal separation
  // Supported portals: 'landing' | 'citizen' | 'doctor' | 'asha' | 'admin' | 'login'
  const getInitialPortal = () => {
    if (typeof window === 'undefined') return 'landing';
    const hash = window.location.hash.replace('#/', '').toLowerCase();
    if (['citizen', 'doctor', 'asha', 'admin'].includes(hash)) {
      return hash;
    }
    if (hash.startsWith('login')) {
      return 'login';
    }
    return 'landing';
  };

  const [currentPortal, setCurrentPortal] = useState(getInitialPortal);
  const [loginPortalRole, setLoginPortalRole] = useState('citizen');
  const [citizenTab, setCitizenTab] = useState('home');

  // Listen for hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').toLowerCase();
      if (['citizen', 'doctor', 'asha', 'admin'].includes(hash)) {
        setCurrentPortal(hash);
      } else if (hash.startsWith('login')) {
        const parts = hash.split('/');
        setLoginPortalRole(parts[1] || 'citizen');
        setCurrentPortal('login');
      } else if (!hash || hash === 'landing') {
        setCurrentPortal('landing');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigatePortal = (targetRole, defaultTab = null) => {
    window.location.hash = `#/${targetRole}`;
    setCurrentPortal(targetRole);
    if (targetRole === 'citizen' && defaultTab) {
      setCitizenTab(defaultTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals & Calls
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showTelemedModal, setShowTelemedModal] = useState(false);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [showQRJourneyModal, setShowQRJourneyModal] = useState(false);
  const [journeyIdForModal, setJourneyIdForModal] = useState('MH-RURAL-2026-0001');
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);

  const [showCallModal, setShowCallModal] = useState(false);
  const [callParams, setCallParams] = useState({
    calleeName: '', calleePhone: '', calleeFacility: '', calleeRole: ''
  });

  const [telemedParams, setTelemedParams] = useState({
    doctorName: 'Dr. Rajesh Deshmukh',
    specialty: 'General Medicine & Family Health',
    facility: 'Govt PHC Khedgaon • Pune District Civil Hospital',
    patientName: ''
  });

  const handleOpenTelemed = (params = {}) => {
    if (params && typeof params === 'object') {
      setTelemedParams(prev => ({ ...prev, ...params }));
    }
    setShowTelemedModal(true);
  };

  const handleOpenCall = (params = {}) => {
    setCallParams({
      calleeName: params.name || 'Unknown',
      calleePhone: params.phone || 'N/A',
      calleeFacility: params.facility || '',
      calleeRole: params.role || ''
    });
    setShowCallModal(true);
  };

  // Citizen Navigation Tabs
  const citizenNavItems = [
    { id: 'home', label: t('nav_overview'), icon: <Home size={16} /> },
    { id: 'facilities', label: 'Find Hospitals & Map', icon: <MapPin size={16} /> },
    { id: 'telemedicine', label: 'Consult Doctor (Video)', icon: <Video size={16} /> },
    { id: 'screening', label: 'AI Health Screening', icon: <Sparkles size={16} /> },
    { id: 'availability', label: 'Live Bed Census', icon: <Bed size={16} /> },
    { id: 'book-appointment', label: 'Book OPD Slot', icon: <Calendar size={16} /> },
    { id: 'records-referrals', label: 'ABHA & Health Records', icon: <FileText size={16} /> },
    { id: 'medicines', label: 'Jan Aushadhi Generic Medicines', icon: <Pill size={16} /> },
    { id: 'camps', label: 'Health Camps', icon: <Activity size={16} /> },
    { id: 'complaints', label: 'Grievances', icon: <MessageSquare size={16} /> }
  ];

  const renderCitizenContent = () => {
    switch (citizenTab) {
      case 'home':
        return (
          <CitizenHome
            setActiveTab={(tab) => {
              if (tab === 'facilities' || tab === 'screening' || tab === 'availability' || tab === 'telemedicine' || tab === 'book-appointment' || tab === 'medicines' || tab === 'camps' || tab === 'complaints') {
                setCitizenTab(tab);
              } else if (tab === 'doctor-dashboard') {
                navigatePortal('doctor');
              } else if (tab === 'asha-dashboard') {
                navigatePortal('asha');
              } else if (tab === 'admin-dashboard') {
                navigatePortal('admin');
              } else {
                setCitizenTab(tab);
              }
            }}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
            onOpenCall={handleOpenCall}
          />
        );
      case 'facilities':
      case 'rural-map':
        return (
          <FacilityFinder
            setActiveTab={setCitizenTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
            onOpenCall={handleOpenCall}
          />
        );
      case 'telemedicine':
        return (
          <TelemedicineHub
            setActiveTab={setCitizenTab}
            onOpenTelemed={handleOpenTelemed}
            onOpenCall={handleOpenCall}
          />
        );
      case 'screening':
        return (
          <AIScreening
            setActiveTab={setCitizenTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
          />
        );
      case 'availability':
        return (
          <HospitalAvailability
            setActiveTab={setCitizenTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
            onOpenCall={handleOpenCall}
          />
        );
      case 'book-appointment':
        return (
          <BookAppointment
            setActiveTab={setCitizenTab}
            preselectedFacility={selectedFacilityForBooking}
            onOpenTelemed={handleOpenTelemed}
          />
        );
      case 'records-referrals':
        return (
          <MyRecordsAndReferrals
            initialTab="records"
            onOpenTelemed={handleOpenTelemed}
          />
        );
      case 'medicines':
        return <MedicineSearch />;
      case 'camps':
        return <HealthCamps />;
      case 'complaints':
        return <FeedbackAndComplaints />;
      case 'services':
        return (
          <MaharashtraServices
            setActiveTab={setCitizenTab}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
          />
        );
      default:
        return (
          <CitizenHome
            setActiveTab={setCitizenTab}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
            onOpenCall={handleOpenCall}
          />
        );
    }
  };

  // =========================================================================
  // 1. DEDICATED LOGIN PAGE ROUTE
  // =========================================================================
  if (currentPortal === 'login') {
    return (
      <PortalLoginPage
        portalRole={loginPortalRole}
        onLoginSuccess={() => navigatePortal(loginPortalRole)}
        onBackToLanding={() => navigatePortal('landing')}
      />
    );
  }

  // =========================================================================
  // 2. PUBLIC LANDING PAGE
  // =========================================================================
  if (currentPortal === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', flexDirection: 'column' }}>
        <IncomingCallBanner onAcceptCall={(call) => {
          handleOpenCall({ 
            name: call.caller_name || 'RuralCare Patient', 
            phone: call.callee_phone, 
            facility: call.callee_facility,
            role: call.caller_role 
          });
        }} />

        <LandingNavbar
          onSelectPortal={(roleToOpen) => navigatePortal(roleToOpen)}
          onOpenEmergency={() => setShowEmergencyModal(true)}
          onOpenAuth={() => {
            setLoginPortalRole('citizen');
            setCurrentPortal('login');
          }}
        />
        
        <main style={{ flex: 1 }}>
          <LandingPage
            onSelectPortal={(roleToOpen) => navigatePortal(roleToOpen)}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenJourneyScanner={() => {
              setJourneyIdForModal('MH-RURAL-2026-0001');
              setShowQRJourneyModal(true);
            }}
            onOpenCopilot={() => setShowCopilotModal(true)}
          />
        </main>

        <footer style={{
          borderTop: '1px solid #E5ECE7',
          padding: '2rem 3rem',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#52786D'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/ruralcare-mark.png" alt="RuralCare" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, color: '#11322A' }}>{t('footer_gov_notice')}</span>
          </div>
          <div>
            <span>Smart India Hackathon (SIH) • Government of Maharashtra Health Portal</span>
          </div>
        </footer>

        <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
        <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} onEscalateVideo={() => handleOpenTelemed({ doctorName: callParams.calleeName || 'Dr. Rajesh Deshmukh', facility: callParams.calleeFacility })} {...callParams} />
        <QRJourneyModal isOpen={showQRJourneyModal} onClose={() => setShowQRJourneyModal(false)} initialJourneyId={journeyIdForModal} />
        <SmartHealthWorkerCopilot isOpen={showCopilotModal} onClose={() => setShowCopilotModal(false)} onSelectTriage={() => navigatePortal('citizen', 'screening')} />
      </div>
    );
  }

  // =========================================================================
  // 3. DOCTOR PORTAL PAGE (Dedicated View)
  // =========================================================================
  if (currentPortal === 'doctor') {
    // If not authenticated as doctor, show Doctor Login Page
    if (!user || user.role !== 'doctor') {
      return (
        <PortalLoginPage
          portalRole="doctor"
          onLoginSuccess={() => navigatePortal('doctor')}
          onBackToLanding={() => navigatePortal('landing')}
        />
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        <IncomingCallBanner onAcceptCall={(call) => {
          handleOpenCall({ 
            name: call.caller_name || 'RuralCare Patient', 
            phone: call.callee_phone, 
            facility: call.callee_facility,
            role: call.caller_role 
          });
        }} />

        {/* Dedicated Doctor Top Header */}
        <header style={{
          background: '#0F172A',
          color: '#FFFFFF',
          borderBottom: '1px solid #1E293B',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Medical Officer Clinical Console</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>OPD DESK</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Government of Maharashtra • Directorate of Health Services
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#1E293B', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#E2E8F0' }}>
                👨‍⚕️ <b>{user.name || 'Dr. Rajesh Deshmukh'}</b> <span style={{ color: '#64748B' }}>• MMC-2018-09214</span>
              </div>

              <button
                onClick={() => handleOpenTelemed({
                  doctorName: user.name || 'Dr. Rajesh Deshmukh',
                  specialty: 'Govt Medical Officer',
                  facility: 'PHC Khedgaon • Pune'
                })}
                className="btn btn-sm"
                style={{ background: '#0D9488', color: '#FFFFFF', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Video size={14} /> Video Chamber
              </button>

              <button
                onClick={() => navigatePortal('landing')}
                className="btn btn-sm btn-secondary"
                style={{ background: '#334155', color: '#F1F5F9', border: 'none' }}
              >
                <ArrowLeft size={14} /> Portal Directory
              </button>

              <button
                onClick={() => {
                  logout();
                  navigatePortal('landing');
                }}
                className="btn btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: 'none' }}
              >
                <LogOut size={14} /> Exit
              </button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <DoctorDashboard
            setActiveTab={navigatePortal}
            onOpenTelemed={handleOpenTelemed}
            onOpenCall={handleOpenCall}
          />
        </main>

        <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
        <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} onEscalateVideo={() => handleOpenTelemed({ doctorName: callParams.calleeName || 'Dr. Rajesh Deshmukh', facility: callParams.calleeFacility })} {...callParams} />
        {showTelemedModal && <TelemedicineRoom {...telemedParams} onClose={() => setShowTelemedModal(false)} />}
      </div>
    );
  }

  // =========================================================================
  // 4. ASHA WORKER PORTAL PAGE (Dedicated View)
  // =========================================================================
  if (currentPortal === 'asha') {
    // If not authenticated as asha, show ASHA Login Page
    if (!user || user.role !== 'asha') {
      return (
        <PortalLoginPage
          portalRole="asha"
          onLoginSuccess={() => navigatePortal('asha')}
          onBackToLanding={() => navigatePortal('landing')}
        />
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#FFF1F2', display: 'flex', flexDirection: 'column' }}>
        <IncomingCallBanner onAcceptCall={(call) => {
          handleOpenCall({ 
            name: call.caller_name || 'RuralCare Patient', 
            phone: call.callee_phone, 
            facility: call.callee_facility,
            role: call.caller_role 
          });
        }} />

        {/* Dedicated ASHA Top Header */}
        <header style={{
          background: '#881337',
          color: '#FFFFFF',
          borderBottom: '1px solid #9F1239',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>ASHA Community Health Console</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>FIELD WORKER</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#FECDD3' }}>
                  National Rural Health Mission • Maharashtra State Community Cadre
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#9F1239', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#FFF1F2' }}>
                👩‍⚕️ <b>{user.name || 'Sunita Bai'}</b> <span style={{ color: '#FDA4AF' }}>• ASHA Jurisdiction: Khed Sub-Centre</span>
              </div>

              <button
                onClick={() => navigatePortal('landing')}
                className="btn btn-sm"
                style={{ background: '#BE123C', color: '#FFFFFF', border: 'none' }}
              >
                <ArrowLeft size={14} /> Portal Directory
              </button>

              <button
                onClick={() => {
                  logout();
                  navigatePortal('landing');
                }}
                className="btn btn-sm"
                style={{ background: 'rgba(0,0,0,0.25)', color: '#FFFFFF', border: 'none' }}
              >
                <LogOut size={14} /> Exit
              </button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <AshaDashboard
            setActiveTab={navigatePortal}
            onOpenCall={handleOpenCall}
          />
        </main>

        <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
        <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} onEscalateVideo={() => handleOpenTelemed({ doctorName: callParams.calleeName || 'Dr. Rajesh Deshmukh', facility: callParams.calleeFacility })} {...callParams} />
        {showTelemedModal && <TelemedicineRoom {...telemedParams} onClose={() => setShowTelemedModal(false)} />}
      </div>
    );
  }

  // =========================================================================
  // 5. ADMIN COMMAND PORTAL PAGE (Dedicated View)
  // =========================================================================
  if (currentPortal === 'admin') {
    // If not authenticated as admin, show Admin Login Page
    if (!user || user.role !== 'admin') {
      return (
        <PortalLoginPage
          portalRole="admin"
          onLoginSuccess={() => navigatePortal('admin')}
          onBackToLanding={() => navigatePortal('landing')}
        />
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#FEF3C7', display: 'flex', flexDirection: 'column' }}>
        <IncomingCallBanner onAcceptCall={(call) => {
          handleOpenCall({ 
            name: call.caller_name || 'RuralCare Patient', 
            phone: call.callee_phone, 
            facility: call.callee_facility,
            role: call.caller_role 
          });
        }} />

        {/* Dedicated Admin Top Header */}
        <header style={{
          background: '#451A03',
          color: '#FFFFFF',
          borderBottom: '1px solid #78350F',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Health Directorate GIS Command Center</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>36 DISTRICTS</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#FDE68A' }}>
                  Public Health Department • Government of Maharashtra
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#78350F', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#FEF3C7' }}>
                🏛️ <b>{user.name || 'Director of Public Health'}</b> <span style={{ color: '#FDE68A' }}>• State Administrator</span>
              </div>

              <button
                onClick={() => navigatePortal('landing')}
                className="btn btn-sm"
                style={{ background: '#B45309', color: '#FFFFFF', border: 'none' }}
              >
                <ArrowLeft size={14} /> Portal Directory
              </button>

              <button
                onClick={() => {
                  logout();
                  navigatePortal('landing');
                }}
                className="btn btn-sm"
                style={{ background: 'rgba(0,0,0,0.3)', color: '#FFFFFF', border: 'none' }}
              >
                <LogOut size={14} /> Exit
              </button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <AdminDashboard onOpenCall={handleOpenCall} />
        </main>

        <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
        <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} onEscalateVideo={() => handleOpenTelemed({ doctorName: callParams.calleeName || 'Dr. Rajesh Deshmukh', facility: callParams.calleeFacility })} {...callParams} />
      </div>
    );
  }

  // =========================================================================
  // 6. CITIZEN & PATIENT PORTAL PAGE (Dedicated View)
  // =========================================================================
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F5', display: 'flex', flexDirection: 'column' }}>
      <IncomingCallBanner onAcceptCall={(call) => {
        handleOpenCall({ 
          name: call.caller_name || 'RuralCare Patient', 
          phone: call.callee_phone, 
          facility: call.callee_facility,
          role: call.caller_role 
        });
      }} />

      {/* Dedicated Citizen Portal Header */}
      <TopHeader
        onToggleMobileSidebar={() => {}}
        onOpenAuth={() => {
          setLoginPortalRole('citizen');
          setCurrentPortal('login');
        }}
        onOpenJourneyScanner={() => {
          setJourneyIdForModal('MH-RURAL-2026-0001');
          setShowQRJourneyModal(true);
        }}
        onOpenCopilot={() => setShowCopilotModal(true)}
      />

      {/* Citizen Sub-Navigation Strip */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2ECE5',
        position: 'sticky',
        top: '64px',
        zIndex: 90,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.4rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {citizenNavItems.map(item => {
              const isActive = citizenTab === item.id || (item.id === 'facilities' && citizenTab === 'rural-map');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCitizenTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0D9488' : '#475569',
                    background: isActive ? '#E8F5EE' : 'transparent',
                    border: isActive ? '1px solid #A7DBBB' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowEmergencyModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#DC2626',
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                cursor: 'pointer'
              }}
            >
              <ShieldAlert size={15} />
              <span>SOS 108</span>
            </button>

            <button
              onClick={() => navigatePortal('landing')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                cursor: 'pointer'
              }}
              title="Return to Government Landing Page"
            >
              <ArrowLeft size={14} />
              <span>All Portals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Citizen Content */}
      <main style={{ flex: 1, padding: '1.5rem 1rem 3rem 1rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {renderCitizenContent()}
      </main>

      {/* Government Footer */}
      <footer style={{
        borderTop: '1px solid #E5ECE7',
        padding: '1.5rem 2rem',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: '#6B7280'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="/ruralcare-mark.png" alt="RuralCare" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          <span>{t('footer_gov_platform')}</span>
        </div>
        <div>
          <span>National Digital Health Mission (NDHM) • Government of Maharashtra</span>
        </div>
      </footer>

      {/* Global Modals */}
      <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
      <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} onEscalateVideo={() => handleOpenTelemed({ doctorName: callParams.calleeName || 'Dr. Rajesh Deshmukh', facility: callParams.calleeFacility })} {...callParams} />
      
      {showTelemedModal && (
        <TelemedicineRoom
          doctorName={telemedParams.doctorName}
          specialty={telemedParams.specialty}
          facility={telemedParams.facility}
          patientName={telemedParams.patientName}
          initialMode={telemedParams.initialMode || 'video'}
          onClose={() => setShowTelemedModal(false)}
        />
      )}

      {showHealthCardModal && (
        <DigitalHealthCard
          onClose={() => setShowHealthCardModal(false)}
          onOpenJourney={(id) => {
            setJourneyIdForModal(id);
            setShowQRJourneyModal(true);
          }}
        />
      )}

      <QRJourneyModal isOpen={showQRJourneyModal} initialJourneyId={journeyIdForModal} onClose={() => setShowQRJourneyModal(false)} />
      
      <SmartHealthWorkerCopilot
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        onOpenTelemed={handleOpenTelemed}
        onPrepopulateReferral={() => navigatePortal('asha')}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
