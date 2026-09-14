import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Download, Smartphone, ShieldCheck, WifiOff, PhoneCall, 
  Video, CheckCircle2, X, ExternalLink, ArrowDownToLine 
} from 'lucide-react';

export function DownloadAppModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDownloadTriggered(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloadTriggered(true);
    const link = document.createElement('a');
    link.href = '/ruralcare.apk';
    link.setAttribute('download', 'ruralcare.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copy = {
    en: {
      title: 'RuralCare for Android',
      subtitle: 'Official Android WebView App for Citizens, ASHAs, and Doctors across Maharashtra.',
      btn_download: 'Download APK (v2.0.0)',
      btn_downloading: 'Downloading APK...',
      direct_hint: 'Download not starting? Click here',
      features_heading: 'Key Mobile Features',
      f1_title: '1-Tap 108 Emergency Dial',
      f1_desc: 'Instantly connects to ambulance dispatchers even on 2G.',
      f2_title: 'Offline-Ready Health Records',
      f2_desc: 'Cache digital cards & sync automatically when network returns.',
      f3_title: 'Telemedicine & AI Screening',
      f3_desc: 'WebRTC video room & camera symptom analysis.',
      f4_title: 'Ultra-Lightweight & Fast',
      f4_desc: 'Optimized for entry-level smartphones (Android 7.0+).',
      steps_heading: 'How to Install APK on Android',
      step1: 'Tap "Download APK" above to save ruralcare.apk.',
      step2: 'When prompted, allow "Install unknown apps" in Android settings.',
      step3: 'Open the downloaded file and tap "Install" to launch.',
      close: 'Close'
    },
    hi: {
      title: 'रूरलकेयर एंड्रॉइड ऐप',
      subtitle: 'महाराष्ट्र भर के नागरिकों, आशा कार्यकर्ताओं और डॉक्टरों के लिए आधिकारिक ऐप।',
      btn_download: 'APK डाउनलोड करें (v2.0.0)',
      btn_downloading: 'डाउनलोड हो रहा है...',
      direct_hint: 'डाउनलोड शुरू नहीं हुआ? यहाँ क्लिक करें',
      features_heading: 'मुख्य मोबाइल सुविधाएँ',
      f1_title: '1-टैप 108 आपातकालीन कॉल',
      f1_desc: '2G नेटवर्क पर भी एम्बुलेंस से तुरंत जुड़ें।',
      f2_title: 'ऑफलाइन स्वास्थ्य रिकॉर्ड',
      f2_desc: 'डिजिटल कार्ड सहेजें, नेटवर्क आते ही स्वतः सिंक।',
      f3_title: 'टेलीमेडिसिन एवं AI जांच',
      f3_desc: 'वीडियो परामर्श और कैमरा द्वारा लक्षण जांच।',
      f4_title: 'अति-हल्का और तेज़',
      f4_desc: 'किफ़ायती स्मार्टफोन (Android 7.0+) के लिए उपयुक्त।',
      steps_heading: 'एंड्रॉइड पर APK कैसे इंस्टॉल करें',
      step1: 'ऊपर "APK डाउनलोड करें" बटन दबाएं।',
      step2: 'यदि पूछा जाए, तो "Install unknown apps" की अनुमति दें।',
      step3: 'डाउनलोड की गई फ़ाइल खोलें और "Install" पर टैप करें।',
      close: 'बंद करें'
    },
    mr: {
      title: 'रुरलकेअर अँड्रॉइड ॲप',
      subtitle: 'महाराष्ट्रातील नागरिक, आशा सेविका आणि डॉक्टरांसाठी अधिकृत मोबाईल ॲप.',
      btn_download: 'APK डाऊनलोड करा (v2.0.0)',
      btn_downloading: 'डाऊनलोड सुरू आहे...',
      direct_hint: 'डाऊनलोड सुरू झाले नाही? येथे क्लिक करा',
      features_heading: 'प्रमुख मोबाईल वैशिष्ट्ये',
      f1_title: '१-टॅप १०८ आपत्कालीन कॉल',
      f1_desc: '२जी नेटवर्कवरही रुग्णवाहिका नियंत्रण कक्षाशी तात्काळ संपर्क.',
      f2_title: 'ऑफलाईन आरोग्य नोंदी',
      f2_desc: 'आरोग्य कार्ड जतन करा, नेटवर्क मिळताच आपोआप सिंक.',
      f3_title: 'टेलिमेडिसिन व AI तपासणी',
      f3_desc: 'व्हिडिओ सल्लामसलत आणि कॅमेरा लक्षण तपासणी.',
      f4_title: 'अतिशय हलके व वेगवान',
      f4_desc: 'साध्या स्मार्टफोन्ससाठी (Android 7.0+) विशेष तयार.',
      steps_heading: 'अँड्रॉइडवर ॲप कसे इन्स्टॉल करावे',
      step1: 'वरील "APK डाऊनलोड करा" बटणावर क्लिक करा.',
      step2: 'विचारल्यास, सेटिंग्जमध्ये "Install unknown apps" सक्षम करा.',
      step3: 'डाऊनलोड झालेली फाईल उघडून "Install" वर टॅप करा.',
      close: 'बंद करा'
    }
  };

  const text = copy[lang] || copy.en;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 34, 25, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(17, 50, 42, 0.35)',
          border: '1px solid #E2ECE5',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #11322A 0%, #195B48 100%)',
          padding: '1.75rem 2rem 1.5rem 2rem',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#FFFFFF',
              padding: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/ruralcare-mark.png" 
                alt="RuralCare App" 
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(45, 212, 191, 0.2)',
                color: '#A7DBBB',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                marginBottom: '0.3rem'
              }}>
                <Smartphone size={12} />
                <span>OFFICIAL ANDROID APP</span>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {text.title}
              </h2>
            </div>
          </div>

          <p style={{
            margin: '0.85rem 0 0 0',
            fontSize: '0.86rem',
            color: '#D1E7DD',
            lineHeight: 1.45
          }}>
            {text.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem 2rem' }}>
          
          {/* Main Download Action */}
          <div style={{
            background: '#F6FAF7',
            border: '1.5px solid #A7DBBB',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={handleDownload}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.95rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1.02rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'none'}
            >
              <ArrowDownToLine size={20} />
              <span>{downloadTriggered ? text.btn_downloading : text.btn_download}</span>
            </button>

            <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#52786D' }}>
              <a 
                href="/ruralcare.apk" 
                download="ruralcare.apk"
                style={{ color: '#0D9488', fontWeight: 600, textDecoration: 'underline' }}
              >
                {text.direct_hint}
              </a>
              <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
              <span>Android 7.0+ (Nougat to 15) • 5.9 MB</span>
            </div>
          </div>

          {/* Key Features Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#11322A',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {text.features_heading}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '12px',
                padding: '0.85rem',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#FEE2E2',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#DC2626',
                  flexShrink: 0
                }}>
                  <PhoneCall size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#11322A' }}>
                    {text.f1_title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                    {text.f1_desc}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '12px',
                padding: '0.85rem',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#E8F5EE',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#0D9488',
                  flexShrink: 0
                }}>
                  <WifiOff size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#11322A' }}>
                    {text.f2_title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                    {text.f2_desc}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '12px',
                padding: '0.85rem',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#EFF6FF',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#2563EB',
                  flexShrink: 0
                }}>
                  <Video size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#11322A' }}>
                    {text.f3_title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                    {text.f3_desc}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '12px',
                padding: '0.85rem',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#FEF3C7',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#D97706',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#11322A' }}>
                    {text.f4_title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                    {text.f4_desc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '1rem 1.25rem'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#374151',
              marginBottom: '0.6rem'
            }}>
              📱 {text.steps_heading}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.76rem', color: '#4B5563' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#E8F5EE',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  flexShrink: 0
                }}>1</span>
                <span>{text.step1}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#E8F5EE',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  flexShrink: 0
                }}>2</span>
                <span>{text.step2}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#E8F5EE',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  flexShrink: 0
                }}>3</span>
                <span>{text.step3}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
