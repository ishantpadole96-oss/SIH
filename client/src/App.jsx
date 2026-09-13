import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { CallModal } from './components/CallModal';

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
import { AshaDashboard } from './pages/AshaDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MaharashtraServices } from './pages/MaharashtraServices';
import { TelemedicineHub } from './pages/TelemedicineHub';

import TelemedicineRoom from './components/TelemedicineRoom';
import DigitalHealthCard from './components/DigitalHealthCard';
import QRJourneyModal from './components/QRJourneyModal';
import SmartHealthWorkerCopilot from './components/SmartHealthWorkerCopilot';

function AppContent() {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('landing');
  const [viewingRole, setViewingRole] = useState(role || 'citizen');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPreselectedRole, setAuthPreselectedRole] = useState(null);
  const [showTelemedModal, setShowTelemedModal] = useState(false);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [showQRJourneyModal, setShowQRJourneyModal] = useState(false);
  const [journeyIdForModal, setJourneyIdForModal] = useState('MH-RURAL-2026-0001');
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);

  // Call Modal State
  const [showCallModal, setShowCallModal] = useState(false);
  const [callParams, setCallParams] = useState({
    calleeName: '', calleePhone: '', calleeFacility: '', calleeRole: ''
  });

  // Pending portal navigation after auth
  const [pendingPortal, setPendingPortal] = useState(null);

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

  // Open call modal
  const handleOpenCall = (params = {}) => {
    setCallParams({
      calleeName: params.name || 'Unknown',
      calleePhone: params.phone || 'N/A',
      calleeFacility: params.facility || '',
      calleeRole: params.role || ''
    });
    setShowCallModal(true);
  };

  const handleSelectPortal = (selectedRole, targetTab) => {
    // Gate: require authentication before entering any portal
    if (!user) {
      setPendingPortal({ role: selectedRole, tab: targetTab });
      setAuthPreselectedRole(selectedRole);
      setShowAuthModal(true);
      return;
    }

    setViewingRole(selectedRole);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // After auth modal closes, check if there was a pending portal navigation
  const handleAuthClose = () => {
    setShowAuthModal(false);

    if (pendingPortal) {
      // User just logged in, navigate to the portal
      setTimeout(() => {
        setViewingRole(pendingPortal.role);
        setActiveTab(pendingPortal.tab);
        setPendingPortal(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Render appropriate view based on activeTab
  const renderView = () => {
    switch (activeTab) {
      case 'home':
      case 'citizen':
        return (
          <CitizenHome
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
            onOpenCall={handleOpenCall}
          />
        );
      case 'telemedicine':
        return (
          <TelemedicineHub
            setActiveTab={setActiveTab}
            onOpenTelemed={handleOpenTelemed}
            onOpenCall={handleOpenCall}
          />
        );
      case 'facilities':
      case 'rural-map':
        return (
          <FacilityFinder
            setActiveTab={setActiveTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
            onOpenCall={handleOpenCall}
          />
        );
      case 'availability':
        return (
          <HospitalAvailability
            setActiveTab={setActiveTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
            onOpenCall={handleOpenCall}
          />
        );
      case 'screening':
        return (
          <AIScreening
            setActiveTab={setActiveTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
          />
        );
      case 'book-appointment':
        return (
          <BookAppointment
            setActiveTab={setActiveTab}
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
            setActiveTab={setActiveTab}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
          />
        );
      case 'asha-dashboard':
        return <AshaDashboard setActiveTab={setActiveTab} onOpenCall={handleOpenCall} />;
      case 'doctor-dashboard':
        return (
          <DoctorDashboard
            setActiveTab={setActiveTab}
            onOpenTelemed={handleOpenTelemed}
            onOpenCall={handleOpenCall}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard onOpenCall={handleOpenCall} />;
      default:
        return (
          <CitizenHome
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={handleOpenTelemed}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
            onOpenCall={handleOpenCall}
          />
        );
    }
  };

  // IF ON PUBLIC LANDING PAGE: Show Full-Width Government Portal (No Sidebar!)
  if (activeTab === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', flexDirection: 'column' }}>
        <LandingNavbar
          onSelectPortal={handleSelectPortal}
          onOpenEmergency={() => setShowEmergencyModal(true)}
          onOpenAuth={() => {
            setAuthPreselectedRole(null);
            setShowAuthModal(true);
          }}
        />
        
        <main style={{ flex: 1 }}>
          <LandingPage
            onSelectPortal={handleSelectPortal}
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
            <span>{t('footer_hackathon_tag')}</span>
          </div>
        </footer>

        {/* Emergency Modal */}
        <EmergencyModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          preselectedRole={authPreselectedRole}
        />

        {/* Call Modal */}
        <CallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          {...callParams}
        />

        {/* QR Journey Modal */}
        <QRJourneyModal
          isOpen={showQRJourneyModal}
          onClose={() => setShowQRJourneyModal(false)}
          initialJourneyId={journeyIdForModal}
        />

        {/* Smart Copilot Modal */}
        <SmartHealthWorkerCopilot
          isOpen={showCopilotModal}
          onClose={() => setShowCopilotModal(false)}
          onSelectTriage={(triage) => {
            setShowCopilotModal(false);
            setActiveTab('screening');
          }}
        />
      </div>
    );
  }

  // IF INSIDE A DEDICATED PANEL WORKSPACE: Show Partitioned Panel Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7F5' }}>
      
      {/* Partitioned Panel Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewingRole={viewingRole}
        setViewingRole={setViewingRole}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        onOpenTelemed={() => setShowTelemedModal(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <TopHeader
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          onOpenAuth={() => {
            setAuthPreselectedRole(null);
            setShowAuthModal(true);
          }}
          onOpenJourneyScanner={() => {
            setJourneyIdForModal('MH-RURAL-2026-0001');
            setShowQRJourneyModal(true);
          }}
          onOpenCopilot={() => setShowCopilotModal(true)}
        />

        {/* Dynamic Page View */}
        <main style={{ flex: 1, paddingTop: '0.5rem' }}>
          {renderView()}
        </main>

        {/* Clean, Subtle Government Footer */}
        <footer style={{
          borderTop: '1px solid #E5ECE7',
          padding: '1.5rem 2rem',
          background: 'transparent',
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
            <span>{t('footer_trilingual_tag')}</span>
          </div>
        </footer>

      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        preselectedRole={authPreselectedRole}
      />

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        {...callParams}
      />

      {/* Virtual Telemedicine Consultation Room */}
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

      {/* National Digital Health ID Card (ABHA-style) */}
      {showHealthCardModal && (
        <DigitalHealthCard
          onClose={() => setShowHealthCardModal(false)}
          onOpenJourney={(id) => {
            setJourneyIdForModal(id);
            setShowQRJourneyModal(true);
          }}
        />
      )}

      {/* Authorized Digital Health Journey Modal */}
      <QRJourneyModal
        isOpen={showQRJourneyModal}
        initialJourneyId={journeyIdForModal}
        onClose={() => setShowQRJourneyModal(false)}
      />

      {/* Smart Health Worker Copilot */}
      <SmartHealthWorkerCopilot
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        onOpenTelemed={handleOpenTelemed}
        onPrepopulateReferral={() => {
          setActiveTab('asha-dashboard');
        }}
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
