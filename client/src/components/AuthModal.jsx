import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Lock, Mail, Phone, X, Sparkles, CheckCircle2, Shield, Stethoscope, HeartPulse, Building2, Users } from 'lucide-react';

export function AuthModal({ isOpen, onClose, preselectedRole }) {
  const { login, demoLogin, villages } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
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

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
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
          role: 'citizen'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto login after registration
      await login(regEmail, regPassword);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
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
    { role: 'citizen', icon: <Users size={20} />, label: t('role_citizen_badge') || 'Citizen', color: '#0D9488', bg: '#E8F5EE' },
    { role: 'asha', icon: <HeartPulse size={20} />, label: t('role_asha_badge') || 'ASHA Worker', color: '#E11D48', bg: '#FFE4E6' },
    { role: 'doctor', icon: <Stethoscope size={20} />, label: t('role_doctor_badge') || 'Doctor', color: '#2563EB', bg: '#EFF6FF' },
    { role: 'admin', icon: <Building2 size={20} />, label: t('role_admin_badge') || 'Admin', color: '#D97706', bg: '#FEF3C7' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800 }}>
            {mode === 'login' ? (t('auth_sign_in') || 'Sign In to RuralCare') : (t('auth_create_account') || 'Create Citizen Account')}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* ── Universal Demo Credentials Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(45,212,191,0.1))',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          border: '1px solid rgba(45,212,191,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Shield size={16} color="#2DD4BF" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2DD4BF', letterSpacing: '0.5px' }}>
              DEMO CREDENTIALS
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Username</span>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>demo_user</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Password</span>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>demo_password</div>
            </div>
          </div>
        </div>

        {/* ── 1-Click Portal Login Grid ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Login — Select Portal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {roleCards.map(rc => (
              <button
                key={rc.role}
                onClick={() => handleQuickDemoLogin(rc.role)}
                type="button"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: preselectedRole === rc.role ? `2px solid ${rc.color}` : '1px solid var(--border-subtle)',
                  background: preselectedRole === rc.role ? `${rc.bg}15` : 'var(--color-bg-primary)',
                  color: rc.color,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {rc.icon}
                {rc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid #2DD4BF' : 'none',
              color: mode === 'login' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t('auth_password_login') || 'Password Login'}
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #2DD4BF' : 'none',
              color: mode === 'register' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t('auth_new_signup') || 'New Citizen Sign Up'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth_email_phone') || 'Username, Email, or Phone'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="demo_user"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth_password') || 'Password'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="demo_password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (t('auth_authenticating') || 'Authenticating...') : (t('auth_sign_in_btn') || 'Sign In')}
            </button>
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
