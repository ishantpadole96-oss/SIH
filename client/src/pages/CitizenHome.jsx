import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Hospital, Sparkles, Calendar, FileText, 
  ShieldAlert, Pill, Activity, MessageSquare, MapPin, 
  ChevronRight, CheckCircle2, Video, Shield, Phone, 
  Stethoscope, Clock, Heart, ArrowRight, Bed, AlertTriangle
} from 'lucide-react';

export function CitizenHome({ setActiveTab, onOpenEmergency, onOpenTelemed, onOpenHealthCard }) {
  const { user, selectedVillage } = useAuth();
  const { t } = useLanguage();

  const currentVillage = selectedVillage?.village_name || 'Khedgaon';
  const currentDistrict = selectedVillage?.district || 'Nashik & Dindori';
  const greetingName = user?.name ? user.name.split(' ')[0] : 'Asha';

  // 4 Action Cards
  const quickCards = [
    {
      id: 'facilities',
      label: 'Find healthcare',
      icon: <MapPin size={20} color="#0D9488" />,
      iconBg: '#E8F5EE',
      onClick: () => setActiveTab('facilities'),
    },
    {
      id: 'availability',
      label: 'Hospital availability',
      icon: <Bed size={20} color="#6366F1" />,
      iconBg: '#EEF2FF',
      onClick: () => setActiveTab('availability'),
    },
    {
      id: 'screening',
      label: 'AI screening',
      icon: <Sparkles size={20} color="#F59E0B" />,
      iconBg: '#FEF3C7',
      onClick: () => setActiveTab('screening'),
    },
    {
      id: 'emergency',
      label: 'Emergency help',
      icon: <ShieldAlert size={20} color="#EF4444" />,
      iconBg: '#FEE2E2',
      onClick: onOpenEmergency,
    },
  ];

  // Extended Core Services below the fold
  const extendedServices = [
    {
      id: 'telemedicine',
      title: 'e-Sanjeevani Teleconsultation',
      desc: 'Connect via real-time live video with verified Maharashtra government medical officers.',
      badge: 'Live Video OPD',
      badgeColor: '#0D9488',
      icon: <Video size={22} color="#0D9488" />,
      onClick: onOpenTelemed
    },
    {
      id: 'health-card',
      title: 'Digital Health Card (ABHA)',
      desc: 'Official QR-enabled digital health identity card with blood group and emergency vitals.',
      badge: 'ABHA Identity',
      badgeColor: '#16A34A',
      icon: <Shield size={22} color="#16A34A" />,
      onClick: onOpenHealthCard
    },
    {
      id: 'medicines',
      title: 'Jan Aushadhi Generic Medicines',
      desc: 'Search 25+ essential medicines saving up to 87% cost and check live inventory at local PHCs.',
      badge: '87% Cost Savings',
      badgeColor: '#EC4899',
      icon: <Pill size={22} color="#EC4899" />,
      onClick: () => setActiveTab('medicines')
    },
    {
      id: 'camps',
      title: 'Rural Health Camps',
      desc: 'Upcoming free community health checkup camps for maternal care, diabetes, and eye screenings.',
      badge: 'Free Community Care',
      badgeColor: '#F59E0B',
      icon: <Activity size={22} color="#F59E0B" />,
      onClick: () => setActiveTab('camps')
    },
  ];

  return (
    <div style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. HERO CARD: "Care that reaches your doorstep." */}
      <div style={{
        background: 'linear-gradient(135deg, #DCF0E4 0%, #E6F5EC 55%, #D3EBDC 100%)',
        borderRadius: '28px',
        padding: '3rem 3rem 3rem 3.2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #CFE6D8',
        boxShadow: '0 8px 30px rgba(17, 49, 39, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        
        {/* Subtle Decorative Organic Wave SVG */}
        <div style={{
          position: 'absolute',
          right: '-60px',
          bottom: '-60px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167, 219, 187, 0.45) 0%, rgba(220, 240, 228, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Hero Left Content */}
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          
          {/* District Demo Pill Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#173D35',
            marginBottom: '1.25rem'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981'
            }} />
            <span>DISTRICT DEMO VIEW</span>
            <span style={{ color: '#52786D', fontWeight: 500, marginLeft: '0.2rem' }}>
              12 September 2026 · {currentDistrict}
            </span>
          </div>

          {/* Large Bold Headline */}
          <h1 style={{
            fontFamily: "'Outfit', 'DM Sans', sans-serif",
            fontSize: 'clamp(2.6rem, 4.2vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#103127',
            letterSpacing: '-0.03em',
            marginBottom: '1.1rem'
          }}>
            Care that<br />
            reaches<br />
            your doorstep.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.08rem',
            color: '#28473B',
            lineHeight: 1.5,
            marginBottom: '2rem',
            maxWidth: '520px',
            fontWeight: 400
          }}>
            Find trusted government healthcare, understand your options, and take the next step with confidence.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('facilities')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#173D35',
                color: '#FFFFFF',
                padding: '0.82rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '0.94rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0F2A23';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#173D35';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Search size={17} />
              <span>Find healthcare</span>
            </button>

            <button
              onClick={() => setActiveTab('screening')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#FFFFFF',
                color: '#173D35',
                padding: '0.82rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '0.94rem',
                fontWeight: 600,
                border: '1px solid #BFD9CB',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F3F9F5';
                e.currentTarget.style.borderColor = '#173D35';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#BFD9CB';
              }}
            >
              <Sparkles size={17} color="#0D9488" />
              <span>Start screening</span>
            </button>
          </div>

        </div>

        {/* Floating "YOUR CARE SNAPSHOT" Card */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          background: '#FFFFFF',
          borderRadius: '22px',
          padding: '1.4rem 1.6rem',
          width: '240px',
          boxShadow: '0 12px 32px rgba(16, 49, 39, 0.08)',
          border: '1px solid #E2EAE5',
          flexShrink: 0
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B7280'
            }}>
              YOUR CARE SNAPSHOT
            </span>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#E8F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}>
              <Heart size={14} />
            </div>
          </div>

          {/* Big Score Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <span style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              color: '#166534',
              lineHeight: 1,
              fontFamily: "'Outfit', sans-serif"
            }}>
              86
            </span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.1 }}>access score</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>Good access</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '5px',
            borderRadius: '9999px',
            background: '#E5EBE7',
            overflow: 'hidden',
            marginBottom: '0.85rem'
          }}>
            <div style={{
              width: '86%',
              height: '100%',
              background: '#10B981',
              borderRadius: '9999px'
            }} />
          </div>

          {/* Description */}
          <p style={{
            fontSize: '0.74rem',
            color: '#6B7280',
            lineHeight: 1.35,
            margin: 0
          }}>
            Based on distance, beds, doctors &amp; medicines in {currentVillage}
          </p>
        </div>

      </div>

      {/* 2. ROW OF 4 ACTION CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {quickCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2EBE5',
              borderRadius: '18px',
              padding: '1.25rem 1.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(17, 34, 25, 0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(17, 34, 25, 0.08)';
              e.currentTarget.style.borderColor = '#173D35';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(17, 34, 25, 0.03)';
              e.currentTarget.style.borderColor = '#E2EBE5';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {card.icon}
              </div>
              <span style={{
                fontSize: '0.94rem',
                fontWeight: 600,
                color: '#111827',
                background: '#EAF4EE',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {card.label}
              </span>
            </div>
            <ArrowRight size={16} color="#6B7280" />
          </div>
        ))}
      </div>

      {/* 3. "YOUR CARE JOURNEY" SECTION */}
      <div style={{ marginBottom: '3rem' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: '0.3rem'
            }}>
              YOUR CARE JOURNEY
            </div>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#11322A',
              lineHeight: 1.2
            }}>
              Good morning, {greetingName}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#52786D', marginTop: '0.2rem' }}>
              Here's what needs your attention today
            </p>
          </div>

          <button
            onClick={() => setActiveTab('records-referrals')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#173D35',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.4rem 0'
            }}
          >
            <span>View all records</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Care Journey Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          
          {/* Card 1: NEXT APPOINTMENT (White Card) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2EBE5',
            borderRadius: '20px',
            padding: '1.5rem 1.75rem',
            boxShadow: '0 2px 8px rgba(17, 34, 25, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  NEXT APPOINTMENT
                </span>
                <span style={{
                  background: '#E6F5EC',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#166534' }} />
                  CONFIRMED
                </span>
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#11322A', marginBottom: '1.2rem' }}>
                15 Sep 2026
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#E8F5EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0D9488'
                }}>
                  <Stethoscope size={16} />
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827' }}>
                  {currentVillage} Primary Health Centre
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F0F5F2' }}>
              <button
                onClick={() => setActiveTab('book-appointment')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#173D35',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: 0
                }}
              >
                <span>Manage</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: FOLLOW-UP DUE (Deep Pine Green Card) */}
          <div style={{
            background: '#173D35',
            borderRadius: '20px',
            padding: '1.5rem 1.75rem',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(23, 61, 53, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  FOLLOW-UP DUE
                </span>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A7F3D0'
                }}>
                  <Clock size={14} />
                </div>
              </div>

              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                Today
              </div>

              <div style={{ fontSize: '0.94rem', color: '#D1FAE5', lineHeight: 1.4 }}>
                Check dizziness &amp; iron therapy
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                onClick={() => setActiveTab('screening')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#34D399',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: 0
                }}
              >
                <span>Open follow-up</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. EXTENDED SERVICES & TELEMEDICINE / ABHA CARDS */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#11322A' }}>
              Connected Public Healthcare Services
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#6B7280' }}>
              Instant access to teleconsultation, digital health cards, and essential medicines
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {extendedServices.map((svc) => (
            <div
              key={svc.id}
              onClick={svc.onClick}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2EBE5',
                borderRadius: '18px',
                padding: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(17, 34, 25, 0.02)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#173D35';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(17, 34, 25, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#E2EBE5';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(17, 34, 25, 0.02)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#F0F5F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {svc.icon}
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: svc.badgeColor,
                    background: `${svc.badgeColor}18`,
                    padding: '3px 8px',
                    borderRadius: '9999px'
                  }}>
                    {svc.badge}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>
                  {svc.title}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45, margin: 0 }}>
                  {svc.desc}
                </p>
              </div>

              <div style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#173D35',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                <span>Launch Service</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 24x7 EMERGENCY HELPLINE STRIP */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%)',
        border: '1px solid #FECACA',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#EF4444',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
          }}>
            <Phone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B' }}>
              Maharashtra 24x7 Emergency Public Healthcare Helplines
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7F1D1D' }}>
              GPS-tracked ambulance dispatch and emergency triage for all 36 districts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="tel:108"
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Phone size={14} /> Call 108 (Ambulance)
          </a>

          <a
            href="tel:104"
            style={{
              background: '#FFFFFF',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              padding: '0.65rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Phone size={14} /> Call 104 (Health Helpline)
          </a>
        </div>
      </div>

    </div>
  );
}
