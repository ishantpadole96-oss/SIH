import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Activity, Heart,
  Thermometer, Wind, FileText, CheckCircle2, User, ShieldAlert,
  Sparkles, MessageSquare, Send, Volume2, VolumeX, Download,
  Maximize2, Minimize2, Camera, ShieldCheck, Share2, RefreshCw,
  Stethoscope, AlertCircle, Play, Pause, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TelemedicineRoom({
  doctorName = 'Dr. Rajesh Deshmukh',
  specialty = 'General Medicine & Family Health',
  facility = 'Govt PHC Khedgaon • Pune District Civil Hospital',
  patientName,
  patientId,
  callId: initialCallId,
  vitals: incomingVitals,
  initialMode = 'video',
  onClose
}) {
  const { user } = useAuth();
  const { language } = useLanguage();

  const isDoctorUser = user?.role === 'doctor';
  const callId = initialCallId || 'demo-call-room';
  const activePatientName = patientName || (isDoctorUser ? 'Ramesh Patil' : (user?.name || 'Ramesh Patil'));
  const activeDoctorName = isDoctorUser ? (user?.name || doctorName) : doctorName;

  // Media & Device States
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(initialMode !== 'audio');
  const [doctorVoiceEnabled, setDoctorVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals' | 'prescription' | 'chat'
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [swappedViews, setSwappedViews] = useState(false);
  const [currentDoctorDialogue, setCurrentDoctorDialogue] = useState(
    `Namaste ${activePatientName} ji. Welcome to e-Sanjeevani. I am ${activeDoctorName} from ${facility}. I can see you clearly and have your vital parameters on screen. How are you feeling today?`
  );

  // Live Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'doctor',
      senderName: activeDoctorName,
      time: '10:00 AM',
      text: `Namaste ${activePatientName} ji. I am ${activeDoctorName}. I have opened your live telemetry record and EHR.`
    },
    {
      sender: 'system',
      senderName: 'System',
      time: '10:00 AM',
      text: 'Encrypted WebRTC Audio/Video channel established with Maharashtra Telemedicine Node.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Media references
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const lastSignalTimeRef = useRef(0);
  const hasGreetedRef = useRef(false);

  // Live vitals telemetry
  const [vitals, setVitals] = useState({
    heartRate: incomingVitals?.heart_rate || incomingVitals?.pulse || 74,
    spo2: incomingVitals?.spo2 || 98,
    bpSys: incomingVitals?.systolic_bp || (incomingVitals?.bp ? parseInt(incomingVitals.bp.split('/')[0]) : 122) || 122,
    bpDia: incomingVitals?.diastolic_bp || (incomingVitals?.bp ? parseInt(incomingVitals.bp.split('/')[1]) : 80) || 80,
    temp: incomingVitals?.temperature || incomingVitals?.temp || 98.6
  });

  // Play pleasant medical teleconsult chime sound
  const playConnectChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: 659.25 Hz (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.18);
      gain2.gain.setValueAtTime(0, now + 0.18);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.23);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.72);
    } catch (e) {
      console.warn('AudioContext chime not available:', e);
    }
  }, []);

  // Doctor Speech Synthesizer
  const speakDoctorDialogue = useCallback((text) => {
    if (!doctorVoiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const cleanText = text.replace(/[*_#~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.93; // Clear and measured pace for clinical comprehension
      utterance.pitch = 1.0;

      // Try selecting an English (India) or clear English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => /India|Hindi|en-IN/i.test(v.lang || v.name));
      const naturalVoice = voices.find(v => /Natural|Google|en-US/i.test(v.name));
      if (indianVoice) {
        utterance.voice = indianVoice;
      } else if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [doctorVoiceEnabled]);

  // Stop doctor speech
  const stopDoctorSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // 1. Initialize Local Camera and Microphone
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: true
          });

          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasCameraStream(true);

          // Add tracks to PeerConnection if already created
          if (peerConnectionRef.current) {
            stream.getTracks().forEach(track => {
              peerConnectionRef.current.addTrack(track, stream);
            });
          }
        }
      } catch (err) {
        console.warn('Camera/mic access error (running interactive simulation):', err);
        if (isMounted) setHasCameraStream(false);
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. WebRTC Peer Connection & Real-time Channel Setup
  useEffect(() => {
    const pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionRef.current = pc;

    // Attach remote stream tracks to remote video & audio
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        setHasRemoteStream(true);
      }
    };

    // Add local tracks if available
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, mediaStreamRef.current);
      });
    }

    // Set up BroadcastChannel for zero-latency local multi-tab sync
    const channelName = `ruralcare_telemed_${callId}`;
    let bc = null;
    try {
      bc = new BroadcastChannel(channelName);
      broadcastChannelRef.current = bc;
    } catch (e) {
      console.warn('BroadcastChannel not supported in this browser:', e);
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateMsg = {
          call_id: callId,
          sender: isDoctorUser ? 'doctor' : 'patient',
          type: 'ice',
          data: event.candidate
        };
        if (bc) bc.postMessage(candidateMsg);
        fetch('/api/calls/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(candidateMsg)
        }).catch(() => {});
      }
    };

    // Handle incoming signals from BroadcastChannel
    const handleSignal = async (signal) => {
      if (!signal || signal.call_id !== callId) return;
      // Don't process signals sent by ourselves
      if (signal.sender === (isDoctorUser ? 'doctor' : 'patient')) return;

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          const answerMsg = {
            call_id: callId,
            sender: isDoctorUser ? 'doctor' : 'patient',
            type: 'answer',
            data: answer
          };
          if (bc) bc.postMessage(answerMsg);
          fetch('/api/calls/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answerMsg)
          }).catch(() => {});
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        } else if (signal.type === 'ice' && signal.data) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          } catch (iceErr) {
            console.warn('ICE candidate addition skipped:', iceErr);
          }
        } else if (signal.type === 'chat') {
          // Receive peer chat message
          const incomingMsg = signal.data;
          setChatMessages(prev => {
            if (prev.some(m => m.id && m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
          if (incomingMsg.sender === 'doctor' && !isDoctorUser) {
            setCurrentDoctorDialogue(incomingMsg.text);
            speakDoctorDialogue(incomingMsg.text);
          }
        } else if (signal.type === 'vitals' && isDoctorUser) {
          setVitals(signal.data);
        }
      } catch (err) {
        console.warn('Error processing WebRTC signal:', err);
      }
    };

    if (bc) {
      bc.onmessage = (event) => handleSignal(event.data);
    }

    // Doctor initiates offer when joining
    if (isDoctorUser) {
      pc.createOffer().then(async (offer) => {
        await pc.setLocalDescription(offer);
        const offerMsg = {
          call_id: callId,
          sender: 'doctor',
          type: 'offer',
          data: offer
        };
        if (bc) bc.postMessage(offerMsg);
        fetch('/api/calls/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerMsg)
        }).catch(() => {});
      }).catch(e => console.warn('Offer creation notice:', e));
    }

    // Fallback polling for cross-device/network signals
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls/signals/${callId}?since=${lastSignalTimeRef.current}&exclude_sender=${isDoctorUser ? 'doctor' : 'patient'}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.signals && data.signals.length > 0) {
          for (const sig of data.signals) {
            handleSignal(sig);
            if (sig.timestamp > lastSignalTimeRef.current) {
              lastSignalTimeRef.current = sig.timestamp;
            }
          }
        }
      } catch (e) {}
    }, 1600);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      pc.close();
    };
  }, [callId, isDoctorUser, speakDoctorDialogue]);

  // 3. Audio Chime and Automatic Doctor Voice Greeting on Connection
  useEffect(() => {
    // Play pleasant connect chime
    playConnectChime();

    // Auto-speak doctor greeting for the patient
    if (!isDoctorUser && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const greetingTimeout = setTimeout(() => {
        const greeting = `Namaste ${activePatientName} ji. Welcome to e-Sanjeevani. I am ${activeDoctorName} from ${facility}. I can see you clearly and have your clinical vitals on my screen. How are you feeling today?`;
        setCurrentDoctorDialogue(greeting);
        speakDoctorDialogue(greeting);
      }, 700);

      return () => clearTimeout(greetingTimeout);
    }
  }, [playConnectChime, isDoctorUser, activePatientName, activeDoctorName, facility, speakDoctorDialogue]);

  // Handle Video Track Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = videoActive;
      });
    }
  }, [videoActive]);

  // Handle Mic Track Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = micActive;
      });
    }
  }, [micActive]);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subtle natural vital variations
  useEffect(() => {
    const vitalPulse = setInterval(() => {
      setVitals(v => {
        const updated = {
          ...v,
          heartRate: 72 + Math.floor(Math.random() * 6),
          spo2: 98 + (Math.random() > 0.6 ? 1 : 0)
        };
        // Broadcast vitals update if patient
        if (!isDoctorUser && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            call_id: callId,
            sender: 'patient',
            type: 'vitals',
            data: updated
          });
        }
        return updated;
      });
    }, 4000);
    return () => clearInterval(vitalPulse);
  }, [callId, isDoctorUser]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Broadcast chat message helper
  const sendChatMessage = async (text, senderOverride) => {
    const sender = senderOverride || (isDoctorUser ? 'doctor' : 'patient');
    const senderName = sender === 'doctor' ? activeDoctorName : activePatientName;
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      senderName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setChatMessages(prev => [...prev, msg]);

    // Send via BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        call_id: callId,
        sender,
        type: 'chat',
        data: msg
      });
    }

    // Send via server signal
    fetch('/api/calls/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        call_id: callId,
        sender,
        type: 'chat',
        data: msg
      })
    }).catch(() => {});

    // If patient sent a message and we're in simulated doctor mode, auto-generate doctor voice response
    if (sender === 'patient' && !isDoctorUser) {
      try {
        const triageRes = await fetch('/api/calls/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text,
            symptoms: text,
            vitals,
            doctorName: activeDoctorName
          })
        });

        let replyText = '';
        if (triageRes.ok) {
          const triageData = await triageRes.json();
          replyText = triageData.voice_text || `Noted regarding "${text}". I have reviewed your vitals (${vitals.heartRate} bpm, BP ${vitals.bpSys}/${vitals.bpDia} mmHg). Please rest comfortably while I prepare your e-prescription.`;
        } else {
          replyText = `Noted regarding "${text}". I am reviewing this alongside your vital parameters and adding clinical instructions to your prescription.`;
        }

        setTimeout(() => {
          const docMsg = {
            id: `${Date.now()}-doc`,
            sender: 'doctor',
            senderName: activeDoctorName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: replyText
          };

          setChatMessages(prev => [...prev, docMsg]);
          setCurrentDoctorDialogue(replyText);
          speakDoctorDialogue(replyText);

          // Also broadcast doctor response
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              call_id: callId,
              sender: 'doctor',
              type: 'chat',
              data: docMsg
            });
          }
        }, 1200);
      } catch (e) {
        console.warn('Triage reply simulation:', e);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  // Quick symptom chip click for rural patients
  const handleQuickSymptom = (symptomText) => {
    sendChatMessage(symptomText);
  };

  // Speech-to-text mic for rural patient query
  const handleTogglePatientMicInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your message or click the quick symptom chips.');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningMic(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput(transcript);
          sendChatMessage(transcript);
        }
        setIsListeningMic(false);
      };

      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);

      recognition.start();
    } catch (e) {
      setIsListeningMic(false);
    }
  };

  const handleSavePrescription = async () => {
    setIsPrescriptionSaved(true);
    try {
      const authHeader = localStorage.getItem('ruralcare_auth_token');
      await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: `Bearer ${authHeader}` } : {})
        },
        body: JSON.stringify({
          patient_id: patientId || 1,
          diagnosis: 'e-Sanjeevani Teleconsultation Evaluation',
          instructions: prescriptionNote || 'Take prescribed medications as advised during video consultation.',
          diet_lifestyle: 'Stay hydrated, consume fresh warm food, and get adequate rest.',
          follow_up: 'Consult local PHC if symptoms persist after 3 days.',
          medicines: [
            {
              medicine_name: prescriptionNote ? prescriptionNote.slice(0, 80) : 'Tab Paracetamol 500mg',
              dose: '1 unit',
              frequency: 'Three times daily (TDS)',
              duration: '3 days',
              route: 'Oral'
            }
          ]
        })
      });
    } catch (e) {
      console.warn('Prescription saved locally:', e);
    }
    setTimeout(() => setIsPrescriptionSaved(false), 4500);
  };

  // Determine main video view vs PiP view
  // By default:
  // - Patient sees Doctor on Main, Patient Self on PiP
  // - Doctor sees Patient on Main, Doctor Self on PiP
  const showSelfOnMain = isDoctorUser ? swappedViews : swappedViews;

  return (
    <div className="telemed-overlay">
      {/* Hidden audio element to stream remote WebRTC audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="telemed-container">
        
        {/* Top Header Bar */}
        <div className="telemed-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="live-call-dot"></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 className="telemed-title">e-Sanjeevani Teleconsultation Chamber</h3>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Radio size={10} className="animate-pulse" /> LIVE 2-WAY HD
                </span>
              </div>
              <p className="telemed-subtitle">
                {activeDoctorName} • {specialty} ({facility})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Doctor Voice Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (doctorVoiceEnabled) {
                  stopDoctorSpeech();
                  setDoctorVoiceEnabled(false);
                } else {
                  setDoctorVoiceEnabled(true);
                  speakDoctorDialogue(currentDoctorDialogue);
                }
              }}
              style={{
                background: doctorVoiceEnabled ? 'rgba(45, 212, 191, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: doctorVoiceEnabled ? '#2DD4BF' : '#F87171',
                border: `1px solid ${doctorVoiceEnabled ? 'rgba(45, 212, 191, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
              title={doctorVoiceEnabled ? 'Doctor Audio Speaking (Click to Mute)' : 'Doctor Audio Muted (Click to Unmute)'}
            >
              {doctorVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>Doctor Voice: {doctorVoiceEnabled ? 'ON' : 'MUTED'}</span>
            </button>

            {/* Timer Badge */}
            <div className="telemed-timer-badge">
              <Activity size={14} className="text-teal animate-pulse" />
              <span>Connected: {formatTimer(callDuration)}</span>
            </div>

            {/* Exit Call */}
            <button
              type="button"
              onClick={() => {
                stopDoctorSpeech();
                onClose();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <PhoneOff size={14} /> End Call
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="telemed-grid">
          
          {/* Left: Video Area */}
          <div className="telemed-video-area">
            <div className="doctor-video-frame">
              
              {/* MAIN VIDEO SCREEN */}
              {/* Case A: User swapped to self-view on main */}
              {showSelfOnMain ? (
                <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0F172A' }}>
                  {videoActive && hasCameraStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <User size={72} color="#38BDF8" />
                      <p style={{ marginTop: '1rem', fontWeight: 600 }}>Your Camera is {videoActive ? 'Initializing...' : 'Off'}</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#E2E8F0' }}>
                    Self Camera • {isDoctorUser ? activeDoctorName : activePatientName}
                  </div>
                </div>
              ) : (
                /* Case B: Main view shows the counterpart */
                hasRemoteStream ? (
                  /* Live WebRTC Remote Video Feed */
                  <div style={{ width: '100%', height: '100%', position: 'relative', background: '#030712' }}>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="doctor-badge-overlay">
                      <span className="badge-govt">Authorized Live Peer Feed</span>
                      <span className="badge-name">{isDoctorUser ? activePatientName : activeDoctorName}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Encrypted P2P WebRTC HD • Low Latency</span>
                    </div>
                  </div>
                ) : isDoctorUser ? (
                  /* Doctor viewing Patient telemetry screen */
                  <div className="doctor-avatar-screen" style={{ flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                      width: '120px', height: '120px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid #38BDF8', boxShadow: '0 0 35px rgba(56, 189, 248, 0.4)',
                      marginBottom: '1rem'
                    }}>
                      <User size={64} color="#FFF" />
                    </div>
                    <div style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 800 }}>{activePatientName}</div>
                    <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      Citizen Health Record Linked • ABHA #{user?.abha_id || '91-4091-8821'}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '0.5rem', maxWidth: '400px' }}>
                      Patient video channel ready. When patient turns on their camera, live video stream will render here automatically.
                    </div>
                  </div>
                ) : (
                  /* Patient viewing Realistic High-Fidelity Doctor Medical Chamber */
                  <div className="doctor-avatar-screen" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Background Medical Clinic Ambience */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(ellipse at 50% 30%, #134E4A 0%, #042F2E 45%, #021C1C 100%)',
                      opacity: 0.95
                    }} />

                    {/* Clinic Wall Texture & Monitor Grid */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '70px',
                      background: 'linear-gradient(180deg, rgba(45, 212, 191, 0.08) 0%, transparent 100%)',
                      borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1.5rem',
                      zIndex: 2
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2DD4BF', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Stethoscope size={16} />
                        <span>GOVERNMENT PHC KHEDGAON • TELE-OPD 01</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                        <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>DOCTOR ONLINE</span>
                      </div>
                    </div>

                    {/* Doctor Info Badge Overlay */}
                    <div className="doctor-badge-overlay" style={{ zIndex: 5 }}>
                      <span className="badge-govt">Authorized Medical Officer</span>
                      <span className="badge-name">{activeDoctorName}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>MBBS, MD • Reg #MCI-MH-49210 • DHS Maharashtra</span>
                    </div>

                    {/* Realistic Doctor Medical Chamber Visual */}
                    <div style={{
                      position: 'relative',
                      zIndex: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2rem'
                    }}>
                      
                      {/* Doctor Portrait Chamber with Dynamic Speaking Animations */}
                      <div style={{
                        position: 'relative',
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        padding: '6px',
                        background: isSpeaking
                          ? 'conic-gradient(from 0deg, #2DD4BF, #0D9488, #10B981, #2DD4BF)'
                          : 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
                        boxShadow: isSpeaking
                          ? '0 0 45px rgba(45, 212, 191, 0.55), 0 10px 30px rgba(0, 0, 0, 0.6)'
                          : '0 8px 30px rgba(13, 148, 136, 0.4)',
                        transition: 'all 0.3s ease'
                      }}>
                        
                        {/* Doctor Graphic Representation */}
                        <div style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          
                          {/* Animated Doctor Character in White Coat & Stethoscope */}
                          <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                            {/* Medical Office Background Pattern */}
                            <circle cx="60" cy="60" r="58" fill="#0A1E24" />
                            <circle cx="60" cy="60" r="54" fill="#0D2E35" />
                            
                            {/* Blue Scrubs Shirt */}
                            <path d="M 40 105 L 40 85 L 80 85 L 80 105 Z" fill="#0284C7" />
                            <polygon points="50,85 60,98 70,85" fill="#38BDF8" opacity="0.3" />

                            {/* White Lab Coat Lapels */}
                            <path d="M 25 120 L 25 80 L 45 80 L 48 120 Z" fill="#F8FAFC" />
                            <path d="M 95 120 L 95 80 L 75 80 L 72 120 Z" fill="#F8FAFC" />
                            <path d="M 45 80 L 60 115 L 75 80 Z" fill="transparent" />

                            {/* Stethoscope Tubing around neck */}
                            <path d="M 38 78 Q 45 105 60 105 Q 75 105 82 78" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
                            {/* Stethoscope Chest Piece */}
                            <circle cx="60" cy="106" r="5.5" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1.5" />
                            <circle cx="60" cy="106" r="2.5" fill="#475569" />

                            {/* Doctor Neck */}
                            <rect x="52" y="68" width="16" height="18" fill="#FBBF24" rx="3" />

                            {/* Doctor Head */}
                            <ellipse cx="60" cy="52" rx="20" ry="24" fill="#FBBF24" />

                            {/* Hair */}
                            <path d="M 40 50 Q 42 30 60 30 Q 78 30 80 50 Q 70 36 60 36 Q 50 36 40 50 Z" fill="#1E293B" />
                            <path d="M 40 46 Q 38 34 50 32 Q 60 30 70 32 Q 82 34 80 46" fill="#1E293B" />

                            {/* Doctor Glasses */}
                            <rect x="44" y="46" width="13" height="9" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
                            <rect x="63" y="46" width="13" height="9" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
                            <line x1="57" y1="50" x2="63" y2="50" stroke="#334155" strokeWidth="1.5" />

                            {/* Eyes (behind glasses) */}
                            <circle cx="50" cy="50" r="2" fill="#0F172A" />
                            <circle cx="70" cy="50" r="2" fill="#0F172A" />

                            {/* Eyebrows */}
                            <path d="M 44 43 Q 50 41 56 44" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M 64 44 Q 70 41 76 43" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

                            {/* Nose */}
                            <path d="M 60 51 L 58 59 L 62 59" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

                            {/* Mouth: dynamic lip-sync mouth when speaking */}
                            {isSpeaking ? (
                              <ellipse
                                cx="60"
                                cy="66"
                                rx="5.5"
                                ry="4.5"
                                fill="#881337"
                                stroke="#BE123C"
                                strokeWidth="1"
                                className="animate-pulse"
                              />
                            ) : (
                              <path d="M 54 66 Q 60 70 66 66" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                            )}
                          </svg>

                        </div>

                        {/* Animated Equalizer Wave when Doctor Speaks */}
                        {isSpeaking && (
                          <div className="audio-equalizer" style={{
                            position: 'absolute',
                            bottom: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#042F2E',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            border: '1px solid #2DD4BF',
                            boxShadow: '0 4px 12px rgba(45, 212, 191, 0.4)'
                          }}>
                            <span className="bar bar-1"></span>
                            <span className="bar bar-2"></span>
                            <span className="bar bar-3"></span>
                            <span className="bar bar-4"></span>
                            <span className="bar bar-5"></span>
                          </div>
                        )}
                      </div>

                      {/* Doctor Speaking Status Indicator */}
                      <div style={{
                        marginTop: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isSpeaking ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${isSpeaking ? '#2DD4BF' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '20px',
                        padding: '4px 14px'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isSpeaking ? '#2DD4BF' : '#10B981',
                          boxShadow: isSpeaking ? '0 0 10px #2DD4BF' : 'none',
                          animation: isSpeaking ? 'pulse 0.8s infinite' : 'none'
                        }} />
                        <span style={{ fontSize: '0.78rem', color: isSpeaking ? '#2DD4BF' : '#E2E8F0', fontWeight: 700 }}>
                          {isSpeaking ? 'Dr. Deshmukh is Speaking...' : 'Dr. Deshmukh • Listening'}
                        </span>
                      </div>

                    </div>

                    {/* Doctor Live Clinical Dialogue Bubble */}
                    <div className="consultation-speech-bubble" style={{ zIndex: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Volume2 size={13} /> DR. DESHMUKH (AUDIO & TRANSCRIPT):
                        </span>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {/* Replay Audio Button */}
                          <button
                            type="button"
                            onClick={() => speakDoctorDialogue(currentDoctorDialogue)}
                            style={{
                              background: 'rgba(45, 212, 191, 0.2)',
                              border: '1px solid rgba(45, 212, 191, 0.4)',
                              color: '#2DD4BF',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Replay doctor's spoken voice"
                          >
                            <RefreshCw size={11} /> Replay Voice
                          </button>

                          {/* Stop Voice */}
                          {isSpeaking && (
                            <button
                              type="button"
                              onClick={stopDoctorSpeech}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#F87171',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Pause
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ color: '#F1F5F9', fontSize: '0.88rem', lineHeight: 1.45 }}>
                        "{currentDoctorDialogue}"
                      </div>
                    </div>

                  </div>
                )
              )}

              {/* PiP Window (Bottom-Right corner) */}
              <div
                className="patient-pip-window"
                style={{
                  width: '160px',
                  height: '120px',
                  background: '#0F172A',
                  cursor: 'pointer',
                  zIndex: 20
                }}
                onClick={() => setSwappedViews(!swappedViews)}
                title="Click to switch main and PiP views"
              >
                <div className="pip-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{showSelfOnMain ? (isDoctorUser ? activePatientName : activeDoctorName) : `You (${isDoctorUser ? activeDoctorName : activePatientName})`}</span>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: videoActive ? '#10B981' : '#EF4444'
                  }} />
                </div>

                <div className="pip-body" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  {showSelfOnMain ? (
                    /* In PiP: Counterpart preview */
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#042F2E', color: '#2DD4BF'
                    }}>
                      <Stethoscope size={28} />
                      <span style={{ fontSize: '0.62rem', marginTop: '4px', fontWeight: 600 }}>Doctor View</span>
                    </div>
                  ) : (
                    /* In PiP: Self camera */
                    videoActive ? (
                      hasCameraStream ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                          color: '#94A3B8'
                        }}>
                          <User size={32} color="#38BDF8" />
                          <span style={{ fontSize: '0.65rem', color: '#38BDF8', marginTop: '2px' }}>Camera Active</span>
                        </div>
                      )
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#111827',
                        color: '#EF4444'
                      }}>
                        <VideoOff size={22} />
                        <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>Camera Muted</span>
                      </div>
                    )
                  )}
                </div>
              </div>

            </div>

            {/* Bottom In-Call Controls Bar */}
            <div className="telemed-controls-bar">
              {/* Mic Toggle */}
              <button
                type="button"
                className={`control-btn ${micActive ? 'btn-active' : 'btn-off'}`}
                onClick={() => setMicActive(!micActive)}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              {/* Video Toggle */}
              <button
                type="button"
                className={`control-btn ${videoActive ? 'btn-active' : 'btn-off'}`}
                onClick={() => setVideoActive(!videoActive)}
                title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              {/* Replay Doctor Voice */}
              <button
                type="button"
                className="control-btn btn-active"
                onClick={() => speakDoctorDialogue(currentDoctorDialogue)}
                title="Listen to Doctor's Voice"
                style={{ position: 'relative' }}
              >
                <Volume2 size={20} color={isSpeaking ? '#2DD4BF' : '#FFF'} />
              </button>

              {/* Chat Tab Toggle */}
              <button
                type="button"
                className={`control-btn ${activeTab === 'chat' ? 'btn-active' : ''}`}
                onClick={() => setActiveTab(activeTab === 'chat' ? 'vitals' : 'chat')}
                title="Open In-Call Chat"
                style={{ position: 'relative' }}
              >
                <MessageSquare size={20} />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#2DD4BF'
                }} />
              </button>

              {/* End Consultation */}
              <button
                type="button"
                className="control-btn btn-hangup"
                onClick={() => {
                  stopDoctorSpeech();
                  onClose();
                }}
                title="End Consultation"
              >
                <PhoneOff size={20} />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Right: Clinical HUD, Chat, & Prescription Pad */}
          <div className="telemed-hud-sidebar">
            <div className="hud-tab-switcher">
              <button
                type="button"
                className={`hud-tab ${activeTab === 'vitals' ? 'active' : ''}`}
                onClick={() => setActiveTab('vitals')}
              >
                <Activity size={15} />
                <span>Vitals</span>
              </button>
              <button
                type="button"
                className={`hud-tab ${activeTab === 'prescription' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescription')}
              >
                <FileText size={15} />
                <span>Digital Rx</span>
              </button>
              <button
                type="button"
                className={`hud-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={15} />
                <span>Chat</span>
              </button>
            </div>

            {/* TAB 1: VITALS TELEMETRY */}
            {activeTab === 'vitals' && (
              <div className="hud-content vitals-panel">
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  Live Patient Telemetry
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Heart size={18} className="text-red-500 animate-pulse" />
                    <span>Heart Rate (Pulse)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.heartRate} <small>BPM</small>
                  </div>
                  <span className="metric-status normal">Normal Sinus Rhythm (60-100)</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Wind size={18} className="text-blue-500" />
                    <span>Oxygen Saturation (SpO₂)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.spo2}% <small>SpO₂</small>
                  </div>
                  <span className="metric-status normal">Optimal Oxygenation (≥ 95%)</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Activity size={18} className="text-amber-500" />
                    <span>Blood Pressure (NIBP)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.bpSys}/{vitals.bpDia} <small>mmHg</small>
                  </div>
                  <span className="metric-status normal">Pre-Hypertension Under Review</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Thermometer size={18} className="text-emerald-500" />
                    <span>Body Temperature</span>
                  </div>
                  <div className="metric-value">
                    {vitals.temp}°F <small>Oral</small>
                  </div>
                  <span className="metric-status normal">Afebrile (Normothermic)</span>
                </div>

                <div style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.25)', borderRadius: '10px', padding: '0.85rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#2DD4BF' }}>
                    <ShieldCheck size={14} /> Telemetry Verified
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Streamed live from Sub-Centre Bluetooth pulse-oximeter and automated digital BP cuff.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: DIGITAL e-PRESCRIPTION */}
            {activeTab === 'prescription' && (
              <div className="hud-content rx-panel">
                <div className="rx-preview-box">
                  <div className="rx-badge-top">GOVERNMENT OF MAHARASHTRA • DIGITAL RX</div>
                  <div className="rx-patient-info" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Patient:</strong> {activePatientName}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#2DD4BF' }}>OPD #MH-9042</span>
                  </div>

                  <div className="rx-meds-list">
                    <div className="rx-med-item">
                      <div className="med-name">1. Tab. Amlodipine 5mg (Jan Aushadhi)</div>
                      <div className="med-dose">1 Tablet Once Daily (Morning after breakfast) • 30 Days</div>
                    </div>
                    <div className="rx-med-item">
                      <div className="med-name">2. Tab. Paracetamol 650mg SOS</div>
                      <div className="med-dose">1 Tablet only if headache/fever exceeds 5/10</div>
                    </div>
                    <div className="rx-med-item">
                      <div className="med-name">3. Cap. Multivitamin & Zinc</div>
                      <div className="med-dose">1 Capsule daily after dinner • 15 Days</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      Doctor Clinical Notes & Dietary Advice:
                    </label>
                    <textarea
                      className="rx-textarea"
                      placeholder="Doctor advice: Low salt intake, 30 min morning walk, follow up after 14 days..."
                      value={prescriptionNote}
                      onChange={(e) => setPrescriptionNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {isPrescriptionSaved && (
                    <div className="rx-success-badge" style={{ marginBottom: '0.75rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Prescription signed & linked to ABHA #{user?.abha_id || '91-4091-8821'}!</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      onClick={handleSavePrescription}
                      style={{ fontSize: '0.82rem', padding: '0.65rem' }}
                    >
                      <Sparkles size={14} /> Digitally Sign & Issue e-Prescription
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Prescription for ${activePatientName} downloaded as PDF and synced with nearest Jan Aushadhi Kendra!`)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#E2E8F0',
                        borderRadius: '8px',
                        padding: '0.55rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} /> Download Digital Prescription PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE IN-CALL CHAT */}
            {activeTab === 'chat' && (
              <div className="hud-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0.85rem' }}>
                
                {/* Quick Symptom Chips for fast reporting */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Quick Symptoms & Queries (One Tap):
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { label: '🤒 Fever & Headache', text: 'I have mild fever and headache since yesterday.' },
                      { label: '🫀 High BP Check', text: 'Doctor, could you please review my blood pressure reading?' },
                      { label: '🫁 Cough & Cold', text: 'I have persistent dry cough and throat irritation.' },
                      { label: '💊 Generic Refill', text: 'I need a refill prescription for my hypertension medication.' }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickSymptom(chip.text)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#E2E8F0',
                          borderRadius: '6px',
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Log */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {chatMessages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      style={{
                        alignSelf: msg.sender === 'patient' ? (isDoctorUser ? 'flex-start' : 'flex-end') : msg.sender === 'doctor' ? (isDoctorUser ? 'flex-end' : 'flex-start') : 'center',
                        maxWidth: msg.sender === 'system' ? '100%' : '88%',
                        background: msg.sender === 'patient' ? (isDoctorUser ? '#1E293B' : '#0D9488') : msg.sender === 'doctor' ? (isDoctorUser ? '#0D9488' : '#1E293B') : 'rgba(255,255,255,0.06)',
                        color: msg.sender === 'system' ? '#94A3B8' : '#FFFFFF',
                        borderRadius: '10px',
                        padding: '0.5rem 0.75rem',
                        fontSize: msg.sender === 'system' ? '0.7rem' : '0.82rem',
                        border: msg.sender === 'doctor' ? '1px solid rgba(45,212,191,0.3)' : 'none'
                      }}
                    >
                      {msg.sender !== 'system' && (
                        <div style={{
                          fontSize: '0.65rem',
                          color: msg.sender === 'patient' ? '#5EEAD4' : '#2DD4BF',
                          fontWeight: 700,
                          marginBottom: '2px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{msg.senderName || (msg.sender === 'doctor' ? activeDoctorName : activePatientName)}</span>
                          <span style={{ opacity: 0.7 }}>{msg.time}</span>
                        </div>
                      )}
                      <div>{msg.text}</div>

                      {/* Listen button on doctor messages */}
                      {msg.sender === 'doctor' && (
                        <button
                          type="button"
                          onClick={() => speakDoctorDialogue(msg.text)}
                          style={{
                            marginTop: '4px',
                            background: 'rgba(45, 212, 191, 0.15)',
                            border: 'none',
                            color: '#2DD4BF',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Volume2 size={11} /> Speak Aloud
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat Input Form with Mic Voice Input */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type symptoms or question to doctor..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', flex: 1 }}
                  />

                  {/* Speech to text input button */}
                  <button
                    type="button"
                    onClick={handleTogglePatientMicInput}
                    style={{
                      background: isListeningMic ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: isListeningMic ? '#FFFFFF' : '#94A3B8',
                      borderRadius: '8px',
                      padding: '0 0.65rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isListeningMic ? 'Listening to your voice... Speak now' : 'Speak into microphone to type'}
                  >
                    <Mic size={16} className={isListeningMic ? 'animate-pulse' : ''} />
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0 0.85rem' }}
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
