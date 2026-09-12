import React, { useState, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Activity, Heart,
  Thermometer, Wind, FileText, CheckCircle2, User, ShieldAlert, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TelemedicineRoom({ doctorName = 'Dr. Rajesh Deshmukh', specialty = 'General Medicine', onClose }) {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals' | 'prescription'
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);

  // Simulated live vitals telemetry
  const [vitals, setVitals] = useState({
    heartRate: 74,
    spo2: 98,
    bpSys: 124,
    bpDia: 82,
    temp: 98.6
  });

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
      setVitals(v => ({
        ...v,
        heartRate: 72 + Math.floor(Math.random() * 5),
        spo2: 98 + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(vitalPulse);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSavePrescription = () => {
    setIsPrescriptionSaved(true);
    setTimeout(() => setIsPrescriptionSaved(false), 4000);
  };

  return (
    <div className="telemed-overlay">
      <div className="telemed-container">
        {/* Top bar */}
        <div className="telemed-header">
          <div className="flex items-center gap-3">
            <div className="live-call-dot"></div>
            <div>
              <h3 className="telemed-title">e-Sanjeevani Teleconsultation Chamber</h3>
              <p className="telemed-subtitle">{doctorName} • {specialty} (Govt PHC Khed)</p>
            </div>
          </div>
          <div className="telemed-timer-badge">
            <Activity size={14} className="text-teal animate-pulse" />
            <span>Connected: {formatTimer(callDuration)}</span>
          </div>
        </div>

        {/* Main Content: Video Feed & Sidebar HUD */}
        <div className="telemed-grid">
          {/* Left: Video Area */}
          <div className="telemed-video-area">
            {/* Main Doctor Screen */}
            <div className="doctor-video-frame">
              {videoActive ? (
                <div className="doctor-avatar-screen">
                  <div className="doctor-feed-animation">
                    <div className="doctor-badge-overlay">
                      <span className="badge-govt">Authorized Medical Officer</span>
                      <span className="badge-name">{doctorName}</span>
                    </div>
                    {/* Simulated visual doctor representation */}
                    <div className="doctor-portrait-box">
                      <div className="doctor-glow-ring"></div>
                      <div className="doctor-silhouette">
                        <User size={96} className="text-teal" />
                      </div>
                      <div className="audio-equalizer">
                        <span className="bar bar-1"></span>
                        <span className="bar bar-2"></span>
                        <span className="bar bar-3"></span>
                        <span className="bar bar-4"></span>
                        <span className="bar bar-5"></span>
                      </div>
                    </div>
                    <div className="consultation-speech-bubble">
                      "Namaste Ramesh ji. I am reviewing your blood pressure readings and today's AI screening report. How are your headaches today?"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="video-off-placeholder">
                  <VideoOff size={48} className="text-gray-500 mb-2" />
                  <p>Video Feed Paused</p>
                </div>
              )}

              {/* PiP: Patient Self-View */}
              <div className="patient-pip-window">
                <div className="pip-header">You ({user?.name || 'Patient'})</div>
                <div className="pip-body">
                  <User size={32} className="text-gray-300" />
                  <span className="pip-label">Shivapur</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="telemed-controls-bar">
              <button
                type="button"
                className={`control-btn ${micActive ? 'btn-active' : 'btn-off'}`}
                onClick={() => setMicActive(!micActive)}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                type="button"
                className={`control-btn ${videoActive ? 'btn-active' : 'btn-off'}`}
                onClick={() => setVideoActive(!videoActive)}
                title={videoActive ? 'Stop Camera' : 'Start Camera'}
              >
                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                type="button"
                className="control-btn btn-hangup"
                onClick={onClose}
                title="End Consultation"
              >
                <PhoneOff size={20} />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Right: Clinical HUD & Prescription Pad */}
          <div className="telemed-hud-sidebar">
            <div className="hud-tab-switcher">
              <button
                type="button"
                className={`hud-tab ${activeTab === 'vitals' ? 'active' : ''}`}
                onClick={() => setActiveTab('vitals')}
              >
                <Activity size={16} />
                <span>Vitals Telemetry</span>
              </button>
              <button
                type="button"
                className={`hud-tab ${activeTab === 'prescription' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescription')}
              >
                <FileText size={16} />
                <span>e-Prescription</span>
              </button>
            </div>

            {activeTab === 'vitals' ? (
              <div className="hud-content vitals-panel">
                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Heart size={18} className="text-red-500" />
                    <span>Heart Rate (Pulse)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.heartRate} <small>BPM</small>
                  </div>
                  <span className="metric-status normal">Normal Rhythm (60-100)</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Wind size={18} className="text-blue-500" />
                    <span>Oxygen Saturation (SpO₂)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.spo2}% <small>SpO₂</small>
                  </div>
                  <span className="metric-status normal">Optimal Oxygenation</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Activity size={18} className="text-amber-500" />
                    <span>Blood Pressure (NIBP)</span>
                  </div>
                  <div className="metric-value">
                    {vitals.bpSys}/{vitals.bpDia} <small>mmHg</small>
                  </div>
                  <span className="metric-status normal">Pre-Hypertension Controlled</span>
                </div>

                <div className="vitals-metric-card">
                  <div className="metric-header">
                    <Thermometer size={18} className="text-emerald-500" />
                    <span>Body Temperature</span>
                  </div>
                  <div className="metric-value">
                    {vitals.temp}°F <small>Oral</small>
                  </div>
                  <span className="metric-status normal">Afebrile (Normal)</span>
                </div>
              </div>
            ) : (
              <div className="hud-content rx-panel">
                <div className="rx-preview-box">
                  <div className="rx-badge-top">GOVERNMENT OF MAHARASHTRA • DIGITAL RX</div>
                  <div className="rx-patient-info">
                    <strong>Patient:</strong> {user?.name || 'Ramesh Patil'} (48/M)
                  </div>
                  <div className="rx-meds-list">
                    <div className="rx-med-item">
                      <div className="med-name">1. Tab. Amlodipine 5mg (Jan Aushadhi)</div>
                      <div className="med-dose">1 Tablet Once Daily (Morning after food) • 30 Days</div>
                    </div>
                    <div className="rx-med-item">
                      <div className="med-name">2. Tab. Paracetamol 650mg SOS</div>
                      <div className="med-dose">1 Tablet only if headache exceeds 5/10</div>
                    </div>
                  </div>
                  <textarea
                    className="rx-textarea"
                    placeholder="Doctor clinical consultation notes and dietary advice..."
                    value={prescriptionNote}
                    onChange={(e) => setPrescriptionNote(e.target.value)}
                    rows={4}
                  />
                  {isPrescriptionSaved && (
                    <div className="rx-success-badge">
                      <CheckCircle2 size={16} />
                      <span>Prescription signed & sent to Patient Health Locker!</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary w-full mt-3"
                    onClick={handleSavePrescription}
                  >
                    Generate & Sign Digital e-Prescription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
