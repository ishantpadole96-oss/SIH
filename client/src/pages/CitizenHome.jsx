import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Hospital, Sparkles, Calendar, ArrowRightLeft, FileText, 
  ShieldAlert, Pill, Tent, MessageSquare, MapPin, ChevronRight, CheckCircle2, 
  Video, Shield, Phone, Activity, Users, Stethoscope, Building2, ArrowRight,
  Clock, HeartHandshake, AlertTriangle
} from 'lucide-react';

export function CitizenHome({ setActiveTab, onOpenEmergency, onOpenTelemed, onOpenHealthCard }) {
  const { user, role, demoLogin, selectedVillage, setSelectedVillage, villages } = useAuth();
  const { t, lang } = useLanguage();
  const [selectedWorkspaceTab, setSelectedWorkspaceTab] = useState('citizen');

  // 9 Core Action Modules
  const coreServices = [
    {
      id: 'facilities',
      title: 'Find Healthcare Near You',
      marathiTitle: 'जवळचे आरोग्य केंद्र शोधा',
      desc: 'Locate 350+ verified PHCs, CHCs, Sub-District Hospitals & Civil Hospitals with exact GPS navigation.',
      badge: 'Interactive GIS Map',
      badgeColor: '#0D9488',
      icon: <Search size={24} color="#2DD4BF" />,
      actionText: 'Explore Facilities'
    },
    {
      id: 'screening',
      title: 'AI Clinical Triage & Screening',
      marathiTitle: 'एआय लक्षण तपासणी',
      desc: 'Instant decision-support evaluating vitals, red-flag symptoms, and recommended facility level.',
      badge: 'Clinical Decision Support',
      badgeColor: '#8B5CF6',
      icon: <Sparkles size={24} color="#A78BFA" />,
      actionText: 'Check Symptoms'
    },
    {
      id: 'availability',
      title: 'Hospital Availability Census',
      marathiTitle: 'रुग्णालय खाटा व डॉक्टर स्थिती',
      desc: 'Live census of vacant general/ICU beds, on-duty specialist doctors, and 24x7 emergency readiness.',
      badge: 'Real-Time Census',
      badgeColor: '#0284C7',
      icon: <Hospital size={24} color="#38BDF8" />,
      actionText: 'View Live Beds'
    },
    {
      id: 'book-appointment',
      title: 'Book OPD Consultation',
      marathiTitle: 'ओपीडी अपॉइंटमेंट बुक करा',
      desc: 'Schedule appointment slots with verified government doctors with zero queue waiting times.',
      badge: 'Zero-Wait Scheduling',
      badgeColor: '#10B981',
      icon: <Calendar size={24} color="#34D399" />,
      actionText: 'Book Slot'
    },
    {
      id: 'telemedicine',
      isTelemed: true,
      title: 'e-Sanjeevani Teleconsultation',
      marathiTitle: 'ई-संजीवनी टेलिमेडिसिन',
      desc: 'Direct video consultation with government doctors and specialists from the comfort of home.',
      badge: 'Live Video OPD',
      badgeColor: '#06B6D4',
      icon: <Video size={24} color="#22D3EE" />,
      actionText: 'Start Consultation'
    },
    {
      id: 'health-card',
      isHealthCard: true,
      title: 'Digital Health Card (ABHA)',
      marathiTitle: 'डिजिटल हेल्थ कार्ड (आभा)',
      desc: 'Official QR-enabled digital health identity card with blood group, allergies, and emergency contacts.',
      badge: 'ABHA Identity',
      badgeColor: '#10B981',
      icon: <Shield size={24} color="#10B981" />,
      actionText: 'View Health Card'
    },
    {
      id: 'medicines',
      title: 'Jan Aushadhi & Generic Medicines',
      marathiTitle: 'जन औषधी व जेनेरिक औषधे',
      desc: 'Search 25+ essential generic medicines saving up to 87% cost and check live inventory at local PHCs.',
      badge: 'Up to 87% Savings',
      badgeColor: '#EC4899',
      icon: <Pill size={24} color="#F472B6" />,
      actionText: 'Search Medicines'
    },
    {
      id: 'camps',
      title: 'Rural Health Camps',
      marathiTitle: 'ग्रामीण आरोग्य शिबिरे',
      desc: 'Upcoming free community health checkup camps for maternal care, diabetes, and eye screenings.',
      badge: 'Free Community Care',
      badgeColor: '#F59E0B',
      icon: <Tent size={24} color="#FBBF24" />,
      actionText: 'View Health Camps'
    },
    {
      id: 'complaints',
      title: 'Quality Monitor & Grievances',
      marathiTitle: 'तक्रार निवारण व दर्जा सनियंत्रण',
      desc: 'Directly report doctor absence, medicine shortages, or facility hygiene to the District Health Officer.',
      badge: 'Direct Redressal',
      badgeColor: '#F59E0B',
      icon: <MessageSquare size={24} color="#FBBF24" />,
      actionText: 'File Feedback'
    }
  ];

  // Role workspaces detail
  const workspaces = {
    citizen: {
      role: 'citizen',
      title: 'Your Care Journey',
      subtitle: 'Personalized healthcare records, symptom tracking, and local clinic discovery',
      badge: 'Citizen Workspace',
      items: [
        'Check symptoms with AI clinical assistant',
        'Book zero-wait appointments at nearest government hospital',
        'Access QR-enabled ABHA Digital Health Card',
        'Search affordable generic medicines at Jan Aushadhi Kendras'
      ],
      actionLabel: 'Open Citizen Dashboard',
      actionTab: 'home'
    },
    asha: {
      role: 'asha',
      title: 'Field Workspace (ASHA Worker)',
      subtitle: 'Door-to-door village health records, high-risk pregnancy ANC, and child immunization tracking',
      badge: 'ASHA Field Portal',
      items: [
        'Village household health surveys and vulnerability tracking',
        'High-risk pregnancy (ANC/PNC) monitoring & emergency flagging',
        'Child immunization tracking & drop-out recovery',
        'Direct referral submission to Sub-District and Civil Hospitals'
      ],
      actionLabel: 'Launch ASHA Workspace',
      actionTab: 'asha-dashboard'
    },
    doctor: {
      role: 'doctor',
      title: 'Clinical Workspace (Doctor & MO)',
      subtitle: 'OPD queue management, teleconsultation chamber, and digital prescription issuance',
      badge: 'Doctor OPD Portal',
      items: [
        'Real-time outpatient consultation queue and patient history',
        'Live e-Sanjeevani video consultation chamber with vitals HUD',
        'Digital prescription writer with Jan Aushadhi generic mapping',
        'Inward referrals acceptance and tertiary hospital transfers'
      ],
      actionLabel: 'Launch Doctor Portal',
      actionTab: 'doctor-dashboard'
    },
    admin: {
      role: 'admin',
      title: 'District Command Centre (Govt Admin)',
      subtitle: 'Statewide epidemiological radar, bed occupancy alerts, and resource allocation',
      badge: 'District Admin Command',
      items: [
        'Real-time disease surveillance & seasonal outbreak radar',
        'Statewide vacant bed census & oxygen/ICU readiness',
        '108 Ambulance response time tracking and dispatch latency',
        'Citizen grievance escalation and resolution tracking'
      ],
      actionLabel: 'Launch Admin Command Centre',
      actionTab: 'admin-dashboard'
    }
  };

  const currentWorkspace = workspaces[selectedWorkspaceTab];

  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* 1. Official Government Header Strip */}
      <div style={{
        background: 'linear-gradient(90deg, #173D35 0%, #195B48 50%, #173D35 100%)',
        color: '#FFFFFF',
        padding: '0.45rem 1.25rem',
        fontSize: '0.78rem',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{ background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          🏛️ GOVERNMENT OF MAHARASHTRA
        </span>
        <span>Public Health & Family Welfare Department • Integrated Rural Healthcare Delivery Platform</span>
      </div>

      <div className="container" style={{ padding: '2rem 1.25rem 0 1.25rem' }}>
        
        {/* 2. Hero Section: "Connected care, closer" */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(25, 91, 72, 0.28) 0%, rgba(15, 23, 42, 0.95) 75%)',
          border: '1px solid rgba(25, 91, 72, 0.45)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2.25rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ maxWidth: '820px' }}>
            
            {/* Official Logo Banner */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '6px 14px', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
              <img
                src="/ruralcare-logo.png"
                alt="RuralCare Maharashtra Public Healthcare"
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-success" style={{ background: '#195B48', color: '#FFFFFF', fontWeight: 700, padding: '4px 10px', fontSize: '0.76rem' }}>
                🟢 Live Maharashtra Health Portal
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                All 36 Districts &bull; 350+ Verified Public Hospitals
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: '2.85rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              marginBottom: '1rem'
            }}>
              Connected care, <span style={{ color: '#2DD4BF' }}>closer.</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 600, color: '#A7F3D0', marginTop: '4px', letterSpacing: '0' }}>
                ग्रामीण आरोग्य सेवा, अधिक जवळ.
              </div>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.08rem',
              color: '#CBD5E1',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '720px'
            }}>
              Find trusted rural healthcare across all 36 districts of Maharashtra, check real-time hospital vacant beds and on-duty doctors, screen symptoms with clinical AI, and take the next step with confidence.
            </p>

            {/* 3 Primary Call-to-Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setActiveTab('facilities')}
                className="btn btn-primary btn-lg"
                style={{ background: '#0D9488', border: 'none', padding: '0.75rem 1.6rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                <Search size={20} /> Find Healthcare Near You
              </button>

              <button
                onClick={() => setActiveTab('screening')}
                className="btn btn-secondary btn-lg"
                style={{ padding: '0.75rem 1.4rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                <Sparkles size={20} color="#A78BFA" /> AI Symptom Screening
              </button>

              <button
                onClick={onOpenEmergency}
                className="btn btn-danger btn-lg"
                style={{ background: '#EF4444', border: 'none', padding: '0.75rem 1.3rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                <ShieldAlert size={20} /> 108 Emergency
              </button>
            </div>

          </div>
        </div>

        {/* 3. Care Snapshot / Real-Time Pulse (4 Clean Bento Metric Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="card" style={{ padding: '1.35rem', background: 'var(--color-bg-card)', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Public Facilities</span>
              <div style={{ background: 'rgba(13, 148, 136, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Building2 size={18} color="#2DD4BF" />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              350 Verified
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              District Civil, SDHs, CHCs &amp; PHCs
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem', background: 'var(--color-bg-card)', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Bed Census</span>
              <div style={{ background: 'rgba(2, 132, 199, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Hospital size={18} color="#38BDF8" />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38BDF8', marginBottom: '2px' }}>
              Real-time Vacancy
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              General, Maternity &amp; ICU Beds
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem', background: 'var(--color-bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Staff</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Stethoscope size={18} color="#34D399" />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399', marginBottom: '2px' }}>
              520+ Doctors
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Specialists &amp; Medical Officers on Duty
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem', background: 'var(--color-bg-card)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Geographic Coverage</span>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <MapPin size={18} color="#FBBF24" />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FBBF24', marginBottom: '2px' }}>
              36 Districts
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              350 Talukas across Maharashtra
            </div>
          </div>
        </div>

        {/* 4. Local Area & Village Snapshot Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.4rem',
          marginBottom: '2.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(45, 212, 191, 0.15)', padding: '8px', borderRadius: '50%' }}>
              <MapPin size={22} color="#2DD4BF" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Your Current Area Snapshot
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {selectedVillage?.village_name || 'Pune City Center'} ({selectedVillage?.district || 'Pune'} District)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
              Accessibility Index: <b style={{ color: '#10B981' }}>{selectedVillage?.accessibility_score || 88}/100 🟢 Good</b>
            </div>

            <button
              onClick={() => setActiveTab('facilities')}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Explore Local GIS Map <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* 5. Role-Based Workspaces Switcher (Just like Reference Site) */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: '#FFFFFF', fontWeight: 800 }}>
                Multi-Stakeholder Workspaces
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Integrated views connecting rural citizens, ASHA community workers, medical officers, and district administrators
              </p>
            </div>

            {/* Workspace Toggle Tabs */}
            <div style={{ display: 'flex', background: 'var(--color-bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', gap: '4px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedWorkspaceTab('citizen')}
                className={`btn btn-sm ${selectedWorkspaceTab === 'citizen' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              >
                👤 Citizen
              </button>
              <button
                onClick={() => setSelectedWorkspaceTab('asha')}
                className={`btn btn-sm ${selectedWorkspaceTab === 'asha' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              >
                👩‍⚕️ ASHA Worker
              </button>
              <button
                onClick={() => setSelectedWorkspaceTab('doctor')}
                className={`btn btn-sm ${selectedWorkspaceTab === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              >
                🩺 Doctor / MO
              </button>
              <button
                onClick={() => setSelectedWorkspaceTab('admin')}
                className={`btn btn-sm ${selectedWorkspaceTab === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              >
                🏛️ District Admin
              </button>
            </div>
          </div>

          {/* Active Workspace Showcase Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(20, 30, 51, 0.9) 0%, rgba(10, 15, 29, 0.95) 100%)',
            border: '1px solid rgba(13, 148, 136, 0.4)',
            padding: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <span className="badge badge-info" style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                  {currentWorkspace.badge}
                </span>
                <h3 style={{ fontSize: '1.5rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {currentWorkspace.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {currentWorkspace.subtitle}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {currentWorkspace.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#E2E8F0' }}>
                      <CheckCircle2 size={16} color="#2DD4BF" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignSelf: 'center' }}>
                <button
                  onClick={async () => {
                    await demoLogin(currentWorkspace.role);
                    setActiveTab(currentWorkspace.actionTab);
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {currentWorkspace.actionLabel} <ArrowRight size={18} />
                </button>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  1-Click Role Switch &amp; Access
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Core Public Healthcare Services Grid */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#FFFFFF', fontWeight: 800 }}>
              Official Public Healthcare Services
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Explore instant digital health workflows designed for Maharashtra's rural population
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.35rem'
          }}>
            {coreServices.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  if (service.isEmergency) onOpenEmergency();
                  else if (service.isTelemed) onOpenTelemed();
                  else if (service.isHealthCard) onOpenHealthCard();
                  else setActiveTab(service.id);
                }}
                className="card card-hover"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {service.icon}
                    </div>
                    <span style={{
                      background: `${service.badgeColor}22`,
                      color: service.badgeColor,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {service.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {service.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.75rem', fontWeight: 500 }}>
                    {service.marathiTitle}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {service.desc}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#2DD4BF',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem'
                }}>
                  <span>{service.actionText}</span>
                  <ChevronRight size={16} />
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 7. Emergency & National Helplines Strip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <ShieldAlert size={22} color="#EF4444" />
              <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 800 }}>
                24x7 Maharashtra Emergency Healthcare Helplines
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Toll-free government helplines available 24 hours a day across all rural talukas and remote hamlets
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="tel:108"
              className="btn btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Phone size={16} /> 108 Ambulance Dispatch
            </a>
            <a
              href="tel:104"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Phone size={16} /> 104 Health Helpline
            </a>
            <a
              href="tel:102"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Phone size={16} /> 102 Matritva Vahan
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
