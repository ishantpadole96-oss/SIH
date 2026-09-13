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

  const defaultLocations = [
    { village_id: 1, village_name: 'Khedgaon', district: 'Pune' },
    { village_id: 2, village_name: 'Bhor', district: 'Pune' },
    { village_id: 3, village_name: 'Junnar', district: 'Pune' },
    { village_id: 4, village_name: 'Baramati', district: 'Pune' },
    { village_id: 5, village_name: 'Ambegaon', district: 'Pune' },
    { village_id: 6, village_name: 'Shirur', district: 'Pune' },
    { village_id: 7, village_name: 'Mulshi', district: 'Pune' },
    { village_id: 8, village_name: 'Daund', district: 'Pune' }
  ];

  const availableLocations = (villages && villages.length > 0) ? villages : defaultLocations;
  const currentLoc = selectedVillage || availableLocations[0];

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
                {t('select_district_cluster')}
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
