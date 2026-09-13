import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldAlert,
  Ambulance, MapPin, Navigation, Clock, CheckCircle2, AlertTriangle,
  Radio, User, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function EmergencyCallModal({
  isOpen,
  onClose,
  serviceNumber = '108',
  serviceName = 'National Ambulance & Emergency Medical Services (MEMS 108)'
}) {
  const { selectedVillage, user } = useAuth();
  const { language, t } = useLanguage();

  const [callState, setCallState] = useState('connecting'); // 'connecting' | 'connected' | 'dispatched' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [micActive, setMicActive] = useState(true);
  const [speakerActive, setSpeakerActive] = useState(true);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null);
  const [operatorSpeech, setOperatorSpeech] = useState('');
  const [ambulanceETA, setAmbulanceETA] = useState(14); // mins

  const timerRef = useRef(null);

  const emergencyTypes = [
    { id: 'cardiac', label: 'Heart Attack / Severe Chest Pain', urgency: 'CRITICAL (ALS)' },
    { id: 'accident', label: 'Road Traffic Accident / Trauma', urgency: 'CRITICAL (ALS)' },
    { id: 'pregnancy', label: 'Pregnancy / Active Labour', urgency: 'HIGH (BLS)' },
    { id: 'snakebite', label: 'Snakebite / Acute Poisoning', urgency: 'CRITICAL (ALS)' },
    { id: 'respiratory', label: 'Severe Breathing Difficulty', urgency: 'HIGH (ALS)' },
    { id: 'other', label: 'Other Medical Crisis', urgency: 'MODERATE' }
  ];

  // GPS Coordinates & Location
  const curVillage = selectedVillage?.village_name || 'Khedgaon';
  const curDistrict = selectedVillage?.district || 'Nashik';
  const curLat = selectedVillage?.latitude || 20.0825;
  const curLng = selectedVillage?.longitude || 73.8567;

  // Speak operator dialogue using SpeechSynthesis
  const speakDialogue = (text) => {
    setOperatorSpeech(text);
    if ('speechSynthesis' in window && speakerActive) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'mr') {
        utterance.lang = 'mr-IN';
      } else if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCallState('connecting');
      setCallDuration(0);
      setSelectedEmergencyType(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    // Connect after 2.5 seconds ringing
    const connectTimer = setTimeout(() => {
      setCallState('connected');
      const greeting = language === 'mr'
        ? `महाराष्ट्र १०८ आपत्कालीन नियंत्रण कक्ष, पुणे. आम्ही आपले स्थान ${curVillage}, ${curDistrict} प्राप्त केले आहे. रुग्णवाहिका उपलब्ध होत आहे. आपत्कालीन परिस्थिती सांगा.`
        : language === 'hi'
        ? `महाराष्ट्र १०८ आपातकालीन नियंत्रण कक्ष, पुणे. आपका स्थान ${curVillage}, ${curDistrict} प्राप्त हो गया है। आपातकाल का कारण बताएं।`
        : `Maharashtra 108 Emergency Control Room, Pune. We have received your telemetry location at ${curVillage}, ${curDistrict}. Ambulances are on standby. What is the emergency?`;
      speakDialogue(greeting);
    }, 2200);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, curVillage, curDistrict, language]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected' || callState === 'dispatched') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const handleSelectEmergencyType = (type) => {
    setSelectedEmergencyType(type);
    setCallState('dispatched');

    const confirmMsg = language === 'mr'
      ? `नोंद केली: ${type.label}. ॲडव्हान्स लाइफ सपोर्ट रुग्णवाहिका क्र. MH-12-EM-108 तातडीने रवाना करण्यात आली आहे. अंदाजे वेळ १२ मिनिटे. शांत राहा, डॉक्टर सल्ल्यासाठी संपर्कात आहेत.`
      : language === 'hi'
      ? `दर्ज किया गया: ${type.label}। एडवांस लाइफ सपोर्ट एम्बुलेंस MH-12-EM-108 रवाना कर दी गई है। आने का समय लगभग 12 मिनट है। कृपया शांत रहें।`
      : `Confirmed: ${type.label}. Advance Life Support Ambulance MH-12-EM-108 has been dispatched to ${curVillage}. ETA is 12 minutes. Stay on the line.`;

    speakDialogue(confirmMsg);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 17, 0.94)',
      backdropFilter: 'blur(16px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#0B132B',
        border: '2px solid #EF4444',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(239, 68, 68, 0.35)',
        color: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header Strip */}
        <div style={{
          background: 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 100%)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 12px #EF4444',
              animation: 'pulse 1s infinite'
            }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                GOVERNMENT 108 EMERGENCY VOICE DISPATCH
              </div>
              <div style={{ fontSize: '0.75rem', color: '#FECACA' }}>
                Direct Satellite Telemetry Node • Pune EMRC
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Radio size={14} className="animate-pulse" color="#EF4444" />
            <span>{callState === 'connecting' ? 'DIALING...' : formatTimer(callDuration)}</span>
          </div>
        </div>

        {/* Main Call Body */}
        <div style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Animated Caller Avatar */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{
              position: 'absolute',
              inset: '-15px',
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              animation: 'pulse 1.8s infinite'
            }} />
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
            }}>
              {callState === 'dispatched' ? <Ambulance size={48} /> : <Phone size={44} />}
            </div>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
            {callState === 'connecting'
              ? 'Connecting to 108 Dispatcher...'
              : callState === 'dispatched'
              ? 'Ambulance Dispatched En Route!'
              : 'Connected with 108 Medical Officer'}
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#CBD5E1', maxWidth: '420px', lineHeight: 1.4, margin: '0 0 1.25rem 0' }}>
            {callState === 'connecting'
              ? 'Locking GPS telemetry coordinates and routing to nearest district ambulance depot...'
              : callState === 'dispatched'
              ? `Advanced Life Support Unit #MH-12-EM-108 dispatched to ${curVillage}. Driver: Santosh Shinde • Paramedic on board.`
              : 'Officer Sunita Kadam (108 EMRC Operator #402) on line. Automatic audio recording active for triage.'}
          </p>

          {/* GPS Coordinates Live Telemetry Box */}
          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}>
            <div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                TRANSMITTED EMERGENCY LOCATION
              </div>
              <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.95rem', marginTop: '2px' }}>
                📍 {curVillage}, Taluka {curDistrict}
              </div>
              <div style={{ color: '#38BDF8', fontSize: '0.75rem', marginTop: '2px' }}>
                GPS: {curLat.toFixed(4)}°N, {curLng.toFixed(4)}°E (Accuracy: 4.8m)
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                GPS LOCKED
              </span>
              <div style={{ color: '#F87171', fontWeight: 700, marginTop: '4px', fontSize: '0.8rem' }}>
                ETA: ~{ambulanceETA} Mins
              </div>
            </div>
          </div>

          {/* Operator Speech Dialogue Box */}
          {operatorSpeech && (
            <div style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              textAlign: 'left',
              color: '#FEE2E2',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 700, fontSize: '0.72rem', marginBottom: '4px' }}>
                <Volume2 size={14} /> 108 OPERATOR INSTRUCTIONS:
              </div>
              "{operatorSpeech}"
            </div>
          )}

          {/* Quick Emergency Type Selectors (If not yet dispatched) */}
          {callState === 'connected' && (
            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                Select Emergency Nature For Instant Priority Dispatch:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {emergencyTypes.map(et => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => handleSelectEmergencyType(et)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      padding: '0.7rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                  >
                    <div>{et.label}</div>
                    <div style={{ fontSize: '0.68rem', color: '#F87171', fontWeight: 700, marginTop: '2px' }}>
                      {et.urgency}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Waves Simulation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px', margin: '0.5rem 0 1.5rem 0' }}>
            {[14, 22, 18, 28, 12, 26, 16, 24, 10, 20].map((h, i) => (
              <span
                key={i}
                style={{
                  width: '3px',
                  height: `${h}px`,
                  background: callState === 'connecting' ? '#94A3B8' : '#EF4444',
                  borderRadius: '2px',
                  animation: callState !== 'connecting' ? `equalize 1s infinite alternate ${i * 0.1}s` : 'none'
                }}
              />
            ))}
          </div>

          {/* In-Call Phone Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: micActive ? '#1E293B' : 'rgba(239, 68, 68, 0.2)',
                color: micActive ? '#FFFFFF' : '#EF4444',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={micActive ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              style={{
                height: '52px',
                padding: '0 2rem',
                borderRadius: '999px',
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)'
              }}
            >
              <PhoneOff size={20} /> End Call
            </button>

            <button
              type="button"
              onClick={() => setSpeakerActive(!speakerActive)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: speakerActive ? '#1E293B' : 'rgba(239, 68, 68, 0.2)',
                color: speakerActive ? '#FFFFFF' : '#EF4444',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={speakerActive ? 'Mute Speaker' : 'Turn On Speaker'}
            >
              {speakerActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          {/* Alternative phone dialer fallback */}
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94A3B8' }}>
            Prefer native phone SIM? <a href={`tel:${serviceNumber}`} style={{ color: '#38BDF8', fontWeight: 700 }}>Tap to dial {serviceNumber} directly</a>
          </div>

        </div>

      </div>
    </div>
  );
}
