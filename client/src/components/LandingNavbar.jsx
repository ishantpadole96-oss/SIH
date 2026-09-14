import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Globe, Phone, ArrowRight, User, Check, Smartphone } from 'lucide-react';

export function LandingNavbar({ onSelectPortal, onOpenEmergency, onOpenAuth, onOpenDownloadApp }) {
  const { lang, setLang, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = React.useState(false);

  const languages = [
    { code: 'en', label: 'English (EN)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2ECE5',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(17, 50, 42, 0.04)'
    }}>
      {/* Top micro-bar: Government of Maharashtra Notice */}
      <div style={{
        background: '#11322A',
        color: '#D1E7DD',
        padding: '0.35rem 2rem',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 700, color: '#A7DBBB' }}>🏛️ {t('gov_subtitle')}</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>{t('nhm_continuum')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#FDE68A', fontWeight: 600 }}>{t('toll_free_emergency')}</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span style={{ color: '#93C5FD' }}>{t('sih_tag')}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#E8F5EE',
            border: '1.5px solid #0D9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img 
              src="/ruralcare-mark.png" 
              alt="RuralCare" 
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#11322A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              {lang === 'en' ? (
                <>Rural<span style={{ color: '#0D9488' }}>Care</span></>
              ) : (
                t('app_title')
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#52786D', fontWeight: 600 }}>
              {t('app_tagline')}
            </div>
          </div>
        </div>

        {/* Quick Portal Jump Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectPortal('citizen', 'home')}
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>👨‍👩‍👧 {t('role_citizen_badge')}</span>
          </button>

          <button
            onClick={() => onSelectPortal('asha', 'asha-dashboard')}
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#BE123C',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>👩‍⚕️ {t('role_asha_badge')}</span>
          </button>

          <button
            onClick={() => onSelectPortal('doctor', 'doctor-dashboard')}
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🩺 {t('role_doctor_badge')}</span>
          </button>

          <button
            onClick={() => onSelectPortal('admin', 'admin-dashboard')}
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#B45309',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🏛️ {t('role_admin_badge')}</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* DOWNLOAD APP Button */}
          <button
            onClick={onOpenDownloadApp}
            title="Download RuralCare Android App (.apk)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.42rem',
              background: '#0D9488',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.48rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.28)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0F766E';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0D9488';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <Smartphone size={14} />
            <span>DOWNLOAD APP</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#F6FAF7',
                border: '1px solid #E2ECE5',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#11322A',
                cursor: 'pointer'
              }}
            >
              <Globe size={14} color="#0D9488" />
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
                boxShadow: '0 10px 25px -3px rgba(17, 34, 25, 0.15)',
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
                      fontWeight: lang === l.code ? 700 : 400
                    }}
                  >
                    <span>{l.label}</span>
                    {lang === l.code && <Check size={14} color="#0D9488" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency 108 Button */}
          <button
            onClick={onOpenEmergency}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Phone size={14} />
            <span>{t('emergency_call')}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
