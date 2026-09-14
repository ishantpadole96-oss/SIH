import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Lock, Mail, Phone, X, Sparkles, CheckCircle2, Shield, Stethoscope, HeartPulse, Building2, Users } from 'lucide-react';

export function AuthModal({ isOpen, onClose, preselectedRole }) {
  const { login, demoLogin, villages } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(preselectedRole || 'citizen');
  const [identifier, setIdentifier] = useState('demo_user');
  const [password, setPassword] = useState('demo_password');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regVillage, setRegVillage] = useState(1);
  const [regPassword, setRegPassword] = useState('demo_password');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedRole) {
      setSelectedRole(preselectedRole);
    }
  }, [preselectedRole]);

  if (!isOpen) return null;

  const roleMeta = {
    citizen: { label: t('role_citizen_badge') || 'Citizen & Patient Portal', color: '#0D9488', icon: <Users size={20} /> },
    asha: { label: t('role_asha_badge') || 'ASHA Worker Portal', color: '#E11D48', icon: <HeartPulse size={20} /> },
    doctor: { label: t('role_doctor_badge') || 'Doctor OPD Chamber', color: '#2563EB', icon: <Stethoscope size={20} /> },
    admin: { label: t('role_admin_badge') || 'District Health Admin', color: '#D97706', icon: <Building2 size={20} /> }
  };

  const currentRoleInfo = roleMeta[selectedRole] || roleMeta.citizen;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pass the selected portal role so demo_user / demo_password logs into the exact portal
      await login(identifier, password, selectedRole);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          age: parseInt(regAge),
          gender: regGender,
          village_id: parseInt(regVillage),
          password: regPassword,
          role: selectedRole || 'citizen'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto login after registration
      await login(regEmail, regPassword, selectedRole);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setSelectedRole(role);
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { role: 'citizen', icon: <Users size={18} />, label: t('role_citizen_badge') || 'Citizen', color: '#0D9488', bg: '#E8F5EE' },
    { role: 'asha', icon: <HeartPulse size={18} />, label: t('role_asha_badge') || 'ASHA Worker', color: '#E11D48', bg: '#FFE4E6' },
    { role: 'doctor', icon: <Stethoscope size={18} />, label: t('role_doctor_badge') || 'Doctor OPD', color: '#2563EB', bg: '#EFF6FF' },
    { role: 'admin', icon: <Building2 size={18} />, label: t('role_admin_badge') || 'District Admin', color: '#D97706', bg: '#FEF3C7' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '24px' }}>
        
        {/* Close Button & Portal Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: `${currentRoleInfo.color}15`, color: currentRoleInfo.color,
              padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem',
              fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem'
            }}>
              {currentRoleInfo.icon}
              {currentRoleInfo.label}
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800, margin: 0 }}>
              {mode === 'login' ? `Sign In to ${currentRoleInfo.label}` : (t('auth_create_account') || 'Create Account')}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* ── Universal Demo Credentials Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13,148,136,0.18), rgba(45,212,191,0.1))',
          padding: '0.9rem 1.15rem',
          borderRadius: '16px',
          marginBottom: '1.25rem',
          border: '1px solid rgba(45,212,191,0.35)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="#2DD4BF" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2DD4BF', letterSpacing: '0.5px' }}>
                DEMO CREDENTIALS (FOR ALL 4 PORTALS)
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>100% Working</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Username</span>
              <div style={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>demo_user</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Password</span>
              <div style={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>demo_password</div>
            </div>
          </div>
        </div>

        {/* ── Select Portal to Access ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Target Portal — Click to switch or 1-click enter:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {roleCards.map(rc => {
              const isSelected = selectedRole === rc.role;
              return (
                <button
                  key={rc.role}
                  onClick={() => setSelectedRole(rc.role)}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${rc.color}` : '1px solid var(--border-subtle)',
                    background: isSelected ? `${rc.color}22` : 'var(--color-bg-primary)',
                    color: isSelected ? '#FFFFFF' : rc.color,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {rc.icon}
                    <span>{rc.label}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={15} color={rc.color} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.55rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid #2DD4BF' : 'none',
              color: mode === 'login' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {t('auth_password_login') || 'Password Sign In'}
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.55rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #2DD4BF' : 'none',
              color: mode === 'register' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {t('auth_new_signup') || 'New Registration'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                {t('auth_email_phone') || 'Username, Email, or Phone'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="demo_user"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                {t('auth_password') || 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="demo_password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, padding: '0.8rem' }}
              >
                {loading ? (t('auth_authenticating') || 'Authenticating...') : `Sign In to ${currentRoleInfo.label}`}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(selectedRole)}
                disabled={loading}
                style={{
                  padding: '0.8rem 1.1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#2DD4BF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="1-Click Demo Login"
              >
                <Sparkles size={16} /> 1-Click
              </button>
            </div>
          </form>
        )}

        {/* Mode: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth_full_name') || 'Full Name'}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Patil"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('auth_mobile') || 'Mobile Number'}</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth_email') || 'Email'}</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@email.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('auth_age') || 'Age'}</label>
                <input
                  type="number"
                  className="form-input"
                  value={regAge}
                  onChange={e => setRegAge(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth_village') || 'Village'}</label>
                <select
                  className="form-select"
                  value={regVillage}
                  onChange={e => setRegVillage(e.target.value)}
                >
                  {villages.map(v => (
                    <option key={v.village_id} value={v.village_id}>{v.village_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth_password') || 'Password'}</label>
              <input
                type="password"
                className="form-input"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (t('auth_creating') || 'Creating Account...') : (t('auth_register_btn') || 'Register Account')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
