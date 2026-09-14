import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, MapPin, Sparkles, Calendar, Pill, Activity, FileText, 
  MessageSquare, Navigation, Landmark, ShieldAlert, ChevronDown, 
  HelpCircle, X, Check, HeartPulse, Bed, Video, ArrowLeft, Stethoscope, Building2, Users
} from 'lucide-react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  viewingRole, 
  setViewingRole, 
  onOpenEmergency,
  onOpenTelemed,
  isMobileOpen,
  setIsMobileOpen,
  onSelectPortal 
}) {
  const { t, lang } = useLanguage();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Role Metadata & Visual Branding
  const roleMeta = {
    citizen: {
      id: 'citizen',
      label: t('role_citizen'),
      desc: t('role_citizen_desc'),
      tab: 'home',
      badge: t('role_citizen_badge'),
      color: '#0D9488',
      bg: '#E8F5EE',
      icon: <Users size={16} />
    },
    asha: {
      id: 'asha',
      label: t('role_asha'),
      desc: t('role_asha_desc'),
      tab: 'asha-dashboard',
      badge: t('role_asha_badge'),
      color: '#E11D48',
      bg: '#FFE4E6',
      icon: <HeartPulse size={16} />
    },
    doctor: {
      id: 'doctor',
      label: t('role_doctor'),
      desc: t('role_doctor_desc'),
      tab: 'doctor-dashboard',
      badge: t('role_doctor_badge'),
      color: '#2563EB',
      bg: '#EFF6FF',
      icon: <Stethoscope size={16} />
    },
    admin: {
      id: 'admin',
      label: t('role_admin'),
      desc: t('role_admin_desc'),
      tab: 'admin-dashboard',
      badge: t('role_admin_badge'),
      color: '#D97706',
      bg: '#FEF3C7',
      icon: <Building2 size={16} />
    }
  };

  const currentMeta = roleMeta[viewingRole] || roleMeta.citizen;

  // Panel-specific filtered navigation links
  const panelNavItems = {
    citizen: [
      { id: 'home', label: t('nav_overview'), icon: <Home size={18} /> },
      { id: 'facilities', label: t('nav_find_healthcare'), icon: <MapPin size={18} /> },
      { id: 'book-appointment', label: t('nav_appointments'), icon: <Calendar size={18} /> },
      { id: 'telemedicine', label: t('nav_video_consult'), icon: <Video size={18} /> },
      { id: 'screening', label: t('nav_ai_screening'), icon: <Sparkles size={18} /> },
      { id: 'medicines', label: t('nav_medicines'), icon: <Pill size={18} /> },
      { id: 'records-referrals', label: t('nav_records'), icon: <FileText size={18} /> },
      { id: 'camps', label: t('nav_camps'), icon: <Activity size={18} /> },
      { id: 'complaints', label: t('nav_complaints'), icon: <MessageSquare size={18} /> },
      { id: 'services', label: t('nav_services'), icon: <Landmark size={18} /> }
    ],
    asha: [
      { id: 'asha-dashboard', label: t('nav_asha_workspace'), icon: <HeartPulse size={18} /> },
      { id: 'records-referrals', label: t('nav_asha_tracker'), icon: <FileText size={18} /> },
      { id: 'screening', label: t('nav_asha_triage'), icon: <Sparkles size={18} /> },
      { id: 'facilities', label: t('nav_asha_hospitals'), icon: <MapPin size={18} /> },
      { id: 'medicines', label: t('nav_asha_stocks'), icon: <Pill size={18} /> },
      { id: 'camps', label: t('nav_asha_camps'), icon: <Activity size={18} /> }
    ],
    doctor: [
      { id: 'doctor-dashboard', label: t('nav_doc_opd'), icon: <Stethoscope size={18} /> },
      { id: 'telemedicine', label: t('nav_doc_telemed'), icon: <Video size={18} /> },
      { id: 'records-referrals', label: t('nav_doc_history'), icon: <FileText size={18} /> },
      { id: 'facilities', label: t('nav_doc_transfers'), icon: <MapPin size={18} /> },
      { id: 'medicines', label: t('nav_doc_pharmacy'), icon: <Pill size={18} /> }
    ],
    admin: [
      { id: 'admin-dashboard', label: t('nav_admin_bottlenecks'), icon: <Building2 size={18} /> },
      { id: 'rural-map', label: t('nav_admin_gis_map'), icon: <Navigation size={18} /> },
      { id: 'availability', label: t('nav_admin_bed_census'), icon: <Bed size={18} /> },
      { id: 'facilities', label: t('nav_admin_matrix'), icon: <MapPin size={18} /> },
      { id: 'complaints', label: t('nav_admin_grievances'), icon: <MessageSquare size={18} /> }
    ]
  };

  const navList = panelNavItems[viewingRole] || panelNavItems.citizen;

  const handleSelectRole = (r) => {
    setShowRoleDropdown(false);
    if (onSelectPortal) {
      onSelectPortal(r.id, r.tab);
    } else {
      setViewingRole(r.id);
      setActiveTab(r.tab);
    }
  };

  const handleNavClick = (id) => {
    if (id === 'rural-map') {
      setActiveTab('facilities');
    } else {
      setActiveTab(id);
    }
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 34, 25, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
        />
      )}

      <aside style={{
        width: '260px',
        minWidth: '260px',
        maxWidth: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid #E6ECE8',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        padding: '1.25rem 1rem 1rem 1rem',
        overflowY: 'auto',
        transition: 'transform 0.25s ease-in-out',
        ...(isMobileOpen !== undefined ? {
          '@media (max-width: 900px)': {
            position: 'fixed',
            left: 0,
            top: 0,
            transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: isMobileOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
          }
        } : {})
      }}
      className={`sidebar-nav ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingLeft: '0.35rem' }}>
          <div 
            onClick={() => setActiveTab('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#E8F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid #D4E8DC'
            }}>
              <img 
                src="/ruralcare-mark.png" 
                alt="RuralCare" 
                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#11322A',
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}>
                {lang === 'en' ? (
                  <>Rural<span style={{ color: '#0D9488' }}>Care</span></>
                ) : (
                  <span style={{ color: '#173D35' }}>{t('app_title')}</span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#52786D', fontWeight: 500 }}>
                {t('app_tagline')}
              </div>
            </div>
          </div>

          {/* Close for mobile */}
          {setIsMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="mobile-close-btn"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* PROMINENT "RETURN TO MAIN LANDING PORTAL" BUTTON */}
        <button
          onClick={() => setActiveTab('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            width: '100%',
            padding: '0.55rem 0.85rem',
            borderRadius: '10px',
            background: '#F0F5F2',
            border: '1px solid #D4E8DC',
            color: '#11322A',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#E2EFE7';
            e.currentTarget.style.borderColor = '#0D9488';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#F0F5F2';
            e.currentTarget.style.borderColor = '#D4E8DC';
          }}
        >
          <ArrowLeft size={15} color="#0D9488" />
          <span>← {t('nav_landing')}</span>
        </button>

        {/* ACTIVE PANEL BADGE & ROLE SWITCHER */}
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#647D73',
            marginBottom: '0.45rem',
            paddingLeft: '0.35rem'
          }}>
            <span>{t('active_panel')}</span>
            <span style={{ fontSize: '0.65rem', color: '#0D9488', fontWeight: 600 }}>{t('switch_panel')}</span>
          </div>

          {/* Role Pill Trigger */}
          <div
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              background: currentMeta.bg,
              border: `1.5px solid ${currentMeta.color}40`,
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ color: currentMeta.color }}>{currentMeta.icon}</span>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#11322A', lineHeight: 1.2 }}>
                  {currentMeta.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: currentMeta.color, fontWeight: 700 }}>
                  {currentMeta.badge}
                </div>
              </div>
            </div>
            <ChevronDown size={15} color="#52786D" />
          </div>

          {/* Role Selection Dropdown Menu */}
          {showRoleDropdown && (
            <div style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.18)',
              border: '1px solid #E2ECE5',
              padding: '0.35rem',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              {Object.values(roleMeta).map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: viewingRole === r.id ? r.bg : 'transparent',
                    color: viewingRole === r.id ? '#11322A' : '#374151',
                    fontSize: '0.84rem',
                    fontWeight: viewingRole === r.id ? 700 : 500
                  }}
                  onMouseEnter={(e) => { if (viewingRole !== r.id) e.currentTarget.style.background = '#F6FAF7'; }}
                  onMouseLeave={(e) => { if (viewingRole !== r.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: r.color }}>{r.icon}</span>
                    <div>
                      <div>{r.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>{r.badge}</div>
                    </div>
                  </div>
                  {viewingRole === r.id && <Check size={14} color={r.color} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL NAVIGATION ITEMS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {navList.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'rural-map' && activeTab === 'facilities');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.62rem 0.9rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  background: isActive ? currentMeta.color : 'transparent',
                  color: isActive ? '#FFFFFF' : '#374151',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F0F5F2';
                    e.currentTarget.style.color = '#11322A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <span style={{
                  color: isActive ? '#FFFFFF' : '#52786D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Emergency Help Box */}
        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #EAEFEA' }}>
          <div style={{
            background: '#FDF1EF',
            border: '1px solid #FCDFD9',
            borderRadius: '14px',
            padding: '1rem 0.9rem',
            marginBottom: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444'
              }}>
                <ShieldAlert size={16} />
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                {t('nav_emergency_help')}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.35, margin: '0 0 0.6rem 0' }}>
              {t('nav_emergency_desc')}
            </p>
            <button
              onClick={onOpenEmergency}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#DC2626',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              {t('nav_get_help')}
            </button>
          </div>

          {/* SIH Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.7rem',
            color: '#6B7280',
            paddingLeft: '0.25rem'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981'
            }} />
            <span>{t('sih_footer_notice')}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
