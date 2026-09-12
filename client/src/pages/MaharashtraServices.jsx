import React, { useState } from 'react';
import { 
  Landmark, Globe, ShieldAlert, Phone, ExternalLink, 
  MapPin, CheckCircle2, ChevronRight, FileText, HeartHandshake, 
  Stethoscope, AlertTriangle, Search, Activity, Shield, Users
} from 'lucide-react';

export function MaharashtraServices({ setActiveTab, onOpenTelemed, onOpenHealthCard }) {
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [districtSearch, setDistrictSearch] = useState('');

  // 6 Administrative Revenue Divisions of Maharashtra
  const divisions = [
    { name: 'Konkan', count: 7, desc: 'Costal belt & Mumbai metro', url: 'https://konkan.gov.in' },
    { name: 'Pune', count: 5, desc: 'Western Maharashtra & sugar belt', url: 'https://pune.gov.in' },
    { name: 'Nashik', count: 5, desc: 'North Maharashtra & Khandesh', url: 'https://nashik.gov.in' },
    { name: 'Chhatrapati Sambhajinagar', count: 8, desc: 'Marathwada central region', url: 'https://aurangabad.gov.in' },
    { name: 'Amravati', count: 5, desc: 'West Vidarbha cotton zone', url: 'https://amravati.gov.in' },
    { name: 'Nagpur', count: 6, desc: 'East Vidarbha & forest belt', url: 'https://nagpur.gov.in' },
  ];

  // Complete List of All 36 Districts of Maharashtra
  const allDistricts = [
    // Konkan (7)
    { name: 'Mumbai City', division: 'Konkan', url: 'https://mumbaicity.gov.in' },
    { name: 'Mumbai Suburban', division: 'Konkan', url: 'https://mumbaisuburban.gov.in' },
    { name: 'Thane', division: 'Konkan', url: 'https://thane.nic.in' },
    { name: 'Palghar', division: 'Konkan', url: 'https://palghar.gov.in' },
    { name: 'Raigad', division: 'Konkan', url: 'https://raigad.gov.in' },
    { name: 'Ratnagiri', division: 'Konkan', url: 'https://ratnagiri.gov.in' },
    { name: 'Sindhudurg', division: 'Konkan', url: 'https://sindhudurg.nic.in' },

    // Pune (5)
    { name: 'Pune', division: 'Pune', url: 'https://pune.gov.in' },
    { name: 'Satara', division: 'Pune', url: 'https://satara.gov.in' },
    { name: 'Sangli', division: 'Pune', url: 'https://sangli.nic.in' },
    { name: 'Kolhapur', division: 'Pune', url: 'https://kolhapur.gov.in' },
    { name: 'Solapur', division: 'Pune', url: 'https://solapur.gov.in' },

    // Nashik (5)
    { name: 'Nashik', division: 'Nashik', url: 'https://nashik.gov.in' },
    { name: 'Dhule', division: 'Nashik', url: 'https://dhule.gov.in' },
    { name: 'Nandurbar', division: 'Nashik', url: 'https://nandurbar.gov.in' },
    { name: 'Jalgaon', division: 'Nashik', url: 'https://jalgaon.gov.in' },
    { name: 'Ahmednagar (Ahilyanagar)', division: 'Nashik', url: 'https://ahmednagar.nic.in' },

    // Chhatrapati Sambhajinagar (8)
    { name: 'Chhatrapati Sambhajinagar', division: 'Chhatrapati Sambhajinagar', url: 'https://aurangabad.gov.in' },
    { name: 'Jalna', division: 'Chhatrapati Sambhajinagar', url: 'https://jalna.gov.in' },
    { name: 'Beed', division: 'Chhatrapati Sambhajinagar', url: 'https://beed.gov.in' },
    { name: 'Latur', division: 'Chhatrapati Sambhajinagar', url: 'https://latur.gov.in' },
    { name: 'Dharashiv (Osmanabad)', division: 'Chhatrapati Sambhajinagar', url: 'https://osmanabad.nic.in' },
    { name: 'Parbhani', division: 'Chhatrapati Sambhajinagar', url: 'https://parbhani.gov.in' },
    { name: 'Hingoli', division: 'Chhatrapati Sambhajinagar', url: 'https://hingoli.nic.in' },
    { name: 'Nanded', division: 'Chhatrapati Sambhajinagar', url: 'https://nanded.gov.in' },

    // Amravati (5)
    { name: 'Amravati', division: 'Amravati', url: 'https://amravati.gov.in' },
    { name: 'Akola', division: 'Amravati', url: 'https://akola.gov.in' },
    { name: 'Buldhana', division: 'Amravati', url: 'https://buldhana.nic.in' },
    { name: 'Yavatmal', division: 'Amravati', url: 'https://yavatmal.gov.in' },
    { name: 'Washim', division: 'Amravati', url: 'https://washim.nic.in' },

    // Nagpur (6)
    { name: 'Nagpur', division: 'Nagpur', url: 'https://nagpur.gov.in' },
    { name: 'Wardha', division: 'Nagpur', url: 'https://wardha.gov.in' },
    { name: 'Bhandara', division: 'Nagpur', url: 'https://bhandara.gov.in' },
    { name: 'Gondia', division: 'Nagpur', url: 'https://gondia.gov.in' },
    { name: 'Chandrapur', division: 'Nagpur', url: 'https://chandrapur.gov.in' },
    { name: 'Gadchiroli', division: 'Nagpur', url: 'https://gadchiroli.gov.in' },
  ];

  // Filtered districts
  const filteredDistricts = allDistricts.filter(d => {
    const matchesDiv = selectedDivision === 'All' || d.division === selectedDivision;
    const matchesSearch = !districtSearch || d.name.toLowerCase().includes(districtSearch.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  // 8 Core Government Programs
  const governmentPrograms = [
    {
      title: 'Mahatma Jyotirao Phule Jan Arogya Yojana',
      badge: 'FINANCIAL PROTECTION',
      badgeColor: '#0D9488',
      subBadge: 'MJPJAY · MAHARASHTRA RESIDENTS: ELIGIBILITY AND DOCUMENTS VARY BY CATEGORY',
      desc: 'Provides secondary and tertiary hospitalization cover through empaneled hospitals across Maharashtra. 996+ empaneled hospitals cover critical illness, surgeries and ICU care.',
      note: 'Eligibility, pre-auth and empaneled hospitals must be checked on the official portal.',
      actionText: 'Check eligibility ↗',
      url: 'https://www.jeevandayee.gov.in/'
    },
    {
      title: 'Ayushman Bharat PM-JAY',
      badge: 'FINANCIAL PROTECTION',
      badgeColor: '#0284C7',
      subBadge: 'PM-JAY · ELIGIBLE BENEFICIARY FAMILIES IDENTIFIED BY THE NATIONAL SCHEME',
      desc: 'National cashless hospitalization cover of ₹5 lakh per family across empanelled public and private hospitals, with portability across all states of India.',
      note: 'Enrollment criteria requires SECC identification. Eligibility and e-KYC can be verified through the official portal.',
      actionText: 'Check PM-JAY ↗',
      url: 'https://pmjay.gov.in/'
    },
    {
      title: 'eSanjeevani Telemedicine',
      badge: 'DIGITAL HEALTH',
      badgeColor: '#D97706',
      subBadge: 'ESANJEEVANI · CITIZENS SEEKING REMOTE CONSULTATION WHERE THE SERVICE IS AVAILABLE',
      desc: 'Government telemedicine platform connecting patients to doctors and certified medical teams for free official consultation, provisional e-prescription, and referrals.',
      note: 'Hours and provider availability can change; urgent symptoms must not wait for online appointments.',
      actionText: 'Open eSanjeevani ↗',
      isTelemed: true
    },
    {
      title: 'RCH-Vatsalya (Maternal & Child Health)',
      badge: 'MATERNAL & CHILD',
      badgeColor: '#EC4899',
      subBadge: 'RCH · PREGNANT WOMEN, LACTATING MOTHERS, ELIGIBLE COUPLES, AND CHILDREN UNDER TWO',
      desc: 'Maternal and child health pathway covering antenatal care (ANC), high-risk follow-up, nutrition, breastfeeding and growth monitoring.',
      note: 'Local clinic hours and nutritional support availability should be confirmed with the facility ASHA.',
      actionText: 'View Maternal care ↗',
      onClick: () => setActiveTab('records-referrals')
    },
    {
      title: 'Routine Immunisation Programme',
      badge: 'PREVENTION',
      badgeColor: '#06B6D4',
      subBadge: 'UIP · CHILDREN AND PREGNANT WOMEN',
      desc: 'Public health vaccine schedule delivered through government facilities and outreach session days (VHND). Free coverage against 12 preventable diseases.',
      note: 'Session dates, schedules and vaccine stock vary by district; verify on-ground with ASHA.',
      actionText: 'Check vaccine schedule ↗',
      onClick: () => setActiveTab('camps')
    },
    {
      title: 'National Programme for Prevention and Control of NCDs (NP-NCD)',
      badge: 'SCREENING',
      badgeColor: '#CA8A04',
      subBadge: 'NP-NCD · ADULTS, WITH POPULATION SCREENING PROMPTS FROM AGE 30',
      desc: 'Screening and referrals for hypertension, diabetes and selected cancers with follow-up through the public health system. Encouraging early detection in rural populations.',
      note: 'Confirmatory tests and referrals require on-ground visits with ASHA screening.',
      actionText: 'Learn about screening ↗',
      onClick: () => setActiveTab('screening')
    },
    {
      title: 'National Tuberculosis Elimination Programme (NTEP)',
      badge: 'INFECTIOUS DISEASE',
      badgeColor: '#DC2626',
      subBadge: 'NTEP · PEOPLE WITH TB SYMPTOMS OR CONTACTS',
      desc: 'Designated facilities provide testing, treatment and programme support. Free CB-NAAT/Truenat tests and monthly direct benefit transfer (Nikshay Poshan Yojana).',
      note: 'Testing pathways and support services are governed by the official programme.',
      actionText: 'View TB Elimination ↗',
      url: 'https://tbcindia.gov.in/'
    },
    {
      title: 'Mobile Medical Units (MMU)',
      badge: 'OUTREACH',
      badgeColor: '#16A34A',
      subBadge: 'MMU · REMOTE, TRIBAL AND UNDERSERVED COMMUNITIES',
      desc: 'Doctor and paramedical vans providing primary care, medicines and diagnostics to remote hamlets, tribal belts and underserved villages.',
      note: 'Camp and vehicle schedules are district-specific; verify locally.',
      actionText: 'View MMU route & info ↗',
      onClick: () => setActiveTab('facilities')
    },
  ];

  // 9 Official Service Shortcuts
  const serviceShortcuts = [
    {
      title: 'Mental health tele-counseling',
      channel: '14416 · Tele-MANAS Maharashtra',
      tag: 'National Mental Health',
      href: 'tel:14416',
      icon: <Phone size={18} color="#0D9488" />
    },
    {
      title: 'Janani Shishu Suraksha referral transport',
      channel: '102 · Maharashtra except Mumbai (per NHM)',
      tag: 'Maternal Transport',
      href: 'tel:102',
      icon: <Phone size={18} color="#EC4899" />
    },
    {
      title: 'Nikshay TB support helpline',
      channel: '1800-11-6666 · Maharashtra Support',
      tag: 'TB Support',
      href: 'tel:1800116666',
      icon: <Phone size={18} color="#DC2626" />
    },
    {
      title: 'Citizen grievance & quality monitor',
      channel: '104 · Maharashtra Health Helpline',
      tag: 'Official 24x7 Help',
      href: 'tel:104',
      icon: <Phone size={18} color="#F59E0B" />
    },
    {
      title: 'Medical council doctor registration',
      channel: 'MMC · Maharashtra Medical Council verification',
      tag: 'Doctor Registry',
      url: 'https://medicalcouncil.maharashtra.gov.in',
      icon: <Stethoscope size={18} color="#0284C7" />
    },
    {
      title: 'Aaple Sarkar Grievance Portal',
      channel: 'aaplesarkar.mahaonline.gov.in',
      tag: 'Govt Grievance',
      url: 'https://aaplesarkar.mahaonline.gov.in',
      icon: <Landmark size={18} color="#16A34A" />
    },
    {
      title: 'ABHA / Ayushman Bharat Digital Mission',
      channel: 'Create/link your ABHA ID & digital records',
      tag: 'ABHA Portal',
      isABHA: true,
      icon: <Shield size={18} color="#6366F1" />
    },
    {
      title: 'e-RaktKosh Blood Availability',
      channel: 'Find nearest blood banks & stock levels',
      tag: 'Blood Portal',
      url: 'https://eraktkosh.mohfw.gov.in',
      icon: <Activity size={18} color="#EF4444" />
    },
    {
      title: 'MJPJAY Pre-Auth & Hospital List',
      channel: 'Verify cashless empaneled hospitals',
      tag: 'MJPJAY Portal',
      url: 'https://www.jeevandayee.gov.in',
      icon: <CheckCircle2 size={18} color="#0D9488" />
    }
  ];

  return (
    <div style={{ padding: '0 2rem 5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#173D35',
            marginBottom: '0.35rem'
          }}>
            MAHARASHTRA PUBLIC HEALTH
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
            fontWeight: 800,
            color: '#103127',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 0.65rem 0'
          }}>
            One state. One trusted starting point.
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
            Find trusted public healthcare from official Maharashtra Government Public Health Department resources, verify scheme eligibility, access hotlines and grievances.
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#E8F5EE',
          color: '#166534',
          border: '1px solid #C6E4D2',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.84rem'
        }}>
          <span>🏛️</span>
          <span>36 DISTRICTS</span>
        </div>
      </div>

      {/* 2. Top Grid: 2 Cards (Statewide Coverage + Immediate Help) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        
        {/* Left Card: Statewide Coverage (Deep Pine Green) */}
        <div style={{
          background: '#173D35',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(23, 61, 53, 0.2)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#A7F3D0'
              }}>
                • STATEWIDE COVERAGE
              </span>
              <Globe size={18} color="#A7F3D0" />
            </div>

            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.25,
              marginBottom: '0.85rem'
            }}>
              Maharashtra's public-health network, made easier to navigate.
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#D1FAE5', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Connects citizens across 36 districts, 350+ facilities, official hotlines, verified government links.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 500 }}>
                36-district directory
              </span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 500 }}>
                Official sources linked
              </span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 500 }}>
                Hospital 108 &amp; Helpline
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#A7F3D0'
          }}>
            <span>Last verified: 12 Sep 2026</span>
            <span style={{ fontWeight: 600 }}>Maharashtra Public Health Department</span>
          </div>
        </div>

        {/* Right Card: Immediate Help (Soft Peach/Coral) */}
        <div style={{
          background: '#FFF5F3',
          border: '1px solid #FDD8D0',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#991B1B'
              }}>
                IMMEDIATE HELP
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444'
              }}>
                <ShieldAlert size={18} />
              </div>
            </div>

            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#7F1D1D',
              lineHeight: 1.25,
              marginBottom: '0.65rem'
            }}>
              Need help right now?
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#991B1B', lineHeight: 1.45, marginBottom: '1.25rem' }}>
              For urgent symptoms do not wait for a portal or appointment. Call the official emergency and mental health helpline hotlines below:
            </p>

            {/* Helpline Action Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              
              <a
                href="tel:108"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #FECACA',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.05)',
                  textDecoration: 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991B1B' }}>Maharashtra ambulance</span>
                    <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.85rem' }}>
                      108
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#4B5563', lineHeight: 1.35 }}>
                    Free 24x7 ambulance dispatch for emergency and post-accident care.
                  </div>
                </div>
              </a>

              <a
                href="tel:112"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #FECACA',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.05)',
                  textDecoration: 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991B1B' }}>Integrated emergency</span>
                    <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.85rem' }}>
                      112
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#4B5563', lineHeight: 1.35 }}>
                    Police, fire, medical and other urgent emergency response.
                  </div>
                </div>
              </a>

            </div>
          </div>

          <p style={{
            fontSize: '0.74rem',
            color: '#7F1D1D',
            margin: 0,
            lineHeight: 1.4,
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            108 connects patients with 24x7 ambulance response. 104 is a single point for tele-counseling, blood availability, and maternal emergency response.
          </p>
        </div>

      </div>

      {/* 3. Section: "STATE GEOGRAPHY - Find your district" */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid #E2EBE5',
        marginBottom: '3rem',
        boxShadow: '0 2px 10px rgba(17, 34, 25, 0.03)'
      }}>
        
        {/* Section Header with Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: '0.35rem'
            }}>
              STATE GEOGRAPHY
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#11322A', margin: '0 0 0.5rem 0' }}>
              Find your district
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
              Select your district to view revenue divisions and all 36 districts across Maharashtra. Official district administration links are included for local schemes, civil hospital contacts, and the District Health Office.
            </p>
          </div>

          {/* Division Selector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
                style={{
                  appearance: 'none',
                  background: '#F0F5F2',
                  border: '1px solid #D1DFD6',
                  borderRadius: '10px',
                  padding: '0.6rem 2.25rem 0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#11322A',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Divisions (36 Districts)</option>
                {divisions.map(d => (
                  <option key={d.name} value={d.name}>{d.name} Division ({d.count} Districts)</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem', color: '#173D35' }}>
                ⌄
              </span>
            </div>

            <div style={{ position: 'relative', width: '180px' }}>
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={e => setDistrictSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem 0.6rem 2rem',
                  fontSize: '0.82rem',
                  border: '1px solid #D1DFD6',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
              />
              <Search size={14} color="#6B7280" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* 6 Revenue Divisions Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {divisions.map(div => {
            const isSelected = selectedDivision === div.name;
            return (
              <div
                key={div.name}
                onClick={() => setSelectedDivision(isSelected ? 'All' : div.name)}
                style={{
                  background: isSelected ? '#E8F5EE' : '#F9FBF9',
                  border: isSelected ? '1.5px solid #173D35' : '1px solid #E2EAE5',
                  borderRadius: '14px',
                  padding: '1rem 1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: '#E8F5EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#173D35'
                  }}>
                    <Landmark size={14} />
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', background: '#D1FAE5', padding: '2px 6px', borderRadius: '4px' }}>
                    {div.count} DISTRICTS
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                  {div.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', margin: '2px 0 0.5rem 0' }}>
                  State revenue division
                </div>
                <a
                  href={div.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0D9488',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>Official sources</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            );
          })}
        </div>

        {/* 36 Districts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '0.85rem'
        }}>
          {filteredDistricts.map(dist => (
            <div
              key={dist.name}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '12px',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#173D35';
                e.currentTarget.style.background = '#F6FAF7';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2ECE5';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                  {dist.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  {dist.division} Division
                </div>
              </div>

              <a
                href={dist.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0D9488',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#F0FDF4'
                }}
              >
                <span>DISTRICT PORTAL</span>
                <ExternalLink size={10} />
              </a>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Section: "SCHEMES & PREVENTION - Government programs, in plain language" */}
      <div style={{ marginBottom: '3rem' }}>
        
        {/* Section Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6B7280',
            marginBottom: '0.35rem'
          }}>
            SCHEMES &amp; PREVENTION
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#11322A', margin: '0 0 0.5rem 0' }}>
            Government programs, in plain language
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: 0 }}>
            RuralCare explains the pathways. Use official portals to check eligibility, authorization, package coverage, and claim records.
          </p>
        </div>

        {/* 8 Bento Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.35rem'
        }}>
          {governmentPrograms.map((prog, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2EBE5',
                borderRadius: '20px',
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(17, 34, 25, 0.02)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#173D35';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(17, 34, 25, 0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#E2EBE5';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(17, 34, 25, 0.02)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#E8F5EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#173D35'
                  }}>
                    <Landmark size={16} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: prog.badgeColor,
                    background: `${prog.badgeColor}15`,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}>
                    {prog.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: '0 0 0.45rem 0', lineHeight: 1.3 }}>
                  {prog.title}
                </h3>

                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#166534',
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  marginBottom: '0.85rem',
                  lineHeight: 1.3
                }}>
                  {prog.subBadge}
                </div>

                <p style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.45, margin: '0 0 0.85rem 0' }}>
                  {prog.desc}
                </p>

                <div style={{
                  fontSize: '0.74rem',
                  color: '#6B7280',
                  lineHeight: 1.35,
                  padding: '0.5rem 0.75rem',
                  background: '#F8FAF9',
                  borderRadius: '8px',
                  border: '1px solid #EAEFEA'
                }}>
                  {prog.note}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F0F4F1' }}>
                {prog.url ? (
                  <a
                    href={prog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#173D35',
                      textDecoration: 'none'
                    }}
                  >
                    <span>{prog.actionText}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (prog.isTelemed) onOpenTelemed();
                      else if (prog.onClick) prog.onClick();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#173D35',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span>{prog.actionText}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 5. Section: "OFFICIAL SERVICE SHORTCUTS - Go to the right government channel" */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid #E2EBE5',
        marginBottom: '2.5rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6B7280',
            marginBottom: '0.35rem'
          }}>
            OFFICIAL SERVICE SHORTCUTS
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#11322A', margin: '0 0 0.5rem 0' }}>
            Go to the right government channel
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: 0 }}>
            These links point to official services that have distinct government portals, toll-free lines, or contact centres for governance resolution.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {serviceShortcuts.map((sc, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #E2ECE5',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                background: '#FAFCFA'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#173D35';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2ECE5';
                e.currentTarget.style.background = '#FAFCFA';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2ECE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {sc.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                    {sc.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                    {sc.channel}
                  </div>
                </div>
              </div>

              <div>
                {sc.href ? (
                  <a
                    href={sc.href}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#173D35',
                      textDecoration: 'none',
                      background: '#E8F5EE',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>{sc.tag}</span>
                    <ExternalLink size={10} />
                  </a>
                ) : sc.isABHA ? (
                  <button
                    onClick={onOpenHealthCard}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#173D35',
                      background: '#E8F5EE',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>{sc.tag}</span>
                    <ExternalLink size={10} />
                  </button>
                ) : (
                  <a
                    href={sc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#173D35',
                      textDecoration: 'none',
                      background: '#E8F5EE',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>{sc.tag}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 6. Bottom Notice / Disclaimer Alert */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '16px',
        padding: '1.2rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: 1.45, margin: 0 }}>
          <strong>Important:</strong> RuralCare is a navigation and coordination platform developed for the Smart India Hackathon to connect citizens to public health services. For formal eligibility, hospital pre-authorization, or clinical emergency, always connect directly with official government hotlines (108/104) and certified medical staff.
        </p>
      </div>

    </div>
  );
}
