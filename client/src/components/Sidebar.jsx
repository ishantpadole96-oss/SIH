import React, { useState } from 'react';
import { 
  Home, MapPin, Sparkles, Calendar, Pill, Activity, FileText, 
  MessageSquare, Navigation, Landmark, ShieldAlert, ChevronDown, 
  HelpCircle, X, Check, HeartPulse, Bed, Video
} from 'lucide-react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  viewingRole, 
  setViewingRole, 
  onOpenEmergency,
  onOpenTelemed,
  isMobileOpen,
  setIsMobileOpen 
}) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: <Home size={18} /> },
    { id: 'facilities', label: 'Find healthcare', icon: <MapPin size={18} /> },
    { id: 'telemedicine', label: 'Video consultation', icon: <Video size={18} /> },
    { id: 'screening', label: 'AI screening', icon: <Sparkles size={18} /> },
    { id: 'book-appointment', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill size={18} /> },
    { id: 'camps', label: 'Health camps', icon: <Activity size={18} /> },
    { id: 'records-referrals', label: 'Health records', icon: <FileText size={18} /> },
    { id: 'complaints', label: 'Feedback & complaints', icon: <MessageSquare size={18} /> },
    { id: 'rural-map', label: 'Rural map', icon: <Navigation size={18} /> },
    { id: 'services', label: 'Maharashtra services', icon: <Landmark size={18} /> },
  ];

  const roles = [
    { id: 'citizen', label: 'Citizen', desc: 'Patient view & appointments', tab: 'home' },
    { id: 'asha', label: 'ASHA Worker', desc: 'Door-to-door survey & ANC', tab: 'asha-dashboard' },
    { id: 'doctor', label: 'Doctor', desc: 'OPD queue & teleconsultation', tab: 'doctor-dashboard' },
    { id: 'admin', label: 'District Admin', desc: 'Bed census & epidemiology', tab: 'admin-dashboard' },
  ];

  const currentRoleObj = roles.find(r => r.id === viewingRole) || roles[0];

  const handleSelectRole = (r) => {
    setViewingRole(r.id);
    setShowRoleDropdown(false);
    setActiveTab(r.tab);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingLeft: '0.35rem' }}>
          <div 
            onClick={() => { setActiveTab('home'); setViewingRole('citizen'); }}
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
                Rural<span style={{ color: '#0D9488' }}>Care</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#52786D', fontWeight: 500 }}>
                Connected care, closer
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

        {/* VIEWING AS Section */}
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
            <span>VIEWING AS</span>
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
            >
              <HelpCircle size={13} color="#839B92" />
              {showHelpTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  right: 0,
                  width: '200px',
                  background: '#11322A',
                  color: '#FFFFFF',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  lineHeight: 1.35,
                  zIndex: 1001,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}>
                  Switch viewing perspective between Citizen, ASHA Frontline Worker, Doctor, and District Admin.
                </div>
              )}
            </div>
          </div>

          {/* Role Pill Dropdown Button */}
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              background: '#F0F5F2',
              border: '1px solid #DCE6E1',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#11322A',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: viewingRole === 'admin' ? '#0284C7' : viewingRole === 'doctor' ? '#8B5CF6' : viewingRole === 'asha' ? '#F59E0B' : '#10B981'
              }} />
              {currentRoleObj.label}
            </span>
            <ChevronDown size={15} color="#52786D" style={{ transform: showRoleDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Role Dropdown Menu */}
          {showRoleDropdown && (
            <div style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.15), 0 4px 6px -2px rgba(17, 34, 25, 0.05)',
              border: '1px solid #E2ECE5',
              padding: '0.4rem',
              zIndex: 1000
            }}>
              {roles.map(r => (
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
                    background: viewingRole === r.id ? '#E8F5EE' : 'transparent',
                    color: viewingRole === r.id ? '#11322A' : '#374151',
                    fontSize: '0.84rem',
                    fontWeight: viewingRole === r.id ? 700 : 500,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => { if (viewingRole !== r.id) e.currentTarget.style.background = '#F6FAF7'; }}
                  onMouseLeave={(e) => { if (viewingRole !== r.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div>{r.label}</div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 400 }}>{r.desc}</div>
                  </div>
                  {viewingRole === r.id && <Check size={14} color="#0D9488" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'rural-map' && activeTab === 'rural-map');
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
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#173D35' : 'transparent',
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
                <span>{item.label}</span>
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
                Emergency help
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.35, margin: '0 0 0.6rem 0' }}>
              Nearest 24x7 facility, ambulance and directions.
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
              Get help →
            </button>
          </div>

          {/* Verification Status */}
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
            <span>Demo dataset · verified 12 Sep 2026</span>
          </div>
        </div>

      </aside>
    </>
  );
}
