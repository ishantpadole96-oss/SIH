import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { offlineStorage } from '../services/offlineStorage';
import { 
  MapPin, Globe, Bell, ChevronDown, Menu, User, 
  Check, LogOut, ShieldCheck, Wifi, WifiOff, QrCode, Sparkles 
} from 'lucide-react';

export function TopHeader({ onToggleMobileSidebar, onOpenAuth, onOpenJourneyScanner, onOpenCopilot }) {
  const { user, role, logout, selectedVillage, setSelectedVillage, villages } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(offlineStorage.getStatus());

  useEffect(() => {
    const unsub = offlineStorage.subscribe(status => setOfflineStatus(status));
    return unsub;
  }, []);

  const handleToggleOffline = () => {
    const isNowOffline = offlineStorage.toggleSimulatedOffline();
    if (!isNowOffline) {
      offlineStorage.syncPendingRecords().then(res => {
        if (res.synced) {
          alert(`Online Sync: ${res.message || 'Records synced to central server'}`);
        }
      });
    }
  };

  const languages = [
    { code: 'en', label: 'English (EN)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  const [districtSearch, setDistrictSearch] = useState('');

  const MAHARASHTRA_DISTRICTS_36 = [
    { village_id: 110, village_name: "Ahmednagar Center", district: "Ahmednagar" },
    { village_id: 311, village_name: "Akola Cotton City", district: "Akola" },
    { village_id: 300, village_name: "Amravati City", district: "Amravati" },
    { village_id: 165, village_name: "Beed City", district: "Beed" },
    { village_id: 262, village_name: "Bhandara City", district: "Bhandara" },
    { village_id: 333, village_name: "Buldhana City", district: "Buldhana" },
    { village_id: 277, village_name: "Chandrapur City", district: "Chandrapur" },
    { village_id: 123, village_name: "Chhatrapati Sambhajinagar", district: "Chhatrapati Sambhajinagar" },
    { village_id: 186, village_name: "Dharashiv (Osmanabad)", district: "Dharashiv" },
    { village_id: 87, village_name: "Dhule City", district: "Dhule" },
    { village_id: 288, village_name: "Gadchiroli Center", district: "Gadchiroli" },
    { village_id: 269, village_name: "Gondia City", district: "Gondia" },
    { village_id: 149, village_name: "Hingoli City", district: "Hingoli" },
    { village_id: 99, village_name: "Jalgaon City", district: "Jalgaon" },
    { village_id: 132, village_name: "Jalna City", district: "Jalna" },
    { village_id: 216, village_name: "Kolhapur City", district: "Kolhapur" },
    { village_id: 176, village_name: "Latur City", district: "Latur" },
    { village_id: 17, village_name: "Mumbai City Center", district: "Mumbai City" },
    { village_id: 23, village_name: "Mumbai Suburban", district: "Mumbai Suburban" },
    { village_id: 240, village_name: "Nagpur Metro Central", district: "Nagpur" },
    { village_id: 154, village_name: "Nanded City", district: "Nanded" },
    { village_id: 93, village_name: "Nandurbar City", district: "Nandurbar" },
    { village_id: 75, village_name: "Nashik City", district: "Nashik" },
    { village_id: 38, village_name: "Palghar Center", district: "Palghar" },
    { village_id: 140, village_name: "Parbhani City", district: "Parbhani" },
    { village_id: 1, village_name: "Pune City Center", district: "Pune" },
    { village_id: 46, village_name: "Alibag / Raigad", district: "Raigad" },
    { village_id: 57, village_name: "Ratnagiri Coastal", district: "Ratnagiri" },
    { village_id: 229, village_name: "Sangli City", district: "Sangli" },
    { village_id: 205, village_name: "Satara City", district: "Satara" },
    { village_id: 66, village_name: "Sindhudurg / Oros", district: "Sindhudurg" },
    { village_id: 194, village_name: "Solapur City", district: "Solapur" },
    { village_id: 30, village_name: "Thane City", district: "Thane" },
    { village_id: 253, village_name: "Wardha City", district: "Wardha" },
    { village_id: 345, village_name: "Washim Center", district: "Washim" },
    { village_id: 318, village_name: "Yavatmal Center", district: "Yavatmal" }
  ];

  // Combine backend villages if available or fallback to all 36 Maharashtra Districts
  const availableLocations = (villages && villages.length > 0) ? villages : MAHARASHTRA_DISTRICTS_36;
  const currentLoc = selectedVillage || availableLocations.find(l => l.district === 'Pune') || availableLocations[0];

  const filteredLocations = availableLocations.filter(loc => {
    if (!districtSearch.trim()) return true;
    const term = districtSearch.toLowerCase();
    return (
      (loc.district && loc.district.toLowerCase().includes(term)) ||
      (loc.village_name && loc.village_name.toLowerCase().includes(term))
    );
  });

  const userName = user 
    ? (user.name || user.email.split('@')[0]) 
    : (lang === 'mr' ? 'अतिथी नागरिक' : lang === 'hi' ? 'अतिथि नागरिक' : 'Guest Citizen');
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid #E6ECE8',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={onToggleMobileSidebar}
        className="mobile-hamburger-btn"
        aria-label="Toggle navigation"
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          marginRight: '0.75rem',
          color: '#11322A'
        }}
      >
        <Menu size={22} />
      </button>

      {/* Maharashtra Government Official Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#43685C',
          background: '#F0F5F2',
          padding: '0.28rem 0.65rem',
          borderRadius: '6px'
        }}>
          {t('gov_subtitle')}
        </span>
      </div>

      {/* Right-aligned Header Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        marginLeft: 'auto',
        flexWrap: 'nowrap'
      }}>
        
        {/* Offline Mode Toggle & Status Pill */}
        <button
          onClick={handleToggleOffline}
          title={!offlineStatus.isOnline ? t('status_online') : t('simulate_offline_tooltip')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: !offlineStatus.isOnline ? '#FFF7ED' : '#F0FDF4',
            border: !offlineStatus.isOnline ? '1px solid #F97316' : '1px solid #86EFAC',
            color: !offlineStatus.isOnline ? '#C2410C' : '#166534',
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          {!offlineStatus.isOnline ? <WifiOff size={13} /> : <Wifi size={13} />}
          <span>{!offlineStatus.isOnline ? t('status_offline') : t('status_online')}</span>
          {offlineStatus.pending.total > 0 && (
            <span style={{ background: '#EA580C', color: '#FFFFFF', borderRadius: '10px', padding: '1px 5px', fontSize: '0.68rem', fontWeight: 800 }}>
              {offlineStatus.pending.total}
            </span>
          )}
        </button>

        {/* Scan Journey QR Button */}
        {onOpenJourneyScanner && (
          <button
            onClick={onOpenJourneyScanner}
            title={t('btn_scan_qr_tooltip')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#FFFFFF',
              border: '1px solid #0D9488',
              color: '#0D9488',
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <QrCode size={13} />
            <span>{t('btn_scan_qr')}</span>
          </button>
        )}

        {/* Smart Copilot Button */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title={t('btn_copilot_tooltip')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
              border: 'none',
              color: '#FFFFFF',
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)'
            }}
          >
            <Sparkles size={13} />
            <span>{t('btn_copilot')}</span>
          </button>
        )}

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
            <span title={`${currentLoc.village_name || ''}, ${currentLoc.district || 'Maharashtra'}`}>
              {currentLoc.district ? `${currentLoc.district}` : (currentLoc.village_name || 'Maharashtra')}
            </span>
            <ChevronDown size={13} color="#6B7280" />
          </button>

          {showLocationDropdown && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '290px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.14), 0 4px 6px -2px rgba(17, 34, 25, 0.05)',
              border: '1px solid #E2ECE5',
              padding: '0.5rem',
              zIndex: 1000
            }}>
              <div style={{ 
                padding: '0.35rem 0.5rem 0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #F0F4F2',
                marginBottom: '0.4rem'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#43685C', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Maharashtra (36 Districts)
                </span>
                <span style={{ fontSize: '0.68rem', background: '#E8F5EE', color: '#0D9488', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' }}>
                  {filteredLocations.length} Available
                </span>
              </div>

              {/* District & Village Search Filter Input */}
              <div style={{ padding: '0 0.2rem 0.4rem' }}>
                <input
                  type="text"
                  value={districtSearch}
                  onChange={e => setDistrictSearch(e.target.value)}
                  placeholder="Search 36 districts..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    outline: 'none',
                    background: '#F9FAFB',
                    color: '#111827'
                  }}
                  autoFocus
                />
              </div>

              {/* Scrollable list of 36 Districts */}
              <div style={{ maxHeight: '330px', overflowY: 'auto', paddingRight: '2px' }}>
                {filteredLocations.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                    No district found matching "{districtSearch}"
                  </div>
                ) : (
                  filteredLocations.map(loc => {
                    const isSelected = (currentLoc.district === loc.district && (!loc.village_name || currentLoc.village_name === loc.village_name)) || currentLoc.village_id === loc.village_id;
                    return (
                      <div
                        key={`${loc.district}-${loc.village_id || loc.village_name}`}
                        onClick={() => {
                          setSelectedVillage(loc);
                          setShowLocationDropdown(false);
                          setDistrictSearch('');
                        }}
                        style={{
                          padding: '0.5rem 0.7rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: isSelected ? '#E8F5EE' : 'transparent',
                          color: '#11322A',
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 400,
                          marginBottom: '2px',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F6FAF7'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#11322A' }}>{loc.district}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                            {loc.village_name ? loc.village_name : 'District Cluster'}
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={14} color="#0D9488" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
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
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#11322A' }}>{t('notifications')}</span>
                <span style={{ fontSize: '0.7rem', color: '#0D9488', fontWeight: 600 }}>{t('one_new')}</span>
              </div>
              <div style={{ padding: '0.6rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>{t('notif_anc_title')}</div>
                <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '2px' }}>{t('notif_anc_desc')}</div>
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
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  {t('role_label')} {role === 'doctor' ? t('role_doctor') : role === 'asha' ? t('role_asha') : role === 'admin' ? t('role_admin') : t('role_citizen')}
                </div>
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
                <span>{t('sign_out')}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
