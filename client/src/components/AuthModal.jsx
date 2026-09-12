import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, X, Sparkles, CheckCircle2 } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login, demoLogin, villages } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('ramesh@ruralcare.in');
  const [password, setPassword] = useState('Demo@123');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regVillage, setRegVillage] = useState(1);
  const [regPassword, setRegPassword] = useState('Demo@123');

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800 }}>
            {mode === 'login' ? 'Sign In to RuralCare' : 'Create Citizen Account'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Quick Demo Login Grid for Evaluators */}
        <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#2DD4BF', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> 1-CLICK DEMO ACCOUNTS (PASSWORD: Demo@123)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuickDemoLogin('citizen')}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              🧑 Ramesh (Citizen)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('asha')}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              👩‍⚕️ Sunita (ASHA)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('doctor')}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              🩺 Dr. Rajesh (Doctor)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              🏛️ Sharma (Admin)
            </button>
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
            Password Login
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
            New Citizen Sign Up
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
              <label className="form-label">Email Address or Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ramesh@ruralcare.in or 9876543210"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Demo@123"
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Mode: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
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
                <label className="form-label">Mobile Number</label>
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
                <label className="form-label">Email</label>
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
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  value={regAge}
                  onChange={e => setRegAge(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Village</label>
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
              <label className="form-label">Password</label>
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
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
