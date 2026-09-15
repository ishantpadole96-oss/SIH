import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Stethoscope, HeartPulse, Building2, Lock, User, 
  Phone, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles,
  MapPin, Eye, EyeOff
} from 'lucide-react';

export function PortalLoginPage({ portalRole = 'citizen', onLoginSuccess, onBackToLanding }) {
  const { login, demoLogin, villages } = useAuth();
  const { t } = useLanguage();

  const [activeMode, setActiveMode] = useState('login'); // 'login' | 'register' (citizen only)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields for citizens
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Female');
  const [regVillage, setRegVillage] = useState(1);
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const portalConfig = {
    citizen: {
      title: 'Citizen & Patient Health Portal',
      subtitle: 'Government of Maharashtra • Unified Rural Health & ABHA Gateway',
      badge: 'Public Citizen Access',
      color: '#0D9488',
      bgGradient: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
      icon: <Users size={32} color="#FFFFFF" />,
      idLabel: 'ABHA Health ID / Mobile Number',
      idPlaceholder: 'e.g. 9822012345 or ABHA-9941',
      description: 'Access linked health records, book doctor appointments, request video consultations, and check real-time bed & medicine availability.'
    },
    doctor: {
      title: 'Medical Officer OPD & Clinical Console',
      subtitle: 'Directorate of Health Services, Maharashtra State',
      badge: 'Doctor OPD Workspace',
      color: '#2563EB',
      bgGradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
      icon: <Stethoscope size={32} color="#FFFFFF" />,
      idLabel: 'Medical Council Reg No. / Doctor Email',
      idPlaceholder: 'e.g. MMC-2024-9120 or doctor@ruralcare.in',
      description: 'Manage outpatient queues, conduct live patient video consultations, order diagnostic lab tests, issue prescriptions, and initiate specialist referrals.'
    },
    asha: {
      title: 'ASHA & ANM Community Health Console',
      subtitle: 'National Rural Health Mission (NRHM) • Field Worker Portal',
      badge: 'Frontline Healthcare Worker',
      color: '#E11D48',
      bgGradient: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
      icon: <HeartPulse size={32} color="#FFFFFF" />,
      idLabel: 'ASHA Worker ID / Registered Mobile',
      idPlaceholder: 'e.g. ASHA-PUN-042 or 9822099999',
      description: 'Register village households, perform doorstep rapid vitals triage, track maternal ANC & child immunizations, and queue offline records.'
    },
    admin: {
      title: 'Public Health Administration & Command Console',
      subtitle: 'Public Health Department, Government of Maharashtra',
      badge: 'Directorate & District Health Office',
      color: '#D97706',
      bgGradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      icon: <Building2 size={32} color="#FFFFFF" />,
      idLabel: 'Directorate Officer ID / Official Email',
      idPlaceholder: 'e.g. DHO-MH-ADMIN or admin@health.maharashtra.gov.in',
      description: 'Monitor live 36-district GIS accessibility, district hospital bed occupancy, bottleneck anomalies, medicine stockout radars, and citizen grievances.'
    }
  };

  const config = portalConfig[portalRole] || portalConfig.citizen;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !identifier.trim()) {
      setError('Username / Official ID is required.');
      return;
    }

    if (!password || !password.trim()) {
      setError('Password is required! Please enter your password or demo_password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password.trim(), portalRole);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('demo_user');
    setPassword('demo_password');
    setError(null);
  };

  const handleInstantDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(portalRole);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Instant login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!regPassword || !regPassword.trim()) {
      setError('Please create a password for your account.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail || `citizen.${regPhone.replace(/\D/g, '')}@ruralcare.in`,
          age: parseInt(regAge) || 25,
          gender: regGender,
          village_id: parseInt(regVillage) || 1,
          password: regPassword,
          role: 'citizen'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto login after registration
      await login(regPhone, regPassword, 'citizen');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F7F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Official Top Bar */}
      <header style={{
        height: '64px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2ECE5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBackToLanding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#F0F5F2',
              border: 'none',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#11322A',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Back to Gateway
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/ruralcare-mark.png" alt="Emblem" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#11322A' }}>RuralCare Maharashtra</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Public Health Directorate</div>
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          background: '#E8F5EE',
          color: config.color,
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          border: `1px solid ${config.color}30`
        }}>
          {config.badge}
        </span>
      </header>

      {/* Main Authentication Card Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: activeMode === 'register' ? '600px' : '480px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 12px 36px -4px rgba(17, 50, 42, 0.12), 0 4px 12px -2px rgba(17, 50, 42, 0.06)',
          border: '1px solid #E2ECE5',
          overflow: 'hidden'
        }}>
          
          {/* Top Banner with Portal Identity */}
          <div style={{
            background: config.bgGradient,
            padding: '2rem 2rem 1.75rem',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {config.icon}
            </div>

            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem' }}>
              {config.title}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
              {config.subtitle}
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            
            {/* Citizen Tab Switcher: Login vs Sign Up */}
            {portalRole === 'citizen' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                background: '#F0F5F2',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setError(null); }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: activeMode === 'login' ? '#11322A' : '#4B5563',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: activeMode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Citizen Login
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setError(null); }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeMode === 'register' ? '#FFFFFF' : 'transparent',
                    color: activeMode === 'register' ? '#11322A' : '#4B5563',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: activeMode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Create New Account
                </button>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Instant Demo Login Button (Required for Demo Review) */}
            <div style={{
              background: '#F8FAF9',
              border: '1px solid #D1D5DB',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#4B5563', marginBottom: '0.5rem', fontWeight: 600 }}>
                Demo Credentials &amp; Quick Access
              </div>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  background: config.color,
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${config.color}33`,
                  marginBottom: '0.65rem'
                }}
              >
                <Sparkles size={16} color="#FFFFFF" /> ⚡ 1-Click Instant Demo Login (as {config.badge})
              </button>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  width: '100%',
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1.5px dashed #94A3B8',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Auto-Fill Demo Credentials (demo_user / demo_password)
              </button>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.4rem' }}>
                Use <b>1-Click Demo Login</b> or enter credentials below.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2ECE5' }} />
              <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Or Official Credentials</span>
              <div style={{ flex: 1, height: '1px', background: '#E2ECE5' }} />
            </div>

            {/* LOGIN FORM */}
            {activeMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label" style={{ color: '#11322A', fontWeight: 600 }}>
                    {config.idLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={config.idPlaceholder}
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <User size={16} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ color: '#11322A', fontWeight: 600 }}>
                    Password / PIN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter official password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <Lock size={16} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#11322A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Authenticating...' : `Sign In to ${config.badge}`}
                </button>
              </form>
            ) : (
              /* CITIZEN NEW ACCOUNT REGISTRATION */
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Anand Kulkarni"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>Age</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 32"
                      value={regAge}
                      onChange={e => setRegAge(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>Gender</label>
                    <select
                      className="form-select"
                      value={regGender}
                      onChange={e => setRegGender(e.target.value)}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>District &amp; Village Location</label>
                  <select
                    className="form-select"
                    value={regVillage}
                    onChange={e => setRegVillage(e.target.value)}
                  >
                    {(villages && villages.length > 0) ? (
                      villages.slice(0, 36).map(v => (
                        <option key={v.village_id} value={v.village_id}>
                          {v.village_name} ({v.district})
                        </option>
                      ))
                    ) : (
                      <option value="1">Shivapur (Pune)</option>
                    )}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: '#11322A', fontWeight: 600, fontSize: '0.82rem' }}>Set Account Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Register & Log In to Health Portal'}
                </button>
              </form>
            )}

            {/* Portal security guarantee notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              fontSize: '0.72rem',
              color: '#6B7280',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={14} color="#0D9488" />
              <span>Government of Maharashtra Public Health Directorate &bull; HIPAA / DISHA Compliant</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
export default PortalLoginPage;
