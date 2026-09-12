import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { EmergencyModal } from './EmergencyModal';
import { NotificationDrawer } from './NotificationDrawer';
import { 
  HeartPulse, ShieldAlert, Bell, Globe, User, LogOut, ChevronDown, 
  MapPin, Sparkles, Activity, Layers, Stethoscope, FileText
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, role, demoLogin, logout, selectedVillage, setSelectedVillage, villages } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showVillageMenu, setShowVillageMenu] = useState(false);

  // Poll for unread notification count if logged in
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ruralcare_token')}` }
      })
        .then(res => res.json())
        .then(data => setUnreadCount(data.unread_count || 0))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRoleSwitch = async (targetRole) => {
    setShowRoleMenu(false);
    try {
      await demoLogin(targetRole);
      if (targetRole === 'citizen') setActiveTab('home');
      else if (targetRole === 'asha') setActiveTab('asha-dashboard');
      else if (targetRole === 'doctor') setActiveTab('doctor-dashboard');
      else if (targetRole === 'admin') setActiveTab('admin-dashboard');
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <>
      {/* Top Demo Helper Strip (Essential for Hackathon Evaluators) */}
      <div style={{
        background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.4rem 1.25rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <span style={{
            background: 'rgba(13, 148, 136, 0.2)',
            color: '#2DD4BF',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            letterSpacing: '0.04em'
          }}>
            SIH 2026 PROTOTYPE
          </span>
          <span>Role-Based Access Control Active:</span>
          <span style={{ color: '#FFFFFF', fontWeight: 700, textTransform: 'capitalize' }}>
            {user ? `${user.role} (${user.name})` : 'Guest / Citizen'}
          </span>
        </div>

        {/* Instant Role Switcher for Hackathon Reviewers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '4px' }}>
            ⚡ 1-Click Role Switch:
          </span>
          <button
            onClick={() => handleRoleSwitch('citizen')}
            className={`btn btn-sm ${role === 'citizen' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: '26px' }}
          >
            Citizen
          </button>
          <button
            onClick={() => handleRoleSwitch('asha')}
            className={`btn btn-sm ${role === 'asha' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: '26px' }}
          >
            ASHA Worker
          </button>
          <button
            onClick={() => handleRoleSwitch('doctor')}
            className={`btn btn-sm ${role === 'doctor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: '26px' }}
          >
            Doctor
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`btn btn-sm ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: '26px' }}
          >
            Govt Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 15, 29, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              background: 'var(--color-brand-gradient)',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
            }}>
              <HeartPulse size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  Rural<span style={{ color: '#2DD4BF' }}>Care</span>
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  Live
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('app_tagline')}
              </div>
            </div>
          </div>

          {/* Location / Village Selector Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowVillageMenu(!showVillageMenu)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
            >
              <MapPin size={16} color="#2DD4BF" />
              <span style={{ fontSize: '0.82rem' }}>
                {selectedVillage ? selectedVillage.village_name : 'Select Village'}
              </span>
              <ChevronDown size={14} />
            </button>

            {showVillageMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                minWidth: '220px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 8px', fontWeight: 600 }}>
                  Select Rural Location
                </div>
                {villages.map(v => (
                  <div
                    key={v.village_id}
                    onClick={() => {
                      setSelectedVillage(v);
                      setShowVillageMenu(false);
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: selectedVillage?.village_id === v.village_id ? 'var(--color-bg-elevated)' : 'transparent'
                    }}
                  >
                    <span>{v.village_name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      {v.accessibility_score < 45 ? '🔴' : v.accessibility_score < 70 ? '🟡' : '🟢'} {v.accessibility_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links based on Role */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {role === 'citizen' || role === 'guest' ? (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`btn btn-sm ${activeTab === 'home' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ border: activeTab === 'home' ? '1px solid var(--color-brand-400)' : 'none' }}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`btn btn-sm ${activeTab === 'facilities' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ border: activeTab === 'facilities' ? '1px solid var(--color-brand-400)' : 'none' }}
                >
                  Facilities & Map
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`btn btn-sm ${activeTab === 'availability' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ border: activeTab === 'availability' ? '1px solid var(--color-brand-400)' : 'none' }}
                >
                  Live Beds
                </button>
                <button
                  onClick={() => setActiveTab('screening')}
                  className={`btn btn-sm ${activeTab === 'screening' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ border: activeTab === 'screening' ? '1px solid var(--color-brand-400)' : 'none' }}
                >
                  <Sparkles size={14} color="#38BDF8" /> AI Screening
                </button>
              </>
            ) : role === 'asha' ? (
              <>
                <button
                  onClick={() => setActiveTab('asha-dashboard')}
                  className={`btn btn-sm ${activeTab === 'asha-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  ASHA Portal
                </button>
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`btn btn-sm ${activeTab === 'facilities' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  Facilities
                </button>
              </>
            ) : role === 'doctor' ? (
              <>
                <button
                  onClick={() => setActiveTab('doctor-dashboard')}
                  className={`btn btn-sm ${activeTab === 'doctor-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  Doctor OPD
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`btn btn-sm ${activeTab === 'availability' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  Live Beds
                </button>
              </>
            ) : role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`btn btn-sm ${activeTab === 'admin-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  Admin Analytics & GIS
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`btn btn-sm ${activeTab === 'availability' ? 'btn-secondary' : 'btn-outline'}`}
                >
                  Live Beds
                </button>
              </>
            ) : null}
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setLang('en')}
                style={{
                  background: lang === 'en' ? 'var(--color-brand-500)' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                style={{
                  background: lang === 'hi' ? 'var(--color-brand-500)' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('mr')}
                style={{
                  background: lang === 'mr' ? 'var(--color-brand-500)' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                मराठी
              </button>
            </div>

            {/* Notification Bell */}
            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  position: 'relative',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Emergency 108 Call to Action */}
            <button
              onClick={() => setShowEmergency(true)}
              className="btn btn-emergency btn-sm"
              style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              <ShieldAlert size={16} /> 108 Emergency
            </button>

            {/* User Session Profile / Login */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={logout}
                  className="btn btn-sm btn-secondary"
                  title="Log out"
                  style={{ color: '#F87171' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-sm btn-primary"
              >
                <User size={16} /> Login
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
