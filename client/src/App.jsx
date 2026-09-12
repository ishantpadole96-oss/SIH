import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';

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

import TelemedicineRoom from './components/TelemedicineRoom';
import DigitalHealthCard from './components/DigitalHealthCard';

function AppContent() {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home');
  const [viewingRole, setViewingRole] = useState(role || 'citizen');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTelemedModal, setShowTelemedModal] = useState(false);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);

  // Render appropriate view based on activeTab
  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <CitizenHome
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={() => setShowTelemedModal(true)}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
          />
        );
      case 'facilities':
      case 'rural-map':
        return (
          <FacilityFinder
            setActiveTab={setActiveTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
          />
        );
      case 'availability':
        return (
          <HospitalAvailability
            setActiveTab={setActiveTab}
            setSelectedFacilityForBooking={setSelectedFacilityForBooking}
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
          />
        );
      case 'records-referrals':
        return <MyRecordsAndReferrals initialTab="records" />;
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
            onOpenTelemed={() => setShowTelemedModal(true)}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
          />
        );
      case 'asha-dashboard':
        return <AshaDashboard setActiveTab={setActiveTab} />;
      case 'doctor-dashboard':
        return <DoctorDashboard setActiveTab={setActiveTab} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return (
          <CitizenHome
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onOpenTelemed={() => setShowTelemedModal(true)}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7F5' }}>
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewingRole={viewingRole}
        setViewingRole={setViewingRole}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <TopHeader
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          onOpenAuth={() => setShowAuthModal(true)}
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
            <span>RuralCare · Maharashtra Government Public Healthcare Platform</span>
          </div>
          <div>
            <span>Trilingual (English, मराठी, हिन्दी) · Smart India Hackathon 2024</span>
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
        onClose={() => setShowAuthModal(false)}
      />

      {/* Virtual Telemedicine Consultation Room */}
      {showTelemedModal && (
        <TelemedicineRoom
          doctorName="Dr. Rajesh Deshmukh"
          specialty="General Medicine & Family Health"
          onClose={() => setShowTelemedModal(false)}
        />
      )}

      {/* National Digital Health ID Card (ABHA-style) */}
      {showHealthCardModal && (
        <DigitalHealthCard
          onClose={() => setShowHealthCardModal(false)}
        />
      )}

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
