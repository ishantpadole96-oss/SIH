import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, User } from 'lucide-react';

/**
 * Simulated Calling Modal — realistic phone call UI
 * Props: isOpen, onClose, calleeName, calleePhone, calleeFacility, calleeRole
 */
export function CallModal({ isOpen, onClose, calleeName, calleePhone, calleeFacility, calleeRole }) {
  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef(null);
  const ringTimerRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCallState('ringing');
      setElapsed(0);
      setIsMuted(false);
      setIsSpeaker(false);

      // Auto-connect after 3 seconds
      ringTimerRef.current = setTimeout(() => {
        setCallState('connected');
      }, 3000);

      return () => {
        clearTimeout(ringTimerRef.current);
        clearInterval(timerRef.current);
      };
    }
  }, [isOpen]);

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [callState]);

  const endCall = () => {
    setCallState('ended');
    clearInterval(timerRef.current);
    clearTimeout(ringTimerRef.current);
    setTimeout(() => onClose(), 1200);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const stateColor = callState === 'ringing' ? '#F59E0B' : callState === 'connected' ? '#10B981' : '#EF4444';
  const stateText = callState === 'ringing' ? 'Ringing...' : callState === 'connected' ? 'Connected' : 'Call Ended';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #1A2332 0%, #0F172A 100%)',
        padding: '2.5rem 2rem 2rem',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
      }}>

        {/* Ringing Pulse Animation */}
        {callState === 'ringing' && (
          <div style={{ position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              border: `2px solid ${stateColor}`,
              animation: 'callPulse 1.5s ease-out infinite',
              position: 'absolute', top: '-10px', left: '-10px'
            }} />
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              border: `1px solid ${stateColor}`,
              animation: 'callPulse 1.5s ease-out infinite 0.3s',
              position: 'absolute', top: '-20px', left: '-20px',
              opacity: 0.5
            }} />
            <div style={{
              width: '160px', height: '160px', borderRadius: '50%',
              border: `1px solid ${stateColor}`,
              animation: 'callPulse 1.5s ease-out infinite 0.6s',
              position: 'absolute', top: '-30px', left: '-30px',
              opacity: 0.25
            }} />
          </div>
        )}

        {/* Avatar */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${stateColor}33, ${stateColor}11)`,
          border: `3px solid ${stateColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          position: 'relative',
          zIndex: 2,
          transition: 'border-color 0.5s ease'
        }}>
          <User size={44} color={stateColor} />
        </div>

        {/* Name & Info */}
        <h3 style={{ color: '#FFFFFF', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          {calleeName || 'Unknown'}
        </h3>
        {calleeFacility && (
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            {calleeFacility}
          </div>
        )}
        {calleeRole && (
          <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
            {calleeRole}
          </div>
        )}

        {/* Phone Number */}
        <div style={{
          color: '#CBD5E1', fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700,
          marginBottom: '1rem', letterSpacing: '0.5px'
        }}>
          📞 {calleePhone || 'N/A'}
        </div>

        {/* Status */}
        <div style={{
          color: stateColor,
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          transition: 'color 0.5s ease'
        }}>
          {callState === 'connected' && (
            <span style={{ fontSize: '1.3rem', fontFamily: 'monospace', fontWeight: 800 }}>
              {formatTime(elapsed)}
            </span>
          )}
          <div>{stateText}</div>
        </div>

        {/* Call Controls */}
        {callState !== 'ended' && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {/* Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: isMuted ? '#EF4444' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {isMuted ? <MicOff size={22} color="#FFF" /> : <Mic size={22} color="#94A3B8" />}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <PhoneOff size={28} color="#FFF" />
            </button>

            {/* Speaker */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: isSpeaker ? '#2563EB' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {isSpeaker ? <Volume2 size={22} color="#FFF" /> : <VolumeX size={22} color="#94A3B8" />}
            </button>
          </div>
        )}

        {callState === 'ended' && (
          <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '1rem' }}>
            Call duration: {formatTime(elapsed)}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes callPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
