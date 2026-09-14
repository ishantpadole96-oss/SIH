import React, { useState, useEffect, useRef } from 'react';
import { PhoneIncoming, Phone, PhoneOff, User, MapPin, Building2, Stethoscope, HeartPulse } from 'lucide-react';

/**
 * IncomingCallBanner — live incoming call detection and ringing alert.
 * Polls /api/calls/incoming and sounds real audible ringtone when a call is placed.
 * Displays interactive answer / decline banner.
 */
export function IncomingCallBanner({ onAcceptCall }) {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // Poll for incoming calls every 2 seconds
  useEffect(() => {
    let isMounted = true;
    const pollIncoming = async () => {
      try {
        const res = await fetch('/api/calls/incoming');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.incoming_calls) {
          const fresh = data.incoming_calls.filter(c => !dismissed.has(c.call_id));
          setIncomingCalls(fresh);
        }
      } catch (e) {}
    };

    pollIncoming();
    const interval = setInterval(pollIncoming, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dismissed]);

  // Play realistic phone ringtone when there are incoming calls
  useEffect(() => {
    if (incomingCalls.length > 0) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const playRingPattern = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }

          const ctx = audioCtxRef.current;
          const now = ctx.currentTime;

          // Dual tone 440Hz + 480Hz (Indian/standard phone ring)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.setValueAtTime(0.08, now + 0.8);
          gain.gain.setValueAtTime(0, now + 0.85);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.9);
          osc2.stop(now + 0.9);
        };

        playRingPattern();
        ringIntervalRef.current = setInterval(playRingPattern, 3000);
      } catch (e) {}
    } else {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    }

    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [incomingCalls.length]);

  const handleDecline = (call) => {
    setDismissed(prev => new Set([...prev, call.call_id]));

    // Notify backend call was declined
    fetch('/api/calls/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: call.call_id, callee_phone: call.callee_phone, status: 'declined' })
    }).catch(() => {});
  };

  const handleAccept = (call) => {
    setDismissed(prev => new Set([...prev, call.call_id]));

    // Stop ring sound
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);

    // Notify server call is connected
    fetch('/api/calls/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: call.call_id, callee_phone: call.callee_phone, status: 'connected' })
    }).catch(() => {});

    // Open call modal
    if (onAcceptCall) onAcceptCall(call);
  };

  if (incomingCalls.length === 0) return null;

  return (
    <>
      {incomingCalls.map(call => (
        <div key={call.call_id} style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 10002,
          width: '380px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: '2px solid #10B981',
          boxShadow: '0 16px 50px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
          padding: '1.35rem',
          animation: 'incomingSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1), incomingPulse 2s ease-in-out infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.9rem' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.18)', border: '2px solid #10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'ringShake 0.6s ease-in-out infinite',
              flexShrink: 0
            }}>
              <PhoneIncoming size={26} color="#10B981" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#10B981', fontSize: '0.72rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.8px',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulseDot 1s infinite' }} />
                Incoming Telehealth Call
              </div>
              <div style={{ color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {call.caller_name || 'RuralCare Patient'}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.74rem', marginTop: '0.1rem' }}>
                From: {call.caller_portal || 'Citizen Health Portal'}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '0.5rem 0.75rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            color: '#CBD5E1',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Target: <strong>{call.callee_name}</strong></span>
            <span style={{ color: '#64748B', fontFamily: 'monospace' }}>{call.call_id.slice(-8)}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleAccept(call)}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none', color: '#FFF', fontWeight: 800, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Phone size={17} /> Accept Call
            </button>
            <button
              onClick={() => handleDecline(call)}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '12px',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444', fontWeight: 800, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <PhoneOff size={17} /> Decline
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes incomingSlide {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes incomingPulse {
          0%, 100% { box-shadow: 0 16px 50px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.08); }
          50% { box-shadow: 0 16px 50px rgba(16,185,129,0.6), 0 0 25px rgba(16,185,129,0.3); }
        }
        @keyframes ringShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(14deg); }
          75% { transform: rotate(-14deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </>
  );
}
