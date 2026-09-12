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

import TelemedicineRoom from './components/TelemedicineRoom';
import DigitalHealthCard from './components/DigitalHealthCard';

import { Landmark, ExternalLink, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

function MaharashtraServices({ setActiveTab, onOpenTelemed, onOpenHealthCard }) {
  const schemes = [
    {
      title: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
      marathi: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना',
      coverage: '₹5,00,000 per family/year',
      desc: 'Cashless secondary and tertiary healthcare coverage across 996 empaneled public & private hospitals in Maharashtra.',
      tag: 'Free Hospitalization',
      color: '#0D9488'
    },
    {
      title: 'Ayushman Bharat PM-JAY',
      marathi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      coverage: '₹5,00,000 national portable cover',
      desc: 'Fully integrated with MJPJAY in Maharashtra offering comprehensive in-patient care without out-of-pocket expenses.',
      tag: 'National Portability',
      color: '#16A34A'
    },
    {
      title: 'Janani Shishu Suraksha Karyakram (JSSK)',
      marathi: 'जननी शिशु सुरक्षा कार्यक्रम',
      coverage: '100% Free institutional delivery',
      desc: 'Free medicines, diagnostics, blood, and transport for pregnant women and sick neonates up to 1 year.',
      tag: 'Maternal & Neonatal',
      color: '#EC4899'
    },
    {
      title: 'Pradhan Mantri National Dialysis Programme',
      marathi: 'राष्ट्रीय डायलिसिस कार्यक्रम',
      coverage: 'Free Hemodialysis for BPL patients',
      desc: 'District hospital and sub-district hospital dialysis centers providing free regular maintenance sessions.',
      tag: 'Renal Care',
      color: '#6366F1'
    }
  ];

  return (
    <div style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid #E2EBE5',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <Landmark size={24} color="#173D35" />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#11322A', margin: 0 }}>
            Government of Maharashtra Healthcare Schemes
          </h1>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#4B5563', margin: 0, maxWidth: '750px' }}>
          Public Health and Family Welfare Department welfare entitlements, cashless health cover, and zero-cost institutional care.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {schemes.map((s, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2EBE5',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 2px 8px rgba(17, 34, 25, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: s.color,
                  background: `${s.color}15`,
                  padding: '3px 8px',
                  borderRadius: '9999px'
                }}>
                  {s.tag}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                  {s.coverage}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                {s.title}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                {s.marathi}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                {s.desc}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F0F5F2', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('facilities')}
                style={{
                  background: '#173D35',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Find Empaneled Hospitals
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
