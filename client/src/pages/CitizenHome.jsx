import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Hospital, Sparkles, Calendar, FileText, 
  ShieldAlert, Pill, Activity, MessageSquare, MapPin, 
  ChevronRight, CheckCircle2, Video, Shield, Phone, 
  Stethoscope, Clock, Heart, ArrowRight, Bed, AlertTriangle,
  X, Check, User, Info, Award, Building2, Flame, Baby,
  Navigation, Users, HeartHandshake
} from 'lucide-react';

import DiseaseRadarWidget from '../components/DiseaseRadarWidget';
import MaternalChildTracker from '../components/MaternalChildTracker';

export function CitizenHome({ setActiveTab, onOpenEmergency, onOpenTelemed, onOpenHealthCard }) {
  const { user, role, demoLogin, selectedVillage, setSelectedVillage, villages } = useAuth();
  const { t, lang } = useLanguage();

  const [snapshotData, setSnapshotData] = useState(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  // Role workspace tab selector
  const [selectedWorkspaceTab, setSelectedWorkspaceTab] = useState('citizen');

  // Community health tab (Radar vs MCH)
  const [activeCommunityTab, setActiveCommunityTab] = useState('radar'); // 'radar' | 'mch'

  // Modals for deep interactivity
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [ifaDoseLogged, setIfaDoseLogged] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const currentVillage = selectedVillage?.village_name 
    ? (lang === 'mr' ? (selectedVillage.marathi_name || selectedVillage.village_name) : lang === 'hi' ? (selectedVillage.hindi_name || selectedVillage.village_name) : selectedVillage.village_name) 
    : (lang === 'mr' ? 'खेडगाव' : lang === 'hi' ? 'खेडगांव' : 'Khedgaon');
  const currentDistrict = selectedVillage?.district 
    ? (lang === 'mr' ? 'नाशिक व दिंडोरी' : lang === 'hi' ? 'नासिक व दिंडोरी' : selectedVillage.district) 
    : (lang === 'mr' ? 'नाशिक व दिंडोरी' : lang === 'hi' ? 'नासिक व दिंडोरी' : 'Nashik & Dindori');
  const greetingName = user?.name ? user.name.split(' ')[0] : (lang === 'mr' ? 'आशा' : lang === 'hi' ? 'आशा' : 'Asha');

  // Fetch real-time village snapshot from backend
  useEffect(() => {
    const villageId = selectedVillage?.village_id || 1;
    setLoadingSnapshot(true);
    fetch(`/api/villages/${villageId}/snapshot`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch snapshot');
        return res.json();
      })
      .then(data => {
        setSnapshotData(data);
        setLoadingSnapshot(false);
      })
      .catch(() => {
        setSnapshotData({
          score: 86,
          category: 'Good access',
          available_beds: 42,
          active_doctors: 18,
          nearest_facility: {
            facility_name: `${currentVillage} Primary Health Centre`,
            facility_type: 'PHC',
            distance_km: 1.8
          }
        });
        setLoadingSnapshot(false);
      });
  }, [selectedVillage, currentVillage]);

  // Log dose handler
  const handleLogDose = () => {
    setIfaDoseLogged(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const score = snapshotData?.score || 86;
  const categoryLabel = (snapshotData?.category === 'Good access' || !snapshotData?.category)
    ? t('good_access')
    : (snapshotData.category === 'Moderate access'
        ? (lang === 'mr' ? 'मध्यम पोहोच' : lang === 'hi' ? 'मध्यम पहुंच' : 'Moderate access')
        : t(snapshotData.category));

  // 4 Top Quick Action Cards
  const quickCards = [
    {
      id: 'facilities',
      label: t('tile_find_healthcare'),
      icon: <MapPin size={20} color="#0D9488" />,
      iconBg: '#E8F5EE',
      onClick: () => setActiveTab('facilities'),
    },
    {
      id: 'availability',
      label: t('tile_hospital_availability'),
      icon: <Bed size={20} color="#6366F1" />,
      iconBg: '#EEF2FF',
      onClick: () => setActiveTab('availability'),
    },
    {
      id: 'screening',
      label: t('tile_ai_screening'),
      icon: <Sparkles size={20} color="#F59E0B" />,
      iconBg: '#FEF3C7',
      onClick: () => setActiveTab('screening'),
    },
    {
      id: 'emergency',
      label: t('tile_emergency_help'),
      icon: <ShieldAlert size={20} color="#EF4444" />,
      iconBg: '#FEE2E2',
      onClick: onOpenEmergency,
    },
  ];

  // Role workspaces detail
  const workspaces = {
    citizen: {
      role: 'citizen',
      title: lang === 'mr' ? 'नागरिक व रुग्ण आरोग्य प्रवास' : lang === 'hi' ? 'नागरिक एवं मरीज स्वास्थ्य यात्रा' : 'Citizen & Patient Care Journey',
      subtitle: lang === 'mr' ? 'आरोग्य नोंदी, एआय लक्षण तपासणी, औषध शोध आणि अपॉइंटमेंट' : lang === 'hi' ? 'व्यक्तिगत स्वास्थ्य रिकॉर्ड, क्लीनिकल ट्राइएज, दवा खोज और अपॉइंटमेंट' : 'Personalized health records, clinical triage, medicine discovery & appointments',
      badge: t('role_citizen_badge'),
      items: lang === 'mr' ? [
        'एआय साहाय्यकाने लक्षणे व शारीरिक मापदंड तपासा',
        'सरकारी रुग्णालयात रांगेविना अपॉइंटमेंट बुक करा',
        'डिजिटल आभा हेल्थ कार्ड व वैद्यकीय इतिहास पहा',
        'जन औषधी केंद्रांवर स्वस्त जेनेरिक औषधे शोधा'
      ] : lang === 'hi' ? [
        'एआई क्लीनिकल ट्राइएज सहायक से लक्षण जांचें',
        'सरकारी अस्पताल में कतार-मुक्त अपॉइंटमेंट बुक करें',
        'डिजिटल आभा हेल्थ कार्ड और नुस्खे देखें',
        'जन औषधि केंद्रों पर सस्ती जेनेरिक दवाएं खोजें'
      ] : [
        'Check symptoms with AI clinical triage assistant',
        'Book zero-wait appointments at nearest government hospital',
        'Access QR-enabled ABHA Digital Health Card & digital Rx',
        'Search affordable generic medicines at Jan Aushadhi Kendras'
      ],
      actionLabel: lang === 'mr' ? 'नागरिक डॅशबोर्ड उघडा' : lang === 'hi' ? 'नागरिक डैशबोर्ड खोलें' : 'Open Citizen Dashboard',
      actionTab: 'home'
    },
    asha: {
      role: 'asha',
      title: t('portal_asha_title'),
      subtitle: t('portal_asha_subtitle'),
      badge: t('role_asha_badge'),
      items: lang === 'mr' ? [
        'घरोघरी आरोग्य सर्वेक्षण व जोखीम मागोवा',
        'गरोदर माता (एएनसी/पीएनसी) व तातडीची मदत',
        'बाल लसीकरण मागोवा व पाठपुरावा',
        'ग्रामीण व जिल्हा रुग्णालयांसाठी थेट स्मार्ट रेफरल'
      ] : lang === 'hi' ? [
        'घर-घर परिवार स्वास्थ्य सर्वेक्षण और जोखिम निगरानी',
        'उच्च जोखिम गर्भावस्था (एएनसी/पीएनसी) निगरानी',
        'बाल टीकाकरण ट्रैकिंग और नियमित फॉलो-अप',
        'उप-जिला और जिला अस्पतालों के लिए सीधा स्मार्ट रेफरल'
      ] : [
        'Village household health surveys and vulnerability tracking',
        'High-risk pregnancy (ANC/PNC) monitoring & emergency flagging',
        'Child immunization tracking & drop-out recovery',
        'Direct referral submission to Sub-District and Civil Hospitals'
      ],
      actionLabel: lang === 'mr' ? 'आशा कार्यक्षेत्र सुरू करा' : lang === 'hi' ? 'आशा कार्यक्षेत्र खोलें' : 'Launch ASHA Workspace',
      actionTab: 'asha-dashboard'
    },
    doctor: {
      role: 'doctor',
      title: t('portal_doctor_title'),
      subtitle: t('portal_doctor_subtitle'),
      badge: t('role_doctor_badge'),
      items: lang === 'mr' ? [
        'थेट ओपीडी रुग्ण सल्लामसलत रांग व इतिहास',
        'वाइटल्ससह थेट ई-संजीवनी व्हिडिओ कक्ष',
        'जन औषधी जेनेरिक औषध मॅपिंगसह डिजिटल प्रिस्क्रिप्शन',
        'रेफरल स्वीकृती आणि जिल्हा रुग्णालयाकडे वर्गवारी'
      ] : lang === 'hi' ? [
        'वास्तविक समय ओपीडी परामर्श कतार व मरीज इतिहास',
        'वाइटल्स के साथ लाइव ई-संजीवनी वीडियो परामर्श कक्ष',
        'जन औषधि जेनेरिक दवाओं के साथ डिजिटल नुस्खा',
        'आने वाले रेफरल की स्वीकृति और विशेषज्ञ ट्रांसफर'
      ] : [
        'Real-time outpatient consultation queue and patient history',
        'Live e-Sanjeevani video consultation chamber with vitals HUD',
        'Digital prescription writer with Jan Aushadhi generic mapping',
        'Inward referrals acceptance and tertiary hospital transfers'
      ],
      actionLabel: lang === 'mr' ? 'डॉक्टर ओपीडी सुरू करा' : lang === 'hi' ? 'डॉक्टर ओपीडी खोलें' : 'Launch Doctor Portal',
      actionTab: 'doctor-dashboard'
    },
    admin: {
      role: 'admin',
      title: t('portal_admin_title'),
      subtitle: t('portal_admin_subtitle'),
      badge: t('role_admin_badge'),
      items: lang === 'mr' ? [
        'साथरोग रडार व मोसमी आजार इशारा यंत्रणा',
        'जिल्हाभरातील रिक्त खाटा व ऑक्सिजन/आयसीयू सज्जता',
        '१०८ रुग्णवाहिका प्रतिसाद वेळ आणि नियंत्रण',
        'नागरिक तक्रारींचे त्वरित निवारण व पाठपुरावा'
      ] : lang === 'hi' ? [
        'रोग निगरानी व मौसमी बीमारी चेतावनी रडार',
        'राज्यव्यापी खाली बिस्तर गणना और आईसीयू तत्परता',
        '१०८ एम्बुलेंस प्रतिक्रिया समय ट्रैकिंग',
        'नागरिक शिकायत समाधान और गुणवत्ता निगरानी'
      ] : [
        'Real-time disease surveillance & seasonal outbreak radar',
        'Statewide vacant bed census & oxygen/ICU readiness',
        '108 Ambulance response time tracking and dispatch latency',
        'Citizen grievance escalation and resolution tracking'
      ],
      actionLabel: lang === 'mr' ? 'प्रशासन कमान सुरू करा' : lang === 'hi' ? 'प्रशासन कमान खोलें' : 'Launch Admin Command Centre',
      actionTab: 'admin-dashboard'
    }
  };

  const currentWorkspace = workspaces[selectedWorkspaceTab];

  // 9 Core Public Healthcare Modules
  const coreServices = [
    {
      id: 'facilities',
      title: 'Find Healthcare Near You',
      marathiTitle: 'जवळचे आरोग्य केंद्र शोधा',
      hindiTitle: 'नजदीकी स्वास्थ्य केंद्र खोजें',
      desc: lang === 'mr' 
        ? '३५०+ शासकीय रुग्णालये, प्राथमिक व ग्रामीण आरोग्य केंद्र थेट जीपीएस नेव्हिगेशनसह शोधा.'
        : lang === 'hi'
        ? '३५०+ सरकारी अस्पताल, प्राथमिक व सामुदायिक स्वास्थ्य केंद्र सटीक जीपीएस से खोजें।'
        : 'Locate 350+ verified PHCs, CHCs, Sub-District Hospitals & Civil Hospitals with exact GPS navigation.',
      badge: 'Interactive GIS Map',
      hindiBadge: 'इंटरएक्टिव जीआईएस नक्शा',
      marathiBadge: 'जीआयएस नकाशा',
      badgeColor: '#0D9488',
      icon: <Search size={22} color="#0D9488" />,
      actionText: lang === 'mr' ? 'केंद्रे शोधा' : lang === 'hi' ? 'अस्पताल खोजें' : 'Explore Facilities'
    },
    {
      id: 'screening',
      title: 'AI Clinical Triage & Screening',
      marathiTitle: 'एआय लक्षण तपासणी व सल्ला',
      hindiTitle: 'एआई स्वास्थ्य जांच व ट्राइएज',
      desc: lang === 'mr'
        ? 'लक्षणे व शारीरिक मापदंड तपासून योग्य उपचार पातळी आणि त्वरित निर्णय साहाय्य.'
        : lang === 'hi'
        ? 'लक्षणों और शारीरिक संकेतों के आधार पर तत्काल क्लीनिकल निर्णय सहायता।'
        : 'Instant decision-support evaluating vitals, red-flag symptoms, and recommended facility level.',
      badge: 'Clinical Decision Support',
      hindiBadge: 'क्लीनिकल निर्णय सहायता',
      marathiBadge: 'वैद्यकीय निर्णय साहाय्य',
      badgeColor: '#8B5CF6',
      icon: <Sparkles size={22} color="#8B5CF6" />,
      actionText: lang === 'mr' ? 'लक्षणे तपासा' : lang === 'hi' ? 'जांच शुरू करें' : 'Check Symptoms'
    },
    {
      id: 'availability',
      title: 'Hospital Availability Census',
      marathiTitle: 'रुग्णालय खाटा व डॉक्टर स्थिती',
      hindiTitle: 'अस्पताल बिस्तर व डॉक्टर उपलब्धता',
      desc: lang === 'mr'
        ? 'सर्वसाधारण व अतिदक्षता (ICU) खाटा, उपस्थित तज्ज्ञ डॉक्टर आणि २४x७ तातडीची सेवा.'
        : lang === 'hi'
        ? 'खाली सामान्य व आईसीयू बिस्तर, ड्यूटी पर उपस्थित डॉक्टर और २४x७ आपातकालीन स्थिति।'
        : 'Live census of vacant general/ICU beds, on-duty specialist doctors, and 24x7 emergency readiness.',
      badge: 'Real-Time Census',
      hindiBadge: 'लाइव बिस्तर गणना',
      marathiBadge: 'थेट खाटांची नोंद',
      badgeColor: '#0284C7',
      icon: <Hospital size={22} color="#0284C7" />,
      actionText: lang === 'mr' ? 'खाटा पहा' : lang === 'hi' ? 'बिस्तर स्थिति देखें' : 'View Live Beds'
    },
    {
      id: 'book-appointment',
      title: 'Book OPD Consultation',
      marathiTitle: 'ओपीडी अपॉइंटमेंट बुक करा',
      hindiTitle: 'ओपीडी अपॉइंटमेंट बुक करें',
      desc: lang === 'mr'
        ? 'सरकारी डॉक्टरांशी भेटीची वेळ निश्चित करा आणि रांगेविना वेळेवर उपचार घ्या.'
        : lang === 'hi'
        ? 'सरकारी डॉक्टरों के साथ परामर्श स्लॉट तय करें और बिना कतार समय पर परामर्श लें।'
        : 'Schedule appointment slots with verified government doctors with zero queue waiting times.',
      badge: 'Zero-Wait Scheduling',
      hindiBadge: 'कतार-मुक्त बुकिंग',
      marathiBadge: 'रांगेविना बुकिंग',
      badgeColor: '#10B981',
      icon: <Calendar size={22} color="#10B981" />,
      actionText: lang === 'mr' ? 'अपॉइंटमेंट घ्या' : lang === 'hi' ? 'स्लॉट बुक करें' : 'Book Slot'
    },
    {
      id: 'telemedicine',
      isTelemed: true,
      title: 'e-Sanjeevani Teleconsultation',
      marathiTitle: 'ई-संजीवनी टेलिमेडिसिन व्हिडिओ कक्ष',
      hindiTitle: 'ई-संजीवनी टेलीमेडिसिन वीडियो परामर्श',
      desc: lang === 'mr'
        ? 'घरी बसून सरकारी तज्ज्ञ डॉक्टरांशी थेट मोफत व्हिडिओ सल्लामसलत.'
        : lang === 'hi'
        ? 'घर बैठे विशेषज्ञ सरकारी डॉक्टरों से निःशुल्क सीधा वीडियो परामर्श।'
        : 'Direct video consultation with government doctors and specialists from the comfort of home.',
      badge: 'Live Video OPD',
      hindiBadge: 'लाइव वीडियो ओपीडी',
      marathiBadge: 'थेट व्हिडिओ ओपीडी',
      badgeColor: '#06B6D4',
      icon: <Video size={22} color="#06B6D4" />,
      actionText: lang === 'mr' ? 'सल्ला सुरू करा' : lang === 'hi' ? 'परामर्श शुरू करें' : 'Start Consultation'
    },
    {
      id: 'health-card',
      isHealthCard: true,
      title: 'Digital Health Card (ABHA)',
      marathiTitle: 'डिजिटल हेल्थ कार्ड (आभा)',
      hindiTitle: 'डिजिटल हेल्थ कार्ड (आभा)',
      desc: lang === 'mr'
        ? 'रक्तगट, ॲलर्जी व आपत्कालीन संपर्कासह अधिकृत डिजिटल आरोग्य प्रवास ओळख.'
        : lang === 'hi'
        ? 'रक्त समूह, एलर्जी और आपातकालीन संपर्क सहित आधिकारिक डिजिटल स्वास्थ्य पहचान।'
        : 'Official QR-enabled digital health identity card with blood group, allergies, and emergency contacts.',
      badge: 'ABHA Identity',
      hindiBadge: 'आभा डिजिटल पहचान',
      marathiBadge: 'आभा डिजिटल ओळख',
      badgeColor: '#16A34A',
      icon: <Shield size={22} color="#16A34A" />,
      actionText: lang === 'mr' ? 'कार्ड पहा' : lang === 'hi' ? 'कार्ड देखें' : 'View Health Card'
    },
    {
      id: 'medicines',
      title: 'Jan Aushadhi & Generic Medicines',
      marathiTitle: 'जन औषधी व जेनेरिक औषधे',
      hindiTitle: 'जन औषधि व जेनेरिक दवाइयां',
      desc: lang === 'mr'
        ? '८७% पर्यंत बचत करणारी आवश्यक २५+ जेनेरिक औषधे व स्थानिक केंद्रांमधील साठा तपासा.'
        : lang === 'hi'
        ? '८७% तक की बचत करने वाली २५+ आवश्यक जेनेरिक दवाएं और नजदीकी केंद्रों में स्टॉक जांचें।'
        : 'Search 25+ essential generic medicines saving up to 87% cost and check live inventory at local PHCs.',
      badge: 'Up to 87% Savings',
      hindiBadge: '८७% तक बचत',
      marathiBadge: '८७% पर्यंत बचत',
      badgeColor: '#EC4899',
      icon: <Pill size={22} color="#EC4899" />,
      actionText: lang === 'mr' ? 'औषधे शोधा' : lang === 'hi' ? 'दवाइयां खोजें' : 'Search Medicines'
    },
    {
      id: 'camps',
      title: 'Rural Health Camps',
      marathiTitle: 'ग्रामीण आरोग्य शिबिरे',
      hindiTitle: 'ग्रामीण स्वास्थ्य शिविर',
      desc: lang === 'mr'
        ? 'माता-बाल आरोग्य, मधुमेह व नेत्र तपासणीची आगामी मोफत शिबिरे.'
        : lang === 'hi'
        ? 'मातृ-शिशु स्वास्थ्य, मधुमेह और नेत्र जांच हेतु आगामी निःशुल्क ग्रामीण शिविर।'
        : 'Upcoming free community health checkup camps for maternal care, diabetes, and eye screenings.',
      badge: 'Free Community Care',
      hindiBadge: 'निःशुल्क ग्रामीण सेवा',
      marathiBadge: 'मोफत ग्रामीण तपासणी',
      badgeColor: '#F59E0B',
      icon: <Activity size={22} color="#F59E0B" />,
      actionText: lang === 'mr' ? 'शिबिरे पहा' : lang === 'hi' ? 'शिविर देखें' : 'View Health Camps'
    },
    {
      id: 'complaints',
      title: 'Quality Monitor & Grievances',
      marathiTitle: 'तक्रार निवारण व दर्जा सनियंत्रण',
      hindiTitle: 'गुणवत्ता निगरानी व शिकायत निवारण',
      desc: lang === 'mr'
        ? 'डॉक्टर अनुपस्थिती, औषध तुटवडा किंवा अस्वच्छतेची जिल्हा आरोग्य अधिकाऱ्यांकडे थेट तक्रार.'
        : lang === 'hi'
        ? 'डॉक्टर अनुपस्थिति, दवा की कमी या अस्पताल स्वच्छता की जिला स्वास्थ्य अधिकारी को सीधी शिकायत।'
        : 'Directly report doctor absence, medicine shortages, or facility hygiene to the District Health Officer.',
      badge: 'Direct Redressal',
      hindiBadge: 'त्वरित शिकायत निवारण',
      marathiBadge: 'थेट तक्रार निवारण',
      badgeColor: '#D97706',
      icon: <MessageSquare size={22} color="#D97706" />,
      actionText: lang === 'mr' ? 'तक्रार नोंदवा' : lang === 'hi' ? 'शिकायत दर्ज करें' : 'File Feedback'
    }
  ];

  return (
    <div style={{ padding: '0 2rem 5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Toast Alert */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#11322A',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 2000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.3s ease'
        }}>
          <CheckCircle2 size={18} color="#34D399" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
            {t('ifa_adherence_toast')}
          </span>
        </div>
      )}

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
        
        {/* Subtle Decorative Organic Wave */}
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
            <span>{t('district_demo_view')}</span>
            <span style={{ color: '#52786D', fontWeight: 500, marginLeft: '0.2rem' }}>
              {lang === 'hi' ? `१२ सितंबर २०२६ · ${currentDistrict}` : lang === 'mr' ? `१२ सप्टेंबर २०२६ · ${currentDistrict}` : `12 September 2026 · ${currentDistrict}`}
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
            marginBottom: '1.1rem',
            whiteSpace: 'pre-line'
          }}>
            {t('hero_title')}
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
            {t('hero_subtitle')}
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
              <span>{t('hero_find_btn')}</span>
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
              <span>{t('hero_screen_btn')}</span>
            </button>

            <button
              onClick={onOpenEmergency}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '0.82rem 1.4rem',
                borderRadius: '9999px',
                fontSize: '0.94rem',
                fontWeight: 700,
                border: '1px solid #FECACA',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldAlert size={17} />
              <span>{t('emergency_call')}</span>
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
              {t('care_snapshot')}
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
              color: score >= 75 ? '#166534' : score >= 50 ? '#D97706' : '#DC2626',
              lineHeight: 1,
              fontFamily: "'Outfit', sans-serif"
            }}>
              {score}
            </span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.1 }}>{t('access_score')}</div>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: score >= 75 ? '#166534' : score >= 50 ? '#D97706' : '#DC2626'
              }}>
                {categoryLabel}
              </div>
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
              width: `${score}%`,
              height: '100%',
              background: score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444',
              borderRadius: '9999px',
              transition: 'width 0.5s ease-in-out'
            }} />
          </div>

          {/* Description */}
          <p style={{
            fontSize: '0.74rem',
            color: '#6B7280',
            lineHeight: 1.35,
            margin: 0
          }}>
            {lang === 'hi' 
              ? `दूरी, ${currentVillage} में ${snapshotData?.available_beds || 42} बिस्तर, ${snapshotData?.active_doctors || 18} डॉक्टर व दवाइयों पर आधारित`
              : lang === 'mr'
              ? `अंतर, ${currentVillage} मधील ${snapshotData?.available_beds || 42} खाटा, ${snapshotData?.active_doctors || 18} डॉक्टर व औषध साठ्यावर आधारित`
              : `Based on distance, ${snapshotData?.available_beds || 42} beds, ${snapshotData?.active_doctors || 18} doctors & medicines in ${currentVillage}`}
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

      {/* Live e-Sanjeevani Video Call Consultation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E8F5EE 0%, #D8EFE2 100%)',
        border: '1.5px solid #166534',
        borderRadius: '22px',
        padding: '1.5rem 2rem',
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 6px 20px rgba(16, 101, 52, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: '#173D35',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(23, 61, 53, 0.25)',
            flexShrink: 0
          }}>
            <Video size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#11322A' }}>
                {t('esanjeevani_room_title')}
              </span>
              <span style={{
                background: '#166534',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} />
                {t('doctor_online_now')}
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#2B4A3F', margin: 0, lineHeight: 1.4 }}>
              {t('esanjeevani_room_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTelemed}
          style={{
            background: '#173D35',
            color: '#FFFFFF',
            padding: '0.8rem 1.6rem',
            borderRadius: '9999px',
            fontSize: '0.94rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0F2922';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#173D35';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Video size={18} />
          <span>{t('start_video_call_now')}</span>
        </button>
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
              {t('care_journey')}
            </div>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#11322A',
              lineHeight: 1.2
            }}>
              {t('good_morning')}, {greetingName}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#52786D', marginTop: '0.2rem' }}>
              {t('attention_today')}
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
            <span>{t('view_all_records')}</span>
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
                  {t('next_appointment')}
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
                  {t('confirmed')}
                </span>
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#11322A', marginBottom: '1.2rem' }}>
                {lang === 'hi' ? '१५ सितंबर २०२६' : lang === 'mr' ? '१५ सप्टेंबर २०२६' : '15 Sep 2026'}
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
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827' }}>
                    {currentVillage} {lang === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र' : lang === 'mr' ? 'प्राथमिक आरोग्य केंद्र' : 'Primary Health Centre'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {lang === 'hi' ? 'डॉ. अंजलि पाटिल · सुबह १०:३० बजे' : lang === 'mr' ? 'डॉ. अंजली पाटील · सकाळी १०:३०' : 'Dr. Anjali Patil · 10:30 AM'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F0F5F2' }}>
              <button
                onClick={() => setShowAppointmentModal(true)}
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
                <span>{t('manage')}</span>
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
                  {t('follow_up_due')}
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
                {lang === 'hi' ? 'आज' : lang === 'mr' ? 'आज' : 'Today'}
              </div>

              <div style={{ fontSize: '0.94rem', color: '#D1FAE5', lineHeight: 1.4 }}>
                {lang === 'hi' ? 'चक्कर आना व आयरन थेरेपी की जांच' : lang === 'mr' ? 'चक्कर व लोहयुक्त गोळ्यांची तपासणी' : 'Check dizziness & iron therapy'}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                onClick={() => setShowFollowUpModal(true)}
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
                <span>{t('open_follow_up')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. STATEWIDE LIVE CENSUS (4 Bento Metric Cards) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        border: '1px solid #E2EBE5',
        marginBottom: '3rem',
        boxShadow: '0 2px 8px rgba(17, 34, 25, 0.02)'
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('telemetry_tag')}
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0 0 0' }}>
            {t('telemetry_title')}
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{ background: '#F8FAF9', border: '1px solid #E2ECE5', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>{t('public_facilities')}</span>
              <Building2 size={18} color="#0D9488" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#11322A' }}>
              {t('facilities_count')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#52786D' }}>
              {t('facilities_desc')}
            </div>
          </div>

          <div style={{ background: '#F8FAF9', border: '1px solid #E2ECE5', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>{t('live_bed_census')}</span>
              <Hospital size={18} color="#0284C7" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284C7' }}>
              {t('realtime_vacancy')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#52786D' }}>
              {t('bed_census_desc')}
            </div>
          </div>

          <div style={{ background: '#F8FAF9', border: '1px solid #E2ECE5', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>{t('doctors_on_duty')}</span>
              <Stethoscope size={18} color="#16A34A" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A' }}>
              {t('doctors_count')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#52786D' }}>
              {t('doctors_desc')}
            </div>
          </div>

          <div style={{ background: '#F8FAF9', border: '1px solid #E2ECE5', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>{t('districts_coverage')}</span>
              <Award size={18} color="#D97706" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706' }}>
              {t('districts_count')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#52786D' }}>
              {t('districts_desc')}
            </div>
          </div>
        </div>
      </div>

      {/* 5. LOCAL VILLAGE ACCESSIBILITY & GIS MAP RADAR */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        border: '1px solid #E2EBE5',
        marginBottom: '3rem',
        boxShadow: '0 2px 8px rgba(17, 34, 25, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('village_reachability_tag')}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0 0 0' }}>
              {lang === 'hi' ? `स्थानीय क्षेत्र पहुंच: ${currentVillage} (${currentDistrict})` : lang === 'mr' ? `स्थानिक क्षेत्र पोहोच: ${currentVillage} (${currentDistrict})` : `Local Area Reachability: ${currentVillage} (${currentDistrict})`}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0.2rem 0 0 0' }}>
              {t('reachability_desc')}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('facilities')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#E8F5EE',
              color: '#166534',
              border: '1px solid #C6E4D2',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Navigation size={15} />
            <span>{t('explore_gis_map')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ background: '#F8FAF9', borderRadius: '14px', padding: '1rem', border: '1px solid #E2ECE5' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{t('nearest_subcentre')}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0' }}>{t('subcentre_dist')}</div>
            <div style={{ fontSize: '0.75rem', color: '#166534' }}>{t('subcentre_time')}</div>
          </div>

          <div style={{ background: '#F8FAF9', borderRadius: '14px', padding: '1rem', border: '1px solid #E2ECE5' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{t('nearest_phc')}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0' }}>{t('phc_dist')}</div>
            <div style={{ fontSize: '0.75rem', color: '#166534' }}>{t('phc_time')}</div>
          </div>

          <div style={{ background: '#F8FAF9', borderRadius: '14px', padding: '1rem', border: '1px solid #E2ECE5' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{t('district_civil_hospital')}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0' }}>{t('hospital_dist')}</div>
            <div style={{ fontSize: '0.75rem', color: '#0284C7' }}>{t('hospital_time')}</div>
          </div>

          <div style={{ background: '#F8FAF9', borderRadius: '14px', padding: '1rem', border: '1px solid #E2ECE5' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{t('ambulance_dispatch')}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626', margin: '0.2rem 0' }}>{t('ambulance_eta')}</div>
            <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>{t('ambulance_desc')}</div>
          </div>
        </div>
      </div>

      {/* 6. MULTI-STAKEHOLDER ROLE WORKSPACES (Dedicated Interactive Switcher) */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('role_workspaces_tag')}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0 0 0' }}>
              {t('role_workspaces_title')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#52786D', margin: 0 }}>
              {t('role_workspaces_subtitle')}
            </p>
          </div>

          {/* Workspace Tabs */}
          <div style={{ display: 'flex', background: '#F0F5F2', padding: '4px', borderRadius: '12px', border: '1px solid #DCE6E1', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedWorkspaceTab('citizen')}
              style={{
                background: selectedWorkspaceTab === 'citizen' ? '#173D35' : 'transparent',
                color: selectedWorkspaceTab === 'citizen' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('tab_citizen')}
            </button>
            <button
              onClick={() => setSelectedWorkspaceTab('asha')}
              style={{
                background: selectedWorkspaceTab === 'asha' ? '#173D35' : 'transparent',
                color: selectedWorkspaceTab === 'asha' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('tab_asha')}
            </button>
            <button
              onClick={() => setSelectedWorkspaceTab('doctor')}
              style={{
                background: selectedWorkspaceTab === 'doctor' ? '#173D35' : 'transparent',
                color: selectedWorkspaceTab === 'doctor' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('tab_doctor')}
            </button>
            <button
              onClick={() => setSelectedWorkspaceTab('admin')}
              style={{
                background: selectedWorkspaceTab === 'admin' ? '#173D35' : 'transparent',
                color: selectedWorkspaceTab === 'admin' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('tab_admin')}
            </button>
          </div>
        </div>

        {/* Active Workspace Showcase Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #173D35',
          padding: '2rem 2.25rem',
          boxShadow: '0 8px 24px rgba(23, 61, 53, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.75rem' }}>
            <div style={{ flex: '1 1 500px' }}>
              <span style={{
                background: '#E8F5EE',
                color: '#166534',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                {currentWorkspace.badge}
              </span>

              <h3 style={{ fontSize: '1.45rem', color: '#11322A', fontWeight: 800, marginBottom: '0.4rem' }}>
                {currentWorkspace.title}
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.5rem', lineHeight: 1.45 }}>
                {currentWorkspace.subtitle}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                {currentWorkspace.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#1F2937' }}>
                    <CheckCircle2 size={16} color="#0D9488" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'center' }}>
              <button
                onClick={async () => {
                  await demoLogin(currentWorkspace.role);
                  setActiveTab(currentWorkspace.actionTab);
                }}
                style={{
                  background: '#173D35',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)'
                }}
              >
                <span>{currentWorkspace.actionLabel}</span>
                <ArrowRight size={17} />
              </button>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', textAlign: 'center' }}>
                {t('quick_evaluator_switch')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. ALL 9 CORE PUBLIC HEALTHCARE SERVICES (Bento Grid) */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('public_modules_tag')}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0 0 0' }}>
            {t('public_modules_title')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#52786D', margin: 0 }}>
            {t('public_modules_subtitle')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {coreServices.map((service) => (
            <div
              key={service.id}
              onClick={() => {
                if (service.isEmergency) onOpenEmergency();
                else if (service.isTelemed) onOpenTelemed();
                else if (service.isHealthCard) onOpenHealthCard();
                else setActiveTab(service.id);
              }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#F0F5F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {service.icon}
                  </div>
                  <span style={{
                    background: `${service.badgeColor}18`,
                    color: service.badgeColor,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px'
                  }}>
                    {lang === 'mr' ? service.marathiBadge : lang === 'hi' ? (service.hindiBadge || service.badge) : service.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', color: '#111827', fontWeight: 800, marginBottom: '0.2rem' }}>
                  {lang === 'mr' ? service.marathiTitle : lang === 'hi' ? (service.hindiTitle || service.title) : service.title}
                </h3>
                {lang === 'en' && (
                  <div style={{ fontSize: '0.78rem', color: '#52786D', marginBottom: '0.65rem', fontWeight: 500 }}>
                    {service.marathiTitle}
                  </div>
                )}
                <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45, margin: '0 0 1rem 0' }}>
                  {service.desc}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#173D35',
                borderTop: '1px solid #F0F5F2',
                paddingTop: '0.75rem'
              }}>
                <span>{service.actionText}</span>
                <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. COMMUNITY HEALTH RADAR & MATERNAL REGISTRY (Interactive Surveillance Tab) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        border: '1px solid #E2EBE5',
        marginBottom: '3rem',
        boxShadow: '0 2px 10px rgba(17, 34, 25, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('surveillance_tag')}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#11322A', margin: '0.2rem 0 0 0' }}>
              {t('surveillance_title')}
            </h3>
          </div>

          <div style={{ display: 'flex', background: '#F0F5F2', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setActiveCommunityTab('radar')}
              style={{
                background: activeCommunityTab === 'radar' ? '#173D35' : 'transparent',
                color: activeCommunityTab === 'radar' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Flame size={14} color={activeCommunityTab === 'radar' ? '#EF4444' : '#6B7280'} />
              <span>{t('tab_outbreak_radar')}</span>
            </button>
            <button
              onClick={() => setActiveCommunityTab('mch')}
              style={{
                background: activeCommunityTab === 'mch' ? '#173D35' : 'transparent',
                color: activeCommunityTab === 'mch' ? '#FFFFFF' : '#374151',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Baby size={14} color={activeCommunityTab === 'mch' ? '#2DD4BF' : '#6B7280'} />
              <span>{t('tab_mch')}</span>
            </button>
          </div>
        </div>

        {activeCommunityTab === 'radar' ? (
          <DiseaseRadarWidget />
        ) : (
          <MaternalChildTracker />
        )}
      </div>

      {/* 9. 24x7 EMERGENCY HELPLINE STRIP */}
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
              {t('helpline_strip_title')}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7F1D1D' }}>
              {t('helpline_strip_subtitle')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
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
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              textDecoration: 'none'
            }}
          >
            <Phone size={14} /> {t('btn_ambulance_108')}
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
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <Phone size={14} /> {t('btn_health_104')}
          </a>

          <a
            href="tel:102"
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
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <Phone size={14} /> {t('btn_matritva_102')}
          </a>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Interactive Appointment Modal */}
      {showAppointmentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 34, 25, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            border: '1px solid #E2EAE5'
          }}>
            <button
              onClick={() => setShowAppointmentModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F0F5F2',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4B5563'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#E8F5EE',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#11322A', margin: 0 }}>
                  {t('modal_appointment_title')}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                  {t('modal_token')}
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAF9', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #E2ECE5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_facility')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{currentVillage} {t('modal_phc_suffix')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_doctor')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{t('modal_doctor_val')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_scheduled_date')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{t('modal_scheduled_date_val')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_opd_slot')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>{t('modal_opd_slot_val')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  onOpenTelemed();
                }}
                style={{
                  background: '#173D35',
                  color: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Video size={16} />
                <span>{t('modal_switch_telemed')}</span>
              </button>

              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setActiveTab('book-appointment');
                }}
                style={{
                  background: '#FFFFFF',
                  color: '#173D35',
                  border: '1px solid #BFD9CB',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {t('modal_reschedule')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Iron Therapy / Follow-Up Modal */}
      {showFollowUpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 34, 25, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            border: '1px solid #E2EAE5'
          }}>
            <button
              onClick={() => setShowFollowUpModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F0F5F2',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4B5563'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Pill size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#11322A', margin: 0 }}>
                  {t('modal_iron_title')}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 600 }}>
                  {t('modal_iron_subtitle')}
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAF9', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #E2ECE5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_iron_hb')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>{t('modal_iron_hb_val')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_iron_dose')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{t('modal_iron_dose_val')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{t('modal_iron_tip')}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534' }}>{t('modal_iron_tip_val')}</span>
              </div>
            </div>

            <div style={{
              background: ifaDoseLogged ? '#E8F5EE' : '#F0F5F2',
              borderRadius: '14px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#11322A' }}>
                  {ifaDoseLogged ? t('modal_iron_logged') : t('modal_iron_log_btn')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52786D' }}>
                  {ifaDoseLogged ? t('modal_iron_asha_note') : t('modal_iron_prompt')}
                </div>
              </div>

              {!ifaDoseLogged ? (
                <button
                  onClick={handleLogDose}
                  style={{
                    background: '#173D35',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('modal_iron_log_btn')}
                </button>
              ) : (
                <div style={{ background: '#10B981', color: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {t('modal_iron_completed')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowFollowUpModal(false);
                  setActiveTab('screening');
                }}
                style={{
                  flex: 1,
                  background: '#173D35',
                  color: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {t('modal_iron_recheck')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
