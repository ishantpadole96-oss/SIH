import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Hospital, Sparkles, Calendar, ArrowRightLeft, FileText, 
  ShieldAlert, Pill, Tent, MessageSquare, MapPin, ChevronRight, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export function CitizenHome({ setActiveTab, onOpenEmergency }) {
  const { user, selectedVillage } = useAuth();
  const { t } = useLanguage();

  const tiles = [
    {
      id: 'facilities',
      title: t('tile_find_healthcare'),
      desc: t('tile_find_healthcare_desc'),
      icon: <Search size={28} color="#2DD4BF" />,
      badge: 'Interactive GIS',
      gradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(45, 212, 191, 0.3)'
    },
    {
      id: 'availability',
      title: t('tile_hospital_availability'),
      desc: t('tile_hospital_availability_desc'),
      icon: <Hospital size={28} color="#38BDF8" />,
      badge: 'Live Beds & Docs',
      gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(56, 189, 248, 0.3)'
    },
    {
      id: 'screening',
      title: t('tile_ai_screening'),
      desc: t('tile_ai_screening_desc'),
      icon: <Sparkles size={28} color="#A78BFA" />,
      badge: 'AI Triage Support',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(167, 139, 250, 0.3)'
    },
    {
      id: 'book-appointment',
      title: t('tile_book_appointment'),
      desc: t('tile_book_appointment_desc'),
      icon: <Calendar size={28} color="#34D399" />,
      badge: 'Zero Waiting',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(52, 211, 153, 0.3)'
    },
    {
      id: 'records-referrals',
      subTab: 'referrals',
      title: t('tile_my_referrals'),
      desc: t('tile_my_referrals_desc'),
      icon: <ArrowRightLeft size={28} color="#FBBF24" />,
      badge: 'Tier-2 & Tier-3',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(251, 191, 36, 0.3)'
    },
    {
      id: 'records-referrals',
      subTab: 'records',
      title: t('tile_my_records'),
      desc: t('tile_my_records_desc'),
      icon: <FileText size={28} color="#38BDF8" />,
      badge: 'Digital History',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(56, 189, 248, 0.3)'
    },
    {
      id: 'emergency',
      isEmergency: true,
      title: t('tile_emergency_help'),
      desc: t('tile_emergency_help_desc'),
      icon: <ShieldAlert size={28} color="#F87171" />,
      badge: '24x7 108 Dispatch',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(239, 68, 68, 0.4)'
    },
    {
      id: 'medicines',
      title: t('tile_medicine_search'),
      desc: t('tile_medicine_search_desc'),
      icon: <Pill size={28} color="#EC4899" />,
      badge: 'Live Stock Check',
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(244, 114, 182, 0.3)'
    },
    {
      id: 'camps',
      title: t('tile_health_camps'),
      desc: t('tile_health_camps_desc'),
      icon: <Tent size={28} color="#10B981" />,
      badge: 'Free Screening',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(52, 211, 153, 0.3)'
    },
    {
      id: 'complaints',
      title: t('tile_feedback_complaints'),
      desc: t('tile_feedback_complaints_desc'),
      icon: <MessageSquare size={28} color="#F59E0B" />,
      badge: 'Resolution Desk',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(20, 30, 51, 0.8) 100%)',
      border: 'rgba(245, 158, 11, 0.3)'
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(13, 148, 136, 0.2)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
            <MapPin size={16} color="#2DD4BF" />
            <span style={{ fontSize: '0.85rem', color: '#CCFBF1', fontWeight: 600 }}>
              {t('current_village')}: <b>{selectedVillage?.village_name || 'Shivapur'}</b> ({selectedVillage?.district || 'Pune'})
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Rural Healthcare, <span style={{ color: '#2DD4BF' }}>Accessible to All</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Instant access to government healthcare facilities, real-time bed & doctor availability, AI clinical screening, medicine tracking, and 24x7 emergency response for rural communities.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('screening')}
              className="btn btn-primary btn-lg"
            >
              <Sparkles size={20} /> {t('tile_ai_screening')}
            </button>
            <button
              onClick={onOpenEmergency}
              className="btn btn-emergency btn-lg"
            >
              <ShieldAlert size={20} /> {t('tile_emergency_help')}
            </button>
          </div>
        </div>
      </div>

      {/* 10 Touch-Friendly Citizen Feature Tiles */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', fontWeight: 700 }}>
            Rural Public Healthcare Services
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Designed for mobile-first accessibility, high readability, and touch navigation
          </p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
        {tiles.map(tile => (
          <div
            key={tile.id + (tile.subTab || '')}
            onClick={() => {
              if (tile.isEmergency) {
                onOpenEmergency();
              } else {
                setActiveTab(tile.id);
              }
            }}
            className="card card-interactive"
            style={{
              background: tile.gradient,
              border: `1px solid ${tile.border}`,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '160px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.75rem', borderRadius: '12px' }}>
                  {tile.icon}
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {tile.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.4rem', fontWeight: 700 }}>
                {tile.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {tile.desc}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2DD4BF', fontSize: '0.85rem', fontWeight: 700, marginTop: '1rem' }}>
              <span>Open Service</span>
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
