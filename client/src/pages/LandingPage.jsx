import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Stethoscope, Building2, ShieldAlert, Sparkles, QrCode, 
  WifiOff, ArrowRight, Phone, HeartPulse, Bed, MapPin, 
  Activity, Shield, CheckCircle2, Award, ExternalLink, HelpCircle, Smartphone
} from 'lucide-react';

export function LandingPage({ 
  onSelectPortal, 
  onOpenEmergency, 
  onOpenJourneyScanner,
  onOpenCopilot,
  onOpenDownloadApp 
}) {
  const { t, lang } = useLanguage();

  const portals = [
    {
      id: 'citizen',
      role: 'citizen',
      targetTab: 'home',
      icon: <Users size={32} color="#0D9488" />,
      accentColor: '#0D9488',
      lightBg: '#E8F5EE',
      borderColor: '#A7DBBB',
      badge: t('role_citizen_badge'),
      title: t('portal_citizen_title'),
      subtitle: t('portal_citizen_subtitle'),
      actionText: t('portal_citizen_action'),
      features: [
        t('portal_citizen_f1'),
        t('portal_citizen_f2'),
        t('portal_citizen_f3'),
        t('portal_citizen_f4')
      ]
    },
    {
      id: 'asha',
      role: 'asha',
      targetTab: 'asha-dashboard',
      icon: <HeartPulse size={32} color="#E11D48" />,
      accentColor: '#E11D48',
      lightBg: '#FFE4E6',
      borderColor: '#FDA4AF',
      badge: t('role_asha_badge'),
      title: t('portal_asha_title'),
      subtitle: t('portal_asha_subtitle'),
      actionText: t('portal_asha_action'),
      features: [
        t('portal_asha_f1'),
        t('portal_asha_f2'),
        t('portal_asha_f3'),
        t('portal_asha_f4')
      ]
    },
    {
      id: 'doctor',
      role: 'doctor',
      targetTab: 'doctor-dashboard',
      icon: <Stethoscope size={32} color="#2563EB" />,
      accentColor: '#2563EB',
      lightBg: '#EFF6FF',
      borderColor: '#BFDBFE',
      badge: t('role_doctor_badge'),
      title: t('portal_doctor_title'),
      subtitle: t('portal_doctor_subtitle'),
      actionText: t('portal_doctor_action'),
      features: [
        t('portal_doctor_f1'),
        t('portal_doctor_f2'),
        t('portal_doctor_f3'),
        t('portal_doctor_f4')
      ]
    },
    {
      id: 'admin',
      role: 'admin',
      targetTab: 'admin-dashboard',
      icon: <Building2 size={32} color="#D97706" />,
      accentColor: '#D97706',
      lightBg: '#FEF3C7',
      borderColor: '#FDE68A',
      badge: t('role_admin_badge'),
      title: t('portal_admin_title'),
      subtitle: t('portal_admin_subtitle'),
      actionText: t('portal_admin_action'),
      features: [
        t('portal_admin_f1'),
        t('portal_admin_f2'),
        t('portal_admin_f3'),
        t('portal_admin_f4')
      ]
    }
  ];

  const innovations = [
    {
      icon: <WifiOff size={24} color="#0D9488" />,
      title: t('feat_offline_title'),
      desc: t('feat_offline_desc'),
      bg: '#E8F5EE'
    },
    {
      icon: <QrCode size={24} color="#6366F1" />,
      title: t('feat_qr_title'),
      desc: t('feat_qr_desc'),
      bg: '#EEF2FF'
    },
    {
      icon: <Activity size={24} color="#E11D48" />,
      title: t('feat_tracking_title'),
      desc: t('feat_tracking_desc'),
      bg: '#FFE4E6'
    },
    {
      icon: <Sparkles size={24} color="#D97706" />,
      title: t('feat_copilot_title'),
      desc: t('feat_copilot_desc'),
      bg: '#FEF3C7'
    }
  ];

  const helplines = [
    { number: '108', title: t('helpline_108_title'), desc: t('helpline_108_desc'), color: '#DC2626', bg: '#FEE2E2' },
    { number: '112', title: t('helpline_112_title'), desc: t('helpline_112_desc'), color: '#2563EB', bg: '#DBEAFE' },
    { number: '104', title: t('helpline_104_title'), desc: t('helpline_104_desc'), color: '#0D9488', bg: '#CCFBF1' },
    { number: '102', title: t('helpline_102_title'), desc: t('helpline_102_desc'), color: '#7C3AED', bg: '#EDE9FE' },
    { number: '14416', title: t('helpline_telemanas_title'), desc: t('helpline_telemanas_desc'), color: '#059669', bg: '#D1FAE5' },
  ];

  const schemes = [
    { title: t('scheme_mjpjay_title'), desc: t('scheme_mjpjay_desc'), tag: t('scheme_tag_5lakh'), tagBg: '#DCFCE7', tagColor: '#166534' },
    { title: t('scheme_pmjay_title'), desc: t('scheme_pmjay_desc'), tag: t('scheme_tag_portability'), tagBg: '#DBEAFE', tagColor: '#1E40AF' },
    { title: t('scheme_esanjeevani_title'), desc: t('scheme_esanjeevani_desc'), tag: t('scheme_tag_zero_cost'), tagBg: '#FEF3C7', tagColor: '#92400E' }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 2rem 5rem 2rem' }}>
      
      {/* 1. TOP HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #11322A 0%, #1A4D40 50%, #0D2620 100%)',
        borderRadius: '28px',
        padding: '3.5rem 3rem',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(17, 50, 42, 0.45)',
        marginBottom: '3rem'
      }}>
        {/* Glow circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-50px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          {/* Government Badge Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#A7DBBB'
            }}>
              🏛️ {t('landing_badge_state')}
            </span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FDE68A'
            }}>
              📍 {t('landing_badge_districts')}
            </span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FECACA'
            }}>
              ⭐ {t('landing_badge_hackathon')}
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 style={{
            fontFamily: "'Outfit', 'DM Sans', sans-serif",
            fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            marginBottom: '1.2rem',
            whiteSpace: 'pre-line'
          }}>
            {t('landing_hero_title')}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: '#D1E7DD',
            marginBottom: '2.5rem',
            maxWidth: '680px'
          }}>
            {t('landing_hero_subtitle')}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="#stakeholder-portals"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#2DD4BF',
                color: '#0F2922',
                padding: '0.9rem 1.8rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(45, 212, 191, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <span>{t('landing_btn_explore_portals')}</span>
              <ArrowRight size={18} />
            </a>

            <button
              onClick={onOpenEmergency}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#EF4444',
                color: '#FFFFFF',
                padding: '0.9rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <Phone size={18} />
              <span>{t('landing_btn_emergency')}</span>
            </button>

            <button
              onClick={onOpenDownloadApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '0.9rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Smartphone size={18} color="#2DD4BF" />
              <span>{lang === 'mr' ? 'अँड्रॉइड ॲप डाऊनलोड' : lang === 'hi' ? 'एंड्रॉइड ऐप डाउनलोड' : 'Download Android App'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED STAKEHOLDER PORTALS (THE 4 SPLIT PANELS) */}
      <section id="stakeholder-portals" style={{ marginBottom: '4rem', scrollMarginTop: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#E8F5EE',
            color: '#0D9488',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            {t('landing_dedicated_panels_badge')}
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#11322A', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>
            {t('landing_portal_section_title')}
          </h2>
          <p style={{ fontSize: '1rem', color: '#52786D', lineHeight: 1.5, margin: 0 }}>
            {t('landing_portal_section_subtitle')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {portals.map((p) => (
            <div
              key={p.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: `1.5px solid ${p.borderColor}`,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px -5px rgba(17, 50, 42, 0.06)',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px -4px rgba(17, 50, 42, 0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(17, 50, 42, 0.06)';
              }}
            >
              <div>
                {/* Top Badge & Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: p.lightBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {p.icon}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    background: p.lightBg,
                    color: p.accentColor
                  }}>
                    {p.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#11322A', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#52786D', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {p.subtitle}
                </p>

                {/* Feature Bullet Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {p.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <CheckCircle2 size={15} color={p.accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#2C4A40', fontWeight: 500, lineHeight: 1.4 }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPortal(p.role, p.targetTab)}
                style={{
                  width: '100%',
                  background: p.accentColor,
                  color: '#FFFFFF',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 4px 12px ${p.accentColor}33`,
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <span>{p.actionText}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INNOVATIONS SPOTLIGHT SECTION */}
      <section style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid #E6ECE8',
        boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
        marginBottom: '4rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.2rem auto' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#11322A', marginBottom: '0.4rem' }}>
            {t('spotlight_title')}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#52786D', margin: 0 }}>
            {t('spotlight_subtitle')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {innovations.map((item, i) => (
            <div
              key={i}
              style={{
                background: '#F9FCFA',
                border: '1px solid #E6ECE8',
                borderRadius: '16px',
                padding: '1.5rem'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#11322A', marginBottom: '0.45rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#52786D', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. GOVERNMENT SCHEMES & FINANCIAL PROTECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#11322A', marginBottom: '0.3rem' }}>
            {t('schemes_section_title')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#52786D', margin: 0 }}>
            {t('schemes_section_subtitle')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {schemes.map((s, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.6rem',
                border: '1px solid #E2ECE5',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    background: s.tagBg,
                    color: s.tagColor
                  }}>
                    {s.tag}
                  </span>
                  <Award size={18} color="#0D9488" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#11322A', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#52786D', lineHeight: 1.5, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 24x7 EMERGENCY & HELPLINES SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1.5px solid #FCA5A5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={22} color="#DC2626" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
            {t('emergency_section_title')}
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#B91C1C', marginBottom: '1.75rem' }}>
          {t('emergency_section_subtitle')}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {helplines.map((h, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  display: 'inline-block',
                  background: h.bg,
                  color: h.color,
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}>
                  {h.number}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginBottom: '0.3rem' }}>
                  {h.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.4 }}>
                  {h.desc}
                </div>
              </div>
              <a
                href={`tel:${h.number}`}
                style={{
                  marginTop: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: h.color,
                  textDecoration: 'none'
                }}
              >
                <Phone size={13} />
                <span>{t('btn_call_number')} {h.number}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
