import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Video, Phone, Shield, Clock, User, Stethoscope, CheckCircle2,
  Calendar, Star, AlertCircle, ArrowRight, Camera, Mic, Wifi,
  FileText, Sparkles, Heart, Activity, Search, Filter, PhoneCall
} from 'lucide-react';

export function TelemedicineHub({ setActiveTab, onOpenTelemed }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [testCamActive, setTestCamActive] = useState(false);
  const [activeQueueToken, setActiveQueueToken] = useState('MH-TELE-804');

  const specialties = [
    'All',
    'General Medicine',
    'Pediatrics & Child Health',
    'Obstetrics & Gynecology',
    'Cardiology & Hypertension',
    'AYUSH & Holistic Health',
    'Dermatology'
  ];

  const onlineDoctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Deshmukh',
      degree: 'MBBS, MD (General Medicine)',
      specialty: 'General Medicine',
      facility: 'PHC Khedgaon & Pune District Civil Hospital',
      experience: '12 years experience',
      languages: ['मराठी', 'हिंदी', 'English'],
      status: 'available', // available | busy
      waitTime: 'Available Immediately',
      rating: 4.9,
      reviewsCount: 1480,
      avatarBg: '#0D9488'
    },
    {
      id: 2,
      name: 'Dr. Sunita Patil',
      degree: 'MBBS, MS (OBGYN), DGO',
      specialty: 'Obstetrics & Gynecology',
      facility: 'Baramati Women & Child Rural Hospital',
      experience: '15 years experience',
      languages: ['मराठी', 'हिंदी', 'English'],
      status: 'available',
      waitTime: 'Available Immediately',
      rating: 4.95,
      reviewsCount: 2190,
      avatarBg: '#DB2777'
    },
    {
      id: 3,
      name: 'Dr. Amit Joshi',
      degree: 'MBBS, MD (Pediatrics), DCH',
      specialty: 'Pediatrics & Child Health',
      facility: 'Satara District Civil Hospital',
      experience: '9 years experience',
      languages: ['मराठी', 'हिंदी', 'English'],
      status: 'busy',
      waitTime: 'Next patient in ~3 mins',
      rating: 4.88,
      reviewsCount: 960,
      avatarBg: '#2563EB'
    },
    {
      id: 4,
      name: 'Dr. Anand Kulkarni',
      degree: 'MBBS, DM (Cardiology)',
      specialty: 'Cardiology & Hypertension',
      facility: 'Sassoon General Hospital & Medical College',
      experience: '18 years experience',
      languages: ['मराठी', 'हिंदी', 'English'],
      status: 'available',
      waitTime: 'Available Immediately',
      rating: 4.98,
      reviewsCount: 3200,
      avatarBg: '#DC2626'
    },
    {
      id: 5,
      name: 'Dr. Meena Shinde',
      degree: 'BAMS, MD (Ayurveda), Preventive Care',
      specialty: 'AYUSH & Holistic Health',
      facility: 'Govt AYUSH Wellness Centre, Shirur',
      experience: '11 years experience',
      languages: ['मराठी', 'हिंदी'],
      status: 'available',
      waitTime: 'Available Immediately',
      rating: 4.85,
      reviewsCount: 840,
      avatarBg: '#059669'
    },
    {
      id: 6,
      name: 'Dr. Priya Kamble',
      degree: 'MBBS, MD (Dermatology)',
      specialty: 'Dermatology',
      facility: 'Aundh Civil Hospital, Pune',
      experience: '8 years experience',
      languages: ['मराठी', 'हिंदी', 'English'],
      status: 'busy',
      waitTime: 'Next patient in ~6 mins',
      rating: 4.82,
      reviewsCount: 710,
      avatarBg: '#7C3AED'
    }
  ];

  const filteredDoctors = onlineDoctors.filter(doc => {
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.facility.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleStartCall = (doc, mode = 'video') => {
    if (onOpenTelemed) {
      onOpenTelemed({
        doctorName: doc.name,
        specialty: doc.specialty,
        facility: doc.facility,
        initialMode: mode
      });
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 2rem 4rem 2rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A4D3C 0%, #125E4B 50%, #17725B 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(10, 77, 60, 0.25)',
        marginBottom: '2.5rem'
      }}>
        {/* Subtle background circles */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}></span>
            e-SANJEEVANI 2.0 • NATIONAL TELECONSULTATION PORTAL
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            letterSpacing: '-0.02em'
          }}>
            Rural Telemedicine & Live Video Consultation
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
            maxWidth: '680px'
          }}>
            Consult certified Medical Officers from Primary Health Centres and specialist doctors from District Civil Hospitals directly via encrypted high-definition video call. Get official e-prescriptions valid at all Jan Aushadhi Kendras.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleStartCall(onlineDoctors[0])}
              style={{
                background: '#FFFFFF',
                color: '#0A4D3C',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Video size={18} color="#0A4D3C" />
              <span>Connect with Next Available Doctor (Wait: 0 min)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('book-appointment')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.85rem 1.4rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.92rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Calendar size={16} />
              <span>Schedule Future Video OPD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Device Diagnostics & Telemed Token Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Token Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E5ECE7',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2E7D32'
          }}>
            <Sparkles size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
              Your Telemedicine Token
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B4D3E' }}>
              {activeQueueToken}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              Priority: OPD General Walk-in
            </div>
          </div>
        </div>

        {/* Camera & Mic Diagnostics */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E5ECE7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7'
            }}>
              <Camera size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                Camera & Audio Status
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
                Hardware Ready & Permitted
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={13} /> HD 720p / 1080p WebRTC
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleStartCall(onlineDoctors[0])}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #E5ECE7',
              background: '#F9FAFB',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Test Call
          </button>
        </div>

        {/* Bandwidth & Security */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E5ECE7',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
              Security & Privacy
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
              256-Bit Encrypted Telehealth
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
              ABHA & DISHA Compliant Record
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Available On-Duty Medical Officers ({filteredDoctors.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              Official medical doctors active on Maharashtra e-Sanjeevani network right now
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #E5ECE7',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              gap: '0.5rem',
              width: '240px'
            }}>
              <Search size={16} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Search doctor, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                  background: 'transparent'
                }}
              />
            </div>
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {specialties.map(spec => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                background: selectedSpecialty === spec ? '#1B4D3E' : '#FFFFFF',
                color: selectedSpecialty === spec ? '#FFFFFF' : '#4B5563',
                boxShadow: selectedSpecialty === spec ? '0 2px 6px rgba(27,77,62,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Doctors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #E5ECE7',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div>
              {/* Card Top: Doctor info & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: doc.avatarBg,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {doc.name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {doc.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                      {doc.degree}
                    </div>
                  </div>
                </div>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: doc.status === 'available' ? '#ECFDF5' : '#FFFBEB',
                  color: doc.status === 'available' ? '#059669' : '#D97706',
                  border: `1px solid ${doc.status === 'available' ? '#A7F3D0' : '#FDE68A'}`
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: doc.status === 'available' ? '#10B981' : '#F59E0B'
                  }} />
                  {doc.waitTime}
                </span>
              </div>

              {/* Specialty & Hospital badge */}
              <div style={{
                background: '#F9FAFB',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B4D3E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Stethoscope size={15} />
                  {doc.specialty}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                  🏥 {doc.facility}
                </div>
              </div>

              {/* Badges: Experience, Rating, Languages */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                <span style={{ background: '#F3F4F6', color: '#374151', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 500 }}>
                  ⏳ {doc.experience}
                </span>
                <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={12} fill="#B45309" /> {doc.rating} ({doc.reviewsCount})
                </span>
                <span style={{ background: '#F0FDF4', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 500 }}>
                  🗣 {doc.languages.join(', ')}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F3F4F6', paddingTop: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleStartCall(doc, 'video')}
                style={{
                  flex: '1 1 120px',
                  background: '#1B4D3E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.7rem 0.8rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(27,77,62,0.15)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#153E32'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1B4D3E'}
              >
                <Video size={15} />
                <span>Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartCall(doc, 'audio')}
                style={{
                  flex: '1 1 120px',
                  background: 'rgba(13, 148, 136, 0.1)',
                  color: '#0F766E',
                  border: '1px solid rgba(13, 148, 136, 0.3)',
                  padding: '0.7rem 0.8rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.1)'}
              >
                <Phone size={15} />
                <span>Audio Call</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('book-appointment')}
                style={{
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #E5ECE7',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title="Schedule for another date"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. How Telemedicine Works (3 Steps) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        border: '1px solid #E5ECE7',
        marginBottom: '2.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
          How Rural e-Sanjeevani Teleconsultation Works
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: '1.75rem' }}>
          Free official medical consultation governed by the Directorate of Health Services (DHS), Maharashtra
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>1</div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Join Chamber Instantly
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Click "Start Video Call". You are admitted to the encrypted video chamber. Camera and microphone switch on smoothly.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>2</div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Live Clinical Exam & Vitals
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Discuss your symptoms directly with the doctor. Telemetry HUD tracks heart rate, SpO2, blood pressure and temperature.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>3</div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Digital e-Prescription
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Doctor digitally signs prescription with QR code. Automatically saved in your ABHA health records for free pharmacy pickup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Emergency & 24x7 Mental Health Helpline Footer Callout */}
      <div style={{
        background: '#F0FDF4',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        border: '1px solid #BBF7D0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#16A34A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
              Tele-MANAS & Medical Advisory Helplines (24x7 Free)
            </div>
            <div style={{ color: '#15803D', fontSize: '0.82rem', marginTop: '2px' }}>
              Dial <strong>14416</strong> for mental health counseling or <strong>104</strong> for 24-hour health information & advice
            </div>
          </div>
        </div>

        <a
          href="tel:104"
          style={{
            background: '#16A34A',
            color: '#FFFFFF',
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Phone size={14} /> Call 104 Helpline
        </a>
      </div>

    </div>
  );
}
