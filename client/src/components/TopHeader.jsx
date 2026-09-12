import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, Globe, Bell, ChevronDown, Menu, User, 
  Check, LogOut, ShieldCheck 
} from 'lucide-react';

export function TopHeader({ onToggleMobileSidebar, onOpenAuth }) {
  const { user, role, logout, selectedVillage, setSelectedVillage, villages } = useAuth();
  const { lang, setLang } = useLanguage();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Default demo villages
  const defaultLocations = [
    { village_id: 99, village_name: 'Khedgaon', district: 'Nashik & Dindori', latitude: 20.0825, longitude: 73.8567 },
    { village_id: 1, village_name: 'Shivapur', district: 'Pune', latitude: 18.2851, longitude: 73.8824 },
    { village_id: 2, village_name: 'Shirwal', district: 'Satara', latitude: 18.1342, longitude: 74.0271 },
    { village_id: 3, village_name: 'Katol', district: 'Nagpur', latitude: 21.2721, longitude: 78.5833 },
    { village_id: 4, village_name: 'Aheri', district: 'Gadchiroli', latitude: 19.4167, longitude: 79.9833 },
  ];

  const availableLocations = villages && villages.length > 0 ? villages : defaultLocations;
  const currentLoc = selectedVillage || availableLocations[0];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  const userName = user ? (user.name || user.email.split('@')[0]) : 'Ishant Padole';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header style={{
      height: '64px',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      position: 'relative',
      zIndex: 50
    }}>
      {/* Left: Mobile Hamburger Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-menu-toggle"
          style={{
            display: 'none',
            background: '#FFFFFF',
            border: '1px solid #E2ECE5',
            borderRadius: '8px',
            padding: '0.45rem',
            cursor: 'pointer',
            color: '#11322A'
          }}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right-aligned Header Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginLeft: 'auto',
        flexWrap: 'nowrap'
      }}>
        
        {/* Location Dropdown Pill: 📍 Khedgaon ⌄ */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowLocationDropdown(!showLocationDropdown);
              setShowLangDropdown(false);
              setShowUserDropdown(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#FFFFFF',
              border: '1px solid #E2ECE5',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: '#1A332B',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C2D6CA'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E2ECE5'}
          >
            <MapPin size={14} color="#0D9488" />
            <span>{currentLoc.village_name || 'Khedgaon'}</span>
            <ChevronDown size={13} color="#6B7280" />
          </button>

          {showLocationDropdown && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '240px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.12), 0 4px 6px -2px rgba(17, 34, 25, 0.05)',
              border: '1px solid #E2ECE5',
              padding: '0.4rem',
              zIndex: 1000
            }}>
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Select District / Cluster
              </div>
              {availableLocations.slice(0, 8).map(loc => (
                <div
                  key={loc.village_id}
                  onClick={() => {
                    setSelectedVillage(loc);
                    setShowLocationDropdown(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: (currentLoc.village_id === loc.village_id || currentLoc.village_name === loc.village_name) ? '#E8F5EE' : 'transparent',
                    color: '#11322A',
                    fontSize: '0.82rem',
                    fontWeight: (currentLoc.village_id === loc.village_id || currentLoc.village_name === loc.village_name) ? 600 : 400
                  }}
                  onMouseEnter={e => { if (currentLoc.village_id !== loc.village_id) e.currentTarget.style.background = '#F6FAF7'; }}
                  onMouseLeave={e => { if (currentLoc.village_id !== loc.village_id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{loc.village_name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{loc.district}</div>
                  </div>
                  {(currentLoc.village_id === loc.village_id || currentLoc.village_name === loc.village_name) && (
                    <Check size={14} color="#0D9488" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector: 文A English */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowLangDropdown(!showLangDropdown);
              setShowLocationDropdown(false);
              setShowUserDropdown(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#FFFFFF',
              border: '1px solid #E2ECE5',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: '#1A332B',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <Globe size={14} color="#52786D" />
            <span>{currentLangLabel.split(' ')[0]}</span>
          </button>

          {showLangDropdown && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '180px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.12)',
              border: '1px solid #E2ECE5',
              padding: '0.4rem',
              zIndex: 1000
            }}>
              {languages.map(l => (
                <div
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setShowLangDropdown(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: lang === l.code ? '#E8F5EE' : 'transparent',
                    color: '#11322A',
                    fontSize: '0.82rem',
                    fontWeight: lang === l.code ? 600 : 400
                  }}
                >
                  <span>{l.label}</span>
                  {lang === l.code && <Check size={14} color="#0D9488" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell with Dot 🔔 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E2ECE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: '#374151'
            }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '9px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#EF4444',
              border: '1.5px solid #FFFFFF'
            }} />
          </button>

          {showNotificationToast && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '280px',
              background: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.15)',
              border: '1px solid #E2ECE5',
              padding: '1rem',
              zIndex: 1000
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#11322A' }}>Notifications</span>
                <span style={{ fontSize: '0.7rem', color: '#0D9488', fontWeight: 600 }}>1 New</span>
              </div>
              <div style={{ padding: '0.6rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>ANC Check-up Tomorrow</div>
                <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '2px' }}>Khedgaon PHC doctor consultation scheduled for 10:30 AM.</div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill: (I) Ishant Padole */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              if (user) {
                setShowUserDropdown(!showUserDropdown);
              } else {
                onOpenAuth();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: '#FFFFFF',
              border: '1px solid #E2ECE5',
              padding: '0.35rem 0.85rem 0.35rem 0.4rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#E8F5EE',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: '1px solid #C6E4D2'
            }}>
              {userInitial}
            </div>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#11322A',
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {userName}
            </span>
          </button>

          {showUserDropdown && user && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '200px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.12)',
              border: '1px solid #E2ECE5',
              padding: '0.5rem',
              zIndex: 1000
            }}>
              <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #F0F4F1', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#11322A' }}>{userName}</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Role: {role || 'Citizen'}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserDropdown(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
