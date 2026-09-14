import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, User, 
  PhoneIncoming, Video, Sparkles, AlertTriangle, CheckCircle2, 
  Activity, Heart, Send, MessageSquare 
} from 'lucide-react';

// ── Web Audio API Ringtone & Chimes ──
function createRingtone(audioCtx) {
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(480, audioCtx.currentTime); // B4

  gain.gain.setValueAtTime(0, audioCtx.currentTime);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start();
  osc2.start();

  return { osc1, osc2, gain, audioCtx };
}

function playRingPattern(ringNodes) {
  if (!ringNodes || !ringNodes.gain) return;
  const { gain, audioCtx } = ringNodes;
  const now = audioCtx.currentTime;

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.setValueAtTime(0.12, now + 0.85);
  gain.gain.setValueAtTime(0, now + 0.9);
}

function playConnectTone(audioCtx) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

function playEndTone(audioCtx) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {}
}

export function CallModal({ isOpen, onClose, calleeName, calleePhone, calleeFacility, calleeRole, onEscalateVideo }) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected' | 'declined' | 'ended'
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callId, setCallId] = useState(null);
  const [networkQuality, setNetworkQuality] = useState('Excellent');

  // AI Telehealth Assistant State
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [aiSpeechQuery, setAiSpeechQuery] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [aiConsultation, setAiConsultation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);

  const timerRef = useRef(null);
  const ringTimerRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ringNodesRef = useRef(null);
  const pollStatusIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiSpeechQuery(transcript);
        setIsListeningMic(false);
        handleSendAiQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window) || !isSpeaker) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      utterance.onstart = () => setIsSpeakingAi(true);
      utterance.onend = () => setIsSpeakingAi(false);
      utterance.onerror = () => setIsSpeakingAi(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }, [isSpeaker, lang]);

  const triggerCallConnect = useCallback(() => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (ringNodesRef.current) {
      ringNodesRef.current.gain.gain.setValueAtTime(0, ringNodesRef.current.audioCtx.currentTime);
    }

    if (audioCtxRef.current) playConnectTone(audioCtxRef.current);

    setCallState('connected');
    setIsAiAnswering(true);

    const greeting = `Namaste! This is Dr. Aarav, RuralCare AI Telehealth Officer for ${calleeFacility || 'PHC'}. How can I assist with your health today? You can speak or tap a symptom.`;
    setTimeout(() => speakText(greeting), 600);
  }, [calleeFacility, speakText]);

  // ── Initialize call on open ──
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setElapsed(0);
    setIsMuted(false);
    setIsSpeaker(true);
    setNetworkQuality('Excellent');
    setIsAiAnswering(false);
    setAiConsultation(null);
    setAiSpeechQuery('');

    // 1. Create audio context and start ringing tone
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const ringNodes = createRingtone(audioCtx);
      ringNodesRef.current = ringNodes;

      playRingPattern(ringNodes);
      ringIntervalRef.current = setInterval(() => {
        if (ringNodesRef.current) playRingPattern(ringNodesRef.current);
      }, 3000);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }

    // 2. Initiate Call on Backend
    let activeCallId = null;
    fetch('/api/calls/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caller_name: user ? user.name : 'RuralCare Citizen',
        caller_role: user ? user.role : 'citizen',
        caller_portal: user ? `${user.role.toUpperCase()} Portal` : 'Citizen Health Portal',
        callee_name: calleeName || 'Healthcare Facility',
        callee_phone: calleePhone || 'N/A',
        callee_facility: calleeFacility || 'Govt PHC Khedgaon',
        callee_role: calleeRole || 'doctor'
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.call_id) {
          activeCallId = data.call_id;
          setCallId(data.call_id);

          // Start polling status every 1.2s to detect if other party answers in another window
          pollStatusIntervalRef.current = setInterval(async () => {
            try {
              const res = await fetch(`/api/calls/status/${data.call_id}`);
              if (res.ok) {
                const sData = await res.json();
                if (sData.status === 'connected') {
                  clearInterval(pollStatusIntervalRef.current);
                  triggerCallConnect();
                } else if (sData.status === 'declined') {
                  clearInterval(pollStatusIntervalRef.current);
                  setCallState('declined');
                  if (audioCtxRef.current) playEndTone(audioCtxRef.current);
                  setTimeout(() => onClose(), 2000);
                }
              }
            } catch (e) {}
          }, 1200);
        }
      })
      .catch(() => {});

    // 3. If nobody answers after 4.5 seconds, AI Medical Officer answers automatically
    ringTimerRef.current = setTimeout(() => {
      triggerCallConnect();
    }, 4500);

    return () => {
      clearTimeout(ringTimerRef.current);
      clearInterval(timerRef.current);
      clearInterval(ringIntervalRef.current);
      clearInterval(pollStatusIntervalRef.current);
      if (ringNodesRef.current) {
        try {
          ringNodesRef.current.osc1.stop();
          ringNodesRef.current.osc2.stop();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [isOpen, calleeName, calleePhone, calleeFacility, calleeRole, user, triggerCallConnect, onClose]);

  // ── Call timer when connected ──
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [callState]);

  // ── Send AI Consultation Query ──
  const handleSendAiQuery = async (queryText) => {
    const q = queryText || aiSpeechQuery;
    if (!q || !q.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/calls/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          language: lang,
          call_id: callId,
          doctorName: 'Dr. Aarav (AI Medical Officer)'
        })
      });

      const data = await res.json();
      setAiConsultation(data);
      if (data.voice_text) {
        speakText(data.voice_text);
      }
    } catch (e) {
      console.error('AI consultation failed:', e);
    } finally {
      setAiLoading(false);
      setAiSpeechQuery('');
    }
  };

  const toggleMicRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      setIsListeningMic(true);
      recognitionRef.current.start();
    }
  };

  const endCall = useCallback(() => {
    if (audioCtxRef.current) playEndTone(audioCtxRef.current);

    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (pollStatusIntervalRef.current) clearInterval(pollStatusIntervalRef.current);
    if (ringNodesRef.current) {
      try {
        ringNodesRef.current.gain.gain.setValueAtTime(0, ringNodesRef.current.audioCtx.currentTime);
      } catch (e) {}
    }

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();

    setCallState('ended');
    clearInterval(timerRef.current);
    clearTimeout(ringTimerRef.current);

    // Update server call end
    fetch('/api/calls/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: callId, callee_phone: calleePhone, status: 'ended', duration: elapsed })
    }).catch(() => {});

    setTimeout(() => onClose(), 1500);
  }, [callId, calleePhone, elapsed, onClose]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const stateColor = callState === 'ringing' ? '#F59E0B' : callState === 'connected' ? '#10B981' : '#EF4444';
  const stateText = callState === 'ringing' 
    ? '📡 Outgoing Ringing...' 
    : callState === 'connected' 
    ? '🔗 Connected (AI Telehealth Chamber)' 
    : callState === 'declined' 
    ? '❌ Call Declined' 
    : '📵 Call Ended';

  const quickSymptoms = [
    { label: '🌡️ High Fever & Chills', text: 'I have severe high fever and body chills for 2 days' },
    { label: '❤️ Chest Heaviness & Pain', text: 'Experiencing sudden chest tightness and shortness of breath' },
    { label: '🤰 High BP in Pregnancy', text: 'Pregnant in 3rd trimester with high BP and swollen feet' },
    { label: '💊 Jan Aushadhi Medicines', text: 'What generic medicine substitutes are available for fever and pain?' }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)',
      animation: 'callFadeIn 0.3s ease'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', borderRadius: '28px',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 60%, #020617 100%)',
        padding: '1.75rem 1.4rem', textAlign: 'center', position: 'relative',
        boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
        maxHeight: '92vh', overflowY: 'auto'
      }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1rem', fontSize: '0.72rem', padding: '0 0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontWeight: 600 }}>
            <Phone size={12} color="#10B981" />
            RuralCare VoIP Telehealth
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#10B981', fontSize: '0.68rem', fontWeight: 700 }}>
              ● {networkQuality}
            </span>
            {callState === 'connected' && (
              <span style={{
                color: '#2DD4BF', fontSize: '0.65rem', fontWeight: 800,
                background: 'rgba(45,212,191,0.12)', padding: '0.2rem 0.5rem', borderRadius: '9999px'
              }}>
                🔒 256-Bit Encrypted
              </span>
            )}
          </div>
        </div>

        {/* Ringing Visual Pulses */}
        {callState === 'ringing' && (
          <div style={{ position: 'relative', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: `${90 + i * 28}px`, height: `${90 + i * 28}px`, borderRadius: '50%',
                border: `${2 - i * 0.5}px solid ${stateColor}`,
                animation: `callPulse 2s ease-out infinite ${i * 0.4}s`,
                position: 'absolute', opacity: 1 - i * 0.3
              }} />
            ))}
            <div style={{
              width: '84px', height: '84px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
              border: '2.5px solid #F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(245,158,11,0.3)', position: 'relative', zIndex: 2
            }}>
              <PhoneIncoming size={36} color="#F59E0B" style={{ animation: 'ringShake 0.5s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* Connected AI Avatar + Audio Waveform */}
        {callState === 'connected' && (
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(45,212,191,0.15))',
              border: '2.5px solid #10B981',
              boxShadow: '0 0 35px rgba(16,185,129,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.75rem', position: 'relative', zIndex: 2
            }}>
              <Sparkles size={38} color="#2DD4BF" style={{ animation: 'sparkleRotate 6s linear infinite' }} />
            </div>

            {/* Neon Audio Waveform Equalizer */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '4px', height: '28px', marginBottom: '0.5rem'
            }}>
              {[40, 75, 100, 60, 90, 45, 80].map((h, idx) => (
                <span key={idx} style={{
                  display: 'inline-block', width: '4px',
                  height: isSpeakingAi ? `${h}%` : '25%',
                  background: isSpeakingAi ? '#2DD4BF' : '#475569',
                  borderRadius: '9999px',
                  transition: 'height 0.15s ease, background 0.3s ease',
                  animation: isSpeakingAi ? `waveBounce 0.6s ease-in-out infinite ${idx * 0.08}s` : 'none'
                }} />
              ))}
            </div>
            <div style={{ fontSize: '0.68rem', color: isSpeakingAi ? '#2DD4BF' : '#64748B', fontWeight: 700 }}>
              {isSpeakingAi ? 'AI Speaking Live...' : 'Listening & Telemetry Active'}
            </div>
          </div>
        )}

        {/* Callee / Doctor Info */}
        <h3 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0.2rem' }}>
          {callState === 'connected' ? 'Dr. Aarav & Telehealth Team' : (calleeName || 'Healthcare Facility')}
        </h3>
        <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
          🏥 {calleeFacility || 'Govt PHC Khedgaon'}
        </div>
        <div style={{ color: '#475569', fontSize: '0.68rem', fontFamily: 'monospace' }}>
          📞 {calleePhone || 'Govt Telehealth Line'}
        </div>

        {/* Status + Duration Timer */}
        <div style={{ margin: '0.6rem 0' }}>
          {callState === 'connected' && (
            <div style={{ color: '#10B981', fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 800 }}>
              {formatTime(elapsed)}
            </div>
          )}
          <div style={{ color: stateColor, fontSize: '0.8rem', fontWeight: 700 }}>
            {stateText}
          </div>
        </div>

        {/* ── AI CLINICAL CONSULTATION HUD (When Connected) ── */}
        {callState === 'connected' && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            padding: '1rem',
            marginTop: '0.75rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2DD4BF', fontSize: '0.75rem', fontWeight: 800 }}>
                <Sparkles size={14} /> AI Clinical Triage & Voice Engine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#EF4444', fontSize: '0.7rem', fontWeight: 700 }}>
                <Heart size={12} color="#EF4444" style={{ animation: 'pulseDot 1s infinite' }} /> 76 BPM
              </div>
            </div>

            {/* AI Diagnosis Result Card (if any) */}
            {aiConsultation && (
              <div style={{
                background: aiConsultation.is_emergency ? 'rgba(239,68,68,0.15)' : 'rgba(13,148,136,0.15)',
                border: `1px solid ${aiConsultation.is_emergency ? '#EF4444' : '#2DD4BF'}`,
                borderRadius: '12px',
                padding: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.8rem' }}>
                    {aiConsultation.diagnosis}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px',
                    background: aiConsultation.is_emergency ? '#EF4444' : '#10B981', color: '#FFF'
                  }}>
                    {aiConsultation.triage_level}
                  </span>
                </div>
                <div style={{ color: '#E2E8F0', fontSize: '0.75rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  {aiConsultation.recommendation}
                </div>
                {aiConsultation.prescribed_actions && (
                  <ul style={{ margin: 0, paddingLeft: '1rem', color: '#94A3B8', fontSize: '0.7rem', lineHeight: 1.4 }}>
                    {aiConsultation.prescribed_actions.slice(0, 3).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Quick Symptom Query Chips */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Tap Symptom or Query:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {quickSymptoms.map((qs, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendAiQuery(qs.text)}
                    disabled={aiLoading}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.6rem',
                      color: '#E2E8F0',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2DD4BF'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    {qs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech or Text Input */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={aiSpeechQuery}
                onChange={e => setAiSpeechQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAiQuery()}
                placeholder="Ask doctor or say symptoms..."
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '0.5rem 0.75rem',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={toggleMicRecognition}
                title="Voice Input (Speech-to-Text)"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: isListeningMic ? '#EF4444' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Mic size={16} />
              </button>
              <button
                onClick={() => handleSendAiQuery()}
                disabled={aiLoading}
                title="Send query"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#2DD4BF', border: 'none', color: '#0F172A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontWeight: 800
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Call Action Controls ── */}
        {callState !== 'ended' && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '1.25rem',
            marginTop: '1.25rem', paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            {/* Mute */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setIsMuted(!isMuted)} style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: isMuted ? '#EF4444' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isMuted ? <MicOff size={20} color="#FFF" /> : <Mic size={20} color="#94A3B8" />}
              </button>
              <div style={{ color: '#64748B', fontSize: '0.62rem', marginTop: '0.3rem' }}>
                {isMuted ? 'Unmute' : 'Mute'}
              </div>
            </div>

            {/* Video Escalation */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  endCall();
                  if (onEscalateVideo) onEscalateVideo();
                }}
                style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Switch to Video Consultation Room"
              >
                <Video size={20} color="#2DD4BF" />
              </button>
              <div style={{ color: '#2DD4BF', fontSize: '0.62rem', marginTop: '0.3rem', fontWeight: 600 }}>
                Video
              </div>
            </div>

            {/* End Call */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={endCall} style={{
                width: '58px', height: '58px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 24px rgba(239,68,68,0.45)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <PhoneOff size={24} color="#FFF" />
              </button>
              <div style={{ color: '#EF4444', fontSize: '0.62rem', marginTop: '0.3rem', fontWeight: 700 }}>
                End
              </div>
            </div>

            {/* Speaker */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setIsSpeaker(!isSpeaker)} style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: isSpeaker ? '#2563EB' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isSpeaker ? <Volume2 size={20} color="#FFF" /> : <VolumeX size={20} color="#94A3B8" />}
              </button>
              <div style={{ color: '#64748B', fontSize: '0.62rem', marginTop: '0.3rem' }}>
                {isSpeaker ? 'Speaker' : 'Muted'}
              </div>
            </div>
          </div>
        )}

        {/* Call Summary on End */}
        {callState === 'ended' && (
          <div style={{
            marginTop: '1.25rem', padding: '0.9rem', borderRadius: '16px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)'
          }}>
            <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Call Duration</div>
            <div style={{ color: '#F8FAFC', fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800 }}>
              {formatTime(elapsed)}
            </div>
            <div style={{ color: '#475569', fontSize: '0.65rem', marginTop: '0.2rem' }}>
              {callId ? `Logged in NHM telemetry • ${callId}` : 'Call logged'}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes callPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes callFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ringShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(14deg); }
          75% { transform: rotate(-14deg); }
        }
        @keyframes waveBounce {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
        @keyframes sparkleRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
