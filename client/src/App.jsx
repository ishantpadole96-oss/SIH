import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
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

import TelemedicineRoom from './components/TelemedicineRoom';
import DigitalHealthCard from './components/DigitalHealthCard';

import { HeartPulse, ShieldAlert, Phone, Globe, Shield } from 'lucide-react';

function AppContent() {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTelemedModal, setShowTelemedModal] = useState(false);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);

  // Render appropriate view based on activeTab and Role
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
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main App Body */}
      <main style={{ flex: 1 }}>
        {renderView()}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 1.25rem 2rem 1.25rem',
        marginTop: 'auto'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: '#FFFFFF',
                padding: '0.35rem 0.6rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src="/ruralcare-logo.png" 
                  alt="RuralCare — Maharashtra Government Healthcare Platform" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                  Maharashtra Public Healthcare Platform • Connected care, closer.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('facilities')} className="btn btn-sm btn-outline">
                Find Facilities
              </button>
              <button onClick={() => setActiveTab('availability')} className="btn btn-sm btn-outline">
                Hospital Availability
              </button>
              <button onClick={() => setActiveTab('screening')} className="btn btn-sm btn-outline">
                AI Screening
              </button>
              <button onClick={() => setShowEmergencyModal(true)} className="btn btn-sm btn-emergency">
                <ShieldAlert size={14} /> 108 Emergency
              </button>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div>
              Problem Statement: <i>Accessibility &amp; Quality of Public Healthcare in Rural &amp; Underserved Areas</i>
            </div>
            <div>
              Trilingual Support (English, हिन्दी, मराठी) • Integrated GIS &amp; Clinical Decision Support
            </div>
          </div>
        </div>
      </footer>

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
