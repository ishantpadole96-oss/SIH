// Comprehensive fallback translation dictionary for DOM-level real-time localization
// Ensures ZERO English words leak through when language is Hindi ('hi') or Marathi ('mr')

export const domDictionary = [
  // Multi-word phrases first (to prevent partial matches)
  {
    en: "Guest Citizen",
    hi: "अतिथि नागरिक",
    mr: "अतिथी नागरिक"
  },
  {
    en: "Good access",
    hi: "उत्कृष्ट पहुंच",
    mr: "उत्तम सुविधा"
  },
  {
    en: "Moderate access",
    hi: "मध्यम पहुंच",
    mr: "मध्यम सुविधा"
  },
  {
    en: "Epidemiological Disease Surveillance & Outbreak Radar",
    hi: "महामारी रोग निगरानी एवं प्रकोप रडार",
    mr: "साथरोग सनियंत्रण व उद्रेक रडार"
  },
  {
    en: "Integrated Disease Surveillance Programme (IDSP) • Syndromic Cluster Alerts",
    hi: "एकीकृत रोग निगरानी कार्यक्रम (आईडीएसपी) • सिंड्रोमिक क्लस्टर चेतावनी",
    mr: "एकात्मिक साथरोग सनियंत्रण कार्यक्रम (आयडीएसपी) • सिंड्रोमिक क्लस्टर इशारे"
  },
  {
    en: "Integrated Disease Surveillance Programme (IDSP)",
    hi: "एकीकृत रोग निगरानी कार्यक्रम (आईडीएसपी)",
    mr: "एकात्मिक साथरोग सनियंत्रण कार्यक्रम (आयडीएसपी)"
  },
  {
    en: "Syndromic Cluster Alerts",
    hi: "सिंड्रोमिक क्लस्टर चेतावनी",
    mr: "सिंड्रोमिक क्लस्टर इशारे"
  },
  {
    en: "Active Outbreaks",
    hi: "सक्रिय प्रकोप",
    mr: "सक्रिय उद्रेक"
  },
  {
    en: "Total Cases Reported",
    hi: "कुल दर्ज मामले",
    mr: "एकूण नोंदवलेली प्रकरणे"
  },
  {
    en: "Scanning district surveillance radar...",
    hi: "जिला निगरानी रडार स्कैन किया जा रहा है...",
    mr: "जिल्हा साथरोग रडार तपासत आहे..."
  },
  {
    en: "Severe/Outbreak",
    hi: "गंभीर / प्रकोप",
    mr: "गंभीर / उद्रेक"
  },
  {
    en: "Moderate/Cluster",
    hi: "मध्यम / क्लस्टर",
    mr: "मध्यम / क्लस्टर"
  },
  {
    en: "Vector-Borne",
    hi: "मच्छर व कीट जनित",
    mr: "कीटकजन्य आजार"
  },
  {
    en: "Water-Borne",
    hi: "जल जनित रोग",
    mr: "पाण्यामुळे होणारे आजार"
  },
  {
    en: "Respiratory",
    hi: "श्वसन रोग",
    mr: "श्वसन विकार"
  },
  {
    en: "Verified Cases",
    hi: "सत्यापित मामले",
    mr: "तपासलेली प्रकरणे"
  },
  {
    en: "Dengue & Vector-Borne Fever",
    hi: "डेंगू एवं मच्छर जनित बुखार",
    mr: "डेंग्यू व कीटकजन्य ताप"
  },
  {
    en: "Severe Acute Malnutrition (SAM)",
    hi: "गंभीर कुपोषण (एसएएम)",
    mr: "अति तीव्र कुपोषण (सॅम)"
  },
  {
    en: "Maternal & Child Health (MCH / RCH) Registry",
    hi: "मातृ एवं शिशु स्वास्थ्य (एमसीएच / आरसीएच) रजिस्टर",
    mr: "माता व बाल आरोग्य (एमसीएच / आरसीएच) नोंदवही"
  },
  {
    en: "Antenatal Care (ANC) tracking, High-Risk Pregnancy (HRP) surveillance, and Universal Immunization Programme (UIP)",
    hi: "प्रसवपूर्व देखभाल (एएनसी), उच्च-जोखिम गर्भावस्था (एचआरपी) और सार्वभौमिक टीकाकरण (यूआईपी)",
    mr: "प्रसूतीपूर्व तपासणी (एएनसी), अतिजोखमीची गर्भधारणा (एचआरपी) आणि सार्वत्रिक लसीकरण कार्यक्रम (यूआयपी)"
  },
  {
    en: "All Cohorts",
    hi: "सभी समूह",
    mr: "सर्व गट"
  },
  {
    en: "High-Risk Alert",
    hi: "उच्च जोखिम चेतावनी",
    mr: "अतिजोखमीचा इशारा"
  },
  {
    en: "Infant Immunizations",
    hi: "शिशु टीकाकरण",
    mr: "बालकांचे लसीकरण"
  },
  {
    en: "Loading MCH health registry...",
    hi: "मातृ एवं शिशु स्वास्थ्य रजिस्टर लोड हो रहा है...",
    mr: "माता-बाल आरोग्य नोंदवही लोड होत आहे..."
  },
  {
    en: "No records found for the selected filter.",
    hi: "चयनित फ़िल्टर हेतु कोई रिकॉर्ड नहीं मिला।",
    mr: "निवडलेल्या फिल्टरनुसार नोंदी उपलब्ध नाहीत."
  },
  {
    en: "Pregnant Mother",
    hi: "गर्भवती माता",
    mr: "गर्भवती माता"
  },
  {
    en: "Infant / Child",
    hi: "शिशु / बालक",
    mr: "शिशू / बाळ"
  },
  {
    en: "Infant/Child",
    hi: "शिशु / बालक",
    mr: "शिशू / बाळ"
  },
  {
    en: "Reported By:",
    hi: "द्वारा रिपोर्ट:",
    mr: "नोंदणीकर्ता:"
  },
  {
    en: "Action:",
    hi: "कार्रवाई:",
    mr: "कारवाई:"
  },
  {
    en: "Khedgaon Primary Health Centre",
    hi: "खेडगांव प्राथमिक स्वास्थ्य केंद्र",
    mr: "खेडगाव प्राथमिक आरोग्य केंद्र"
  },
  {
    en: "Primary Health Centre",
    hi: "प्राथमिक स्वास्थ्य केंद्र",
    mr: "प्राथमिक आरोग्य केंद्र"
  },
  {
    en: "Community Health Centre",
    hi: "सामुदायिक स्वास्थ्य केंद्र",
    mr: "सामुदायिक आरोग्य केंद्र"
  },
  {
    en: "Khed (Pune)",
    hi: "खेड (पुणे)",
    mr: "खेड (पुणे)"
  },
  {
    en: "Khedgaon",
    hi: "खेडगांव",
    mr: "खेडगाव"
  },
  {
    en: "Nashik & Dindori",
    hi: "नासिक व दिंडोरी",
    mr: "नाशिक व दिंडोरी"
  },
  {
    en: "Nashik",
    hi: "नासिक",
    mr: "नाशिक"
  },
  {
    en: "Dindori",
    hi: "दिंडोरी",
    mr: "दिंडोरी"
  },
  {
    en: "PUNE",
    hi: "पुणे",
    mr: "पुणे"
  },
  {
    en: "Pune",
    hi: "पुणे",
    mr: "पुणे"
  },
  {
    en: "RuralCare",
    hi: "रूरलकेयर",
    mr: "रूरलकेयर"
  },
  {
    en: "National Health Mission (NHM) Integrated Continuum",
    hi: "राष्ट्रीय स्वास्थ्य मिशन (एनएचएम) एकीकृत सेवा श्रृंखला",
    mr: "राष्ट्रीय आरोग्य अभियान (एनएचएम) एकात्मिक सेवा प्रणाली"
  },
  {
    en: "Maharashtra Public Health Department",
    hi: "सार्वजनिक स्वास्थ्य विभाग, महाराष्ट्र शासन",
    mr: "सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन"
  },
  {
    en: "Government of Maharashtra",
    hi: "महाराष्ट्र शासन",
    mr: "महाराष्ट्र शासन"
  },
  {
    en: "Public Health Department",
    hi: "सार्वजनिक स्वास्थ्य विभाग",
    mr: "सार्वजनिक आरोग्य विभाग"
  },
  {
    en: "Smart India Hackathon 2026",
    hi: "स्मार्ट इंडिया हैकाथॉन २०२६",
    mr: "स्मार्ट इंडिया हॅकाथॉन २०२६"
  },
  {
    en: "Smart India Hackathon",
    hi: "स्मार्ट इंडिया हैकाथॉन",
    mr: "स्मार्ट इंडिया हॅकाथॉन"
  },
  {
    en: "Connected Care Continuum",
    hi: "सुलभ व अखंड स्वास्थ्य सेवा तंत्र",
    mr: "सलग आरोग्य सेवा प्रणाली"
  },
  {
    en: "Connected Care, Closer",
    hi: "सुलभ व सतत ग्रामीण स्वास्थ्य सेवा",
    mr: "सुलभ व सलग ग्रामीण आरोग्य सेवा"
  },
  {
    en: "Connected care, closer",
    hi: "सुलभ व सतत ग्रामीण स्वास्थ्य सेवा",
    mr: "सुलभ व सलग ग्रामीण आरोग्य सेवा"
  },
  {
    en: "Maharashtra Government Healthcare Platform",
    hi: "महाराष्ट्र शासन सार्वजनिक स्वास्थ्य मंच",
    mr: "महाराष्ट्र शासन सार्वजनिक आरोग्य व्यासपीठ"
  },
  {
    en: "Maharashtra Government Public Healthcare Platform",
    hi: "महाराष्ट्र शासन सार्वजनिक स्वास्थ्य मंच",
    mr: "महाराष्ट्र शासन सार्वजनिक आरोग्य व्यासपीठ"
  },
  {
    en: "Return to Main Portal (Landing Page)",
    hi: "मुख्य पोर्टल (लैंडिंग पेज) पर वापस जाएं",
    mr: "मुख्य पोर्टल (लँडिंग पेज) वर परत जा"
  },
  {
    en: "Return to Main Portal",
    hi: "मुख्य पोर्टल पर वापस जाएं",
    mr: "मुख्य पोर्टल वर परत जा"
  },
  {
    en: "Toll-Free Emergency: 108 / 112",
    hi: "टोल-फ्री आपातकालीन: १०८ / ११२",
    mr: "टोल-फ्री आपत्कालीन: १०८ / ११२"
  },
  {
    en: "Toll-Free Emergency",
    hi: "टोल-फ्री आपातकालीन",
    mr: "टोल-फ्री आपत्कालीन"
  },
  {
    en: "Official Public Healthcare Services",
    hi: "आधिकारिक सार्वजनिक स्वास्थ्य सेवाएं",
    mr: "अधिकृत सार्वजनिक आरोग्य सेवा"
  },
  {
    en: "Explore digital health workflows designed for Maharashtra's rural citizens & frontline health workers",
    hi: "महाराष्ट्र के ग्रामीण नागरिकों और अग्रिम पंक्ति के स्वास्थ्य कार्यकर्ताओं के लिए डिजिटल स्वास्थ्य सेवाएं",
    mr: "महाराष्ट्रातील ग्रामीण नागरिक व आरोग्य सेविकांसाठी डिजिटल आरोग्य सुविधा"
  },
  {
    en: "Explore digital health workflows designed for Maharashtra's rural citizens & frontline health workers",
    hi: "महाराष्ट्र के ग्रामीण नागरिकों और अग्रिम पंक्ति के स्वास्थ्य कार्यकर्ताओं के लिए डिजिटल स्वास्थ्य सेवाएं",
    mr: "महाराष्ट्रातील ग्रामीण नागरिक व आरोग्य सेविकांसाठी डिजिटल आरोग्य सुविधा"
  },
  {
    en: "Explore digital health workflows designed for Maharashtra's rural citizens & frontline health workers",
    hi: "महाराष्ट्र के ग्रामीण नागरिकों और अग्रिम पंक्ति के स्वास्थ्य कार्यकर्ताओं के लिए डिजिटल स्वास्थ्य सेवाएं",
    mr: "महाराष्ट्रातील ग्रामीण नागरिक व आरोग्य सेविकांसाठी डिजिटल आरोग्य सुविधा"
  },
  {
    en: "PUBLIC HEALTHCARE MODULES",
    hi: "सार्वजनिक स्वास्थ्य सेवाएं",
    mr: "सार्वजनिक आरोग्य सेवा"
  },
  {
    en: "Public Healthcare Modules",
    hi: "सार्वजनिक स्वास्थ्य सेवाएं",
    mr: "सार्वजनिक आरोग्य सेवा"
  },
  {
    en: "Community Surveillance & Maternal Health",
    hi: "सामुदायिक रोग निगरानी व मातृ स्वास्थ्य",
    mr: "सामुदायिक आरोग्य सनियंत्रण व माता आरोग्य"
  },
  {
    en: "DISTRICT CLINICAL EPIDEMIOLOGY & MCH",
    hi: "जिला क्लीनिकल महामारी विज्ञान व मातृ-शिशु स्वास्थ्य",
    mr: "जिल्हा साथरोग व माता-बाल आरोग्य"
  },
  {
    en: "Disease Outbreak Radar",
    hi: "रोग प्रकोप निगरानी रडार",
    mr: "साथरोग उद्रेक रडार"
  },
  {
    en: "Maternal & Child Health",
    hi: "मातृ एवं शिशु स्वास्थ्य",
    mr: "माता व बाल आरोग्य"
  },
  {
    en: "Maharashtra 24x7 Emergency Public Healthcare Helplines",
    hi: "महाराष्ट्र २४x७ आपातकालीन सार्वजनिक स्वास्थ्य हेल्पलाइन",
    mr: "महाराष्ट्र २४x७ आपत्कालीन शासकीय आरोग्य हेल्पलाईन"
  },
  {
    en: "GPS-tracked ambulance dispatch and emergency triage for all 36 districts",
    hi: "सभी ३६ जिलों के लिए जीपीएस-ट्रैक युक्त एम्बुलेंस और आपातकालीन सहायता",
    mr: "सर्व ३६ जिल्ह्यांसाठी जीपीएस-ट्रॅक रुग्णवाहिका व तातडीची मदत"
  },
  {
    en: "108 Ambulance",
    hi: "१०८ एम्बुलेंस",
    mr: "१०८ रुग्णवाहिका"
  },
  {
    en: "104 Health Helpline",
    hi: "१०४ स्वास्थ्य हेल्पलाइन",
    mr: "१०४ आरोग्य हेल्पलाईन"
  },
  {
    en: "102 Matritva Vahan",
    hi: "१०२ मातृत्व वाहन",
    mr: "१०२ मातृत्व वाहन"
  },
  {
    en: "1-Click Quick Evaluator Switch",
    hi: "१-क्लिक त्वरित डेमो स्विच",
    mr: "१-क्लिक त्वरित डेमो स्विच"
  },
  {
    en: "Appointment Details",
    hi: "अपॉइंटमेंट विवरण",
    mr: "अपॉइंटमेंट तपशील"
  },
  {
    en: "Switch to Live Teleconsultation",
    hi: "लाइव टेलीमेडिसिन पर जाएं",
    mr: "थेट व्हिडिओ तपासणीकडे जा"
  },
  {
    en: "Reschedule or Change Slot",
    hi: "समय बदलें या पुनर्निर्धारित करें",
    mr: "वेळ बदला किंवा पुढे ढकला"
  },
  {
    en: "Iron Therapy & Vitals Protocol",
    hi: "आयरन थेरेपी एवं वाइटल्स प्रोटोकॉल",
    mr: "लोहयुक्त गोळ्या व तपासणी नियम"
  },
  {
    en: "Active Care Plan · Maternal Anemia Care",
    hi: "सक्रिय स्वास्थ्य योजना · मातृ एनीमिया उपचार",
    mr: "सक्रिय काळजी योजना · माता ॲनिमिया उपचार"
  },
  {
    en: "Current Hemoglobin:",
    hi: "वर्तमान हीमोग्लोबिन:",
    mr: "सध्याचे हिमोग्लोबिन:"
  },
  {
    en: "Current Hemoglobin",
    hi: "वर्तमान हीमोग्लोबिन",
    mr: "सध्याचे हिमोग्लोबिन"
  },
  {
    en: "Prescribed Dose:",
    hi: "निर्धारित खुराक:",
    mr: "दिलेली गोळी:"
  },
  {
    en: "Prescribed Dose",
    hi: "निर्धारित खुराक",
    mr: "दिलेली गोळी"
  },
  {
    en: "Absorption Tip:",
    hi: "अवशोषण सलाह:",
    mr: "घेण्याची योग्य पद्धत:"
  },
  {
    en: "Absorption Tip",
    hi: "अवशोषण सलाह",
    mr: "घेण्याची योग्य पद्धत"
  },
  {
    en: "Log Today's IFA Tablet",
    hi: "आज की आईएफए गोली दर्ज करें",
    mr: "आजची आयएफए गोळी नोंदवा"
  },
  {
    en: "Today's Dose Logged",
    hi: "आज की खुराक दर्ज",
    mr: "आजची मात्रा नोंदवली"
  },
  {
    en: "Recorded for ASHA Worker Sunita",
    hi: "आशा कार्यकर्ता सुनीता हेतु दर्ज",
    mr: "आशा सेविका सुनिता यांच्यासाठी नोंदवले"
  },
  {
    en: "Tap button to register daily adherence",
    hi: "नियमितता दर्ज करने हेतु बटन दबाएं",
    mr: "नियमितता नोंदवण्यासाठी बटण दाबा"
  },
  {
    en: "Run AI Symptom Re-Check",
    hi: "एआई लक्षण पुनः जांचें",
    mr: "एआय लक्षणे पुन्हा तपासा"
  },
  {
    en: "AI Clinical Triage & Screening",
    hi: "एआई स्वास्थ्य जांच व ट्राइएज",
    mr: "एआय लक्षण तपासणी व सल्ला"
  },
  {
    en: "Interactive GIS Map",
    hi: "इंटरएक्टिव जीआईएस नक्शा",
    mr: "जीआयएस नकाशा"
  },
  {
    en: "Clinical Decision Support",
    hi: "क्लीनिकल निर्णय सहायता",
    mr: "वैद्यकीय निर्णय साहाय्य"
  },
  {
    en: "Real-Time Census",
    hi: "लाइव बिस्तर गणना",
    mr: "थेट खाटांची नोंद"
  },
  {
    en: "Offline Digital Sync",
    hi: "ऑफलाइन डिजिटल सिंक",
    mr: "ऑफलाइन डिजिटल सिंक"
  },
  {
    en: "National Portability",
    hi: "राष्ट्रीय पोर्टेबिलिटी",
    mr: "राष्ट्रीय पोर्टेबिलिटी"
  },
  {
    en: "Zero Cost Video OPD",
    hi: "निःशुल्क वीडियो ओपीडी",
    mr: "मोफत व्हिडिओ ओपीडी"
  },
  {
    en: "Find Healthcare Near You",
    hi: "नजदीकी स्वास्थ्य केंद्र खोजें",
    mr: "जवळचे आरोग्य केंद्र शोधा"
  },
  {
    en: "Hospital Availability Census",
    hi: "अस्पताल बिस्तर व डॉक्टर उपलब्धता",
    mr: "रुग्णालय खाटा व डॉक्टर स्थिती"
  },
  {
    en: "Instant Digital Health Journey Card",
    hi: "त्वरित डिजिटल स्वास्थ्य जर्नी कार्ड",
    mr: "त्वरित डिजिटल आरोग्य जर्नी कार्ड"
  },
  {
    en: "Emergency 108 Rapid Escalation",
    hi: "आपातकालीन १०८ त्वरित सेवा",
    mr: "आपत्कालीन १०८ त्वरित मदत"
  },
  {
    en: "Government Generic Medicine Stocks",
    hi: "सरकारी जेनेरिक औषधि भंडार",
    mr: "शासकीय जेनेरिक औषध साठा"
  },
  {
    en: "Free Rural Health Camps",
    hi: "मुफ्त ग्रामीण स्वास्थ्य शिविर",
    mr: "मोफत ग्रामीण आरोग्य शिबिरे"
  },
  {
    en: "Citizen Grievances & Quality Desk",
    hi: "नागरिक शिकायत व गुणवत्ता निवारण",
    mr: "नागरिक तक्रार व गुणवत्ता कक्ष"
  },
  {
    en: "Maharashtra Health Map & Facilities",
    hi: "महाराष्ट्र स्वास्थ्य नक्शा व सुविधाएं",
    mr: "महाराष्ट्र आरोग्य नकाशा व केंद्रे"
  },
  {
    en: "Real-time disease surveillance & seasonal outbreak radar",
    hi: "रोग प्रकोप व मौसमी बीमारी चेतावनी रडार",
    mr: "साथरोग रडार व मोसमी आजार इशारा यंत्रणा"
  },
  {
    en: "Statewide vacant bed census & oxygen/ICU readiness",
    hi: "राज्यव्यापी खाली बिस्तर गणना और आईसीयू तत्परता",
    mr: "जिल्हाभरातील रिक्त खाटा व ऑक्सिजन/आयसीयू सज्जता"
  },
  {
    en: "108 Ambulance response time tracking and dispatch latency",
    hi: "१०८ एम्बुलेंस प्रतिक्रिया समय ट्रैकिंग",
    mr: "१०८ रुग्णवाहिका प्रतिसाद वेळ आणि नियंत्रण"
  },
  {
    en: "Citizen grievance escalation and resolution tracking",
    hi: "नागरिक शिकायत समाधान और गुणवत्ता निगरानी",
    mr: "नागरिक तक्रारींचे त्वरित निवारण व पाठपुरावा"
  },
  {
    en: "Launch Admin Command Centre",
    hi: "प्रशासन कमान खोलें",
    mr: "प्रशासन कमान सुरू करा"
  },
  {
    en: "Launch Doctor Portal",
    hi: "डॉक्टर ओपीडी खोलें",
    mr: "डॉक्टर ओपीडी सुरू करा"
  },
  {
    en: "Launch ASHA Portal",
    hi: "आशा पोर्टल खोलें",
    mr: "आशा पोर्टल सुरू करा"
  },
  {
    en: "Launch Citizen Portal",
    hi: "नागरिक पोर्टल खोलें",
    mr: "नागरिक पोर्टल सुरू करा"
  },
  {
    en: "ASHA Field Workspace",
    hi: "आशा कार्यकर्ता फील्ड वर्कस्पेस",
    mr: "आशा सेविका कार्यक्षेत्र"
  },
  {
    en: "6-Stage Referral Tracker",
    hi: "६-चरणीय रेफरल ट्रैकर",
    mr: "६-टप्प्यांची रेफरल प्रणाली"
  },
  {
    en: "Field Symptom Triage",
    hi: "फील्ड लक्षण जांच व ट्राइएज",
    mr: "क्षेत्रीय लक्षण तपासणी"
  },
  {
    en: "Nearby Referral Hospitals",
    hi: "नजदीकी रेफरल अस्पताल",
    mr: "जवळची रेफरल रुग्णालये"
  },
  {
    en: "Village Medicine Stocks",
    hi: "ग्राम औषधि भंडार",
    mr: "गाव औषध साठा"
  },
  {
    en: "Rural Health Camps",
    hi: "ग्रामीण स्वास्थ्य शिविर",
    mr: "ग्रामीण आरोग्य शिबिरे"
  },
  {
    en: "OPD Consultation Room",
    hi: "ओपीडी परामर्श कक्ष",
    mr: "ओपीडी सल्लागार कक्ष"
  },
  {
    en: "e-Sanjeevani Video OPD",
    hi: "ई-संजीवनी वीडियो ओपीडी",
    mr: "ई-संजीवनी व्हिडिओ ओपीडी"
  },
  {
    en: "Patient Medical History",
    hi: "मरीज का चिकित्सीय इतिहास",
    mr: "रुग्णाचा वैद्यकीय इतिहास"
  },
  {
    en: "Hospital Transfer Network",
    hi: "अस्पताल स्थानांतरण नेटवर्क",
    mr: "रुग्णालय हस्तांतरण जाळे"
  },
  {
    en: "Pharmacy Generic Inventory",
    hi: "फार्मेसी जेनेरिक औषधि भंडार",
    mr: "औषधालय जेनेरिक साठा"
  },
  {
    en: "Healthcare Bottlenecks",
    hi: "स्वास्थ्य सेवा बाधाएं व समस्याएं",
    mr: "आरोग्य सेवा अडथळे"
  },
  {
    en: "🚨 Healthcare Bottlenecks",
    hi: "🚨 स्वास्थ्य सेवा बाधाएं",
    mr: "🚨 आरोग्य सेवा अडथळे"
  },
  {
    en: "Rural GIS Health Map",
    hi: "ग्रामीण जीआईएस स्वास्थ्य नक्शा",
    mr: "ग्रामीण जीआयएस आरोग्य नकाशा"
  },
  {
    en: "Hospital Vacant Bed Census",
    hi: "अस्पताल खाली बिस्तर गणना",
    mr: "रुग्णालय रिक्त खाटांची नोंद"
  },
  {
    en: "District Grievance Redressal",
    hi: "जिला शिकायत निवारण केंद्र",
    mr: "जिल्हा तक्रार निवारण कक्ष"
  },
  {
    en: "ASHA Performance & Incentives",
    hi: "आशा प्रदर्शन एवं प्रोत्साहन",
    mr: "आशा कामगिरी व मानधन"
  },
  {
    en: "Maternal & Child Tracking (MCH)",
    hi: "मातृ एवं शिशु ट्रैकिंग (एमसीएच)",
    mr: "माता व बाल ट्रॅकिंग (एमसीएच)"
  },
  {
    en: "Camp & Outbreak Alerts",
    hi: "शिविर एवं महामारी चेतावनी",
    mr: "शिबीर व साथरोग सूचना"
  },
  {
    en: "Citizen Care Journey",
    hi: "नागरिक स्वास्थ्य जर्नी",
    mr: "नागरिक आरोग्य प्रवास"
  },
  {
    en: "Find Healthcare",
    hi: "स्वास्थ्य केंद्र खोजें",
    mr: "आरोग्य केंद्र शोधा"
  },
  {
    en: "Video Consultation",
    hi: "वीडियो परामर्श",
    mr: "व्हिडिओ सल्ला"
  },
  {
    en: "AI Health Screening",
    hi: "एआई स्वास्थ्य जांच",
    mr: "एआय आरोग्य तपासणी"
  },
  {
    en: "OPD Appointments",
    hi: "ओपीडी अपॉइंटमेंट",
    mr: "ओपीडी अपॉइंटमेंट"
  },
  {
    en: "Book Appointment",
    hi: "अपॉइंटमेंट बुक करें",
    mr: "अपॉइंटमेंट बुक करा"
  },
  {
    en: "Medicine Availability",
    hi: "दवाइयों की उपलब्धता",
    mr: "औषधांची उपलब्धता"
  },
  {
    en: "Health Camps",
    hi: "स्वास्थ्य शिविर",
    mr: "आरोग्य शिबिरे"
  },
  {
    en: "Health Records & QR",
    hi: "स्वास्थ्य रिकॉर्ड व क्यूआर",
    mr: "आरोग्य नोंदी व क्यूआर"
  },
  {
    en: "Grievances & Quality",
    hi: "शिकायतें व गुणवत्ता",
    mr: "तक्रारी व गुणवत्ता"
  },
  {
    en: "Rural Healthcare Map",
    hi: "ग्रामीण स्वास्थ्य नक्शा",
    mr: "ग्रामीण आरोग्य नकाशा"
  },
  {
    en: "Maharashtra Schemes",
    hi: "महाराष्ट्र शासन योजनाएं",
    mr: "महाराष्ट्र शासकीय योजना"
  },
  {
    en: "Emergency 108 Help",
    hi: "आपातकालीन १०८ सहायता",
    mr: "आपत्कालीन १०८ मदत"
  },
  {
    en: "Get Emergency Help →",
    hi: "आपातकालीन सहायता प्राप्त करें →",
    mr: "तात्काळ मदत मिळवा →"
  },
  {
    en: "Select District / Cluster",
    hi: "जिला / क्लस्टर चुनें",
    mr: "जिल्हा / क्लस्टर निवडा"
  },
  {
    en: "Select Your Village",
    hi: "अपना गांव चुनें",
    mr: "तुमचे गाव निवडा"
  },
  {
    en: "Current Village",
    hi: "वर्तमान गांव",
    mr: "सध्याचे गाव"
  },
  {
    en: "Scan Journey QR",
    hi: "जर्नी क्यूआर स्कैन करें",
    mr: "जर्नी क्यूआर स्कॅन करा"
  },
  {
    en: "Quick Demo Switcher",
    hi: "त्वरित डेमो स्विच",
    mr: "त्वरित डेमो स्विच"
  },
  {
    en: "Offline Mode (Local Storage)",
    hi: "ऑफलाइन मोड (स्थानीय स्टोरेज)",
    mr: "ऑफलाइन मोड (स्थानिक साठा)"
  },
  {
    en: "ACTIVE PANEL",
    hi: "सक्रिय पैनल",
    mr: "सक्रिय पॅनेल"
  },
  {
    en: "Switch ▼",
    hi: "बदलें ▼",
    mr: "बदला ▼"
  },
  {
    en: "VIEWING AS",
    hi: "के रूप में देख रहे हैं",
    mr: "पाहत आहात"
  },
  {
    en: "Sign Out",
    hi: "लॉग आउट",
    mr: "बाहेर पडा"
  },
  {
    en: "Sign In",
    hi: "लॉग इन",
    mr: "प्रवेश करा"
  },
  {
    en: "Sign In / Register",
    hi: "लॉग इन / पंजीकरण",
    mr: "लॉग इन / नोंदणी"
  },
  {
    en: "Role:",
    hi: "भूमिका:",
    mr: "भूमिका:"
  },
  {
    en: "Notifications",
    hi: "सूचनाएं",
    mr: "सूचना"
  },
  {
    en: "1 New",
    hi: "१ नई",
    mr: "१ नवीन"
  },
  {
    en: "ANC Check-up Tomorrow",
    hi: "कल प्रसवपूर्व (एएनसी) जांच",
    mr: "उद्या प्रसूतीपूर्व तपासणी"
  },
  {
    en: "Khedgaon PHC doctor consultation scheduled for 10:30 AM.",
    hi: "खेडगाव प्राथमिक स्वास्थ्य केंद्र में सुबह १०:३० बजे परामर्श निर्धारित।",
    mr: "खेडगाव प्राथमिक आरोग्य केंद्रात सकाळी १०:३० वाजता तपासणी."
  },
  {
    en: "High Risk",
    hi: "उच्च जोखिम",
    mr: "अति धोकादायक"
  },
  {
    en: "HIGH RISK",
    hi: "उच्च जोखिम",
    mr: "अति धोकादायक"
  },
  {
    en: "Moderate Risk",
    hi: "मध्यम जोखिम",
    mr: "मध्यम धोका"
  },
  {
    en: "Low Risk",
    hi: "कम जोखिम",
    mr: "कमी धोका"
  },
  {
    en: "Normal",
    hi: "सामान्य",
    mr: "सामान्य"
  },
  {
    en: "NORMAL",
    hi: "सामान्य",
    mr: "सामान्य"
  },
  {
    en: "Critical",
    hi: "गंभीर",
    mr: "गंभीर"
  },
  {
    en: "CRITICAL",
    hi: "गंभीर",
    mr: "गंभीर"
  },
  {
    en: "Urgent",
    hi: "अति-आवश्यक",
    mr: "तातडीचे"
  },
  {
    en: "URGENT",
    hi: "अति-आवश्यक",
    mr: "तातडीचे"
  },
  {
    en: "Emergency",
    hi: "आपातकालीन",
    mr: "आपत्कालीन"
  },
  {
    en: "EMERGENCY",
    hi: "आपातकालीन",
    mr: "आपत्कालीन"
  },
  {
    en: "Active",
    hi: "सक्रिय",
    mr: "सक्रिय"
  },
  {
    en: "Pending",
    hi: "लंबित",
    mr: "प्रलंबित"
  },
  {
    en: "PENDING",
    hi: "लंबित",
    mr: "प्रलंबित"
  },
  {
    en: "Confirmed",
    hi: "पुष्टीकृत",
    mr: "निश्चित"
  },
  {
    en: "CONFIRMED",
    hi: "पुष्टीकृत",
    mr: "निश्चित"
  },
  {
    en: "Completed",
    hi: "पूर्ण",
    mr: "पूर्ण"
  },
  {
    en: "COMPLETED",
    hi: "पूर्ण",
    mr: "पूर्ण"
  },
  {
    en: "Resolved",
    hi: "निवारित",
    mr: "निकाली काढले"
  },
  {
    en: "RESOLVED",
    hi: "निवारित",
    mr: "निकाली काढले"
  },
  {
    en: "Open Now",
    hi: "खुला है",
    mr: "सुरू आहे"
  },
  {
    en: "OPEN NOW",
    hi: "खुला है",
    mr: "सुरू आहे"
  },
  {
    en: "Closed",
    hi: "बंद है",
    mr: "बंद आहे"
  },
  {
    en: "CLOSED",
    hi: "बंद है",
    mr: "बंद आहे"
  },
  {
    en: "Available",
    hi: "उपलब्ध",
    mr: "उपलब्ध"
  },
  {
    en: "AVAILABLE",
    hi: "उपलब्ध",
    mr: "उपलब्ध"
  },
  {
    en: "Unavailable",
    hi: "अनुपलब्ध",
    mr: "अनुपलब्ध"
  },
  {
    en: "Doctors Available",
    hi: "उपलब्ध डॉक्टर",
    mr: "उपलब्ध डॉक्टर"
  },
  {
    en: "Beds Available",
    hi: "उपलब्ध बिस्तर",
    mr: "उपलब्ध खाटा"
  },
  {
    en: "Emergency 24x7",
    hi: "आपातकालीन २४x७",
    mr: "आपत्कालीन २४x७"
  },
  {
    en: "Medicines",
    hi: "दवाइयां",
    mr: "औषधे"
  },
  {
    en: "Rating",
    hi: "रेटिंग",
    mr: "गुणांकन"
  },
  {
    en: "Status",
    hi: "स्थिति",
    mr: "स्थिती"
  },
  {
    en: "Date",
    hi: "तिथि",
    mr: "तारीख"
  },
  {
    en: "Time",
    hi: "समय",
    mr: "वेळ"
  },
  {
    en: "Distance",
    hi: "दूरी",
    mr: "अंतर"
  },
  {
    en: "Location",
    hi: "स्थान",
    mr: "स्थान"
  },
  {
    en: "Search",
    hi: "खोजें",
    mr: "शोधा"
  },
  {
    en: "Filter",
    hi: "फ़िल्टर",
    mr: "फिल्टर"
  },
  {
    en: "Submit",
    hi: "जमा करें",
    mr: "सादर करा"
  },
  {
    en: "Cancel",
    hi: "रद्द करें",
    mr: "रद्द करा"
  },
  {
    en: "Close",
    hi: "बंद करें",
    mr: "बंद करा"
  },
  {
    en: "Back",
    hi: "वापस",
    mr: "मागे"
  },
  {
    en: "Next",
    hi: "आगे",
    mr: "पुढे"
  },
  {
    en: "Save",
    hi: "सुरक्षित करें",
    mr: "जतन करा"
  },
  {
    en: "Edit",
    hi: "संपादित करें",
    mr: "संपादित करा"
  },
  {
    en: "Delete",
    hi: "हटाएं",
    mr: "हटवा"
  },
  {
    en: "View Details",
    hi: "विवरण देखें",
    mr: "तपशील पहा"
  },
  {
    en: "Details",
    hi: "विवरण",
    mr: "तपशील"
  },
  {
    en: "Manage",
    hi: "प्रबंधन करें",
    mr: "व्यवस्थापित करा"
  },
  {
    en: "Change",
    hi: "बदलें",
    mr: "बदला"
  },
  {
    en: "Loading...",
    hi: "लोड हो रहा है...",
    mr: "लोड होत आहे..."
  },
  {
    en: "Explore Facilities",
    hi: "अस्पताल खोजें",
    mr: "केंद्रे शोधा"
  },
  {
    en: "Check Symptoms",
    hi: "जांच शुरू करें",
    mr: "लक्षणे तपासा"
  },
  {
    en: "Check Beds",
    hi: "बिस्तर देखें",
    mr: "खाटा तपासा"
  },
  {
    en: "Schedule OPD",
    hi: "ओपीडी समय तय करें",
    mr: "ओपीडी निश्चित करा"
  },
  {
    en: "Track Patient",
    hi: "मरीज को ट्रैक करें",
    mr: "रुग्णाचा माग घ्या"
  },
  {
    en: "View Timeline",
    hi: "इतिहास देखें",
    mr: "इतिहास पहा"
  },
  {
    en: "Get Emergency Help",
    hi: "आपातकालीन सहायता",
    mr: "तातडीची मदत"
  },
  {
    en: "Find Pharmacy",
    hi: "औषधि भंडार खोजें",
    mr: "औषधालय शोधा"
  },
  {
    en: "Register Camp",
    hi: "शिविर पंजीकरण",
    mr: "शिबीर नोंदणी"
  },
  {
    en: "Lodge Grievance",
    hi: "शिकायत दर्ज करें",
    mr: "तक्रार नोंदवा"
  },
  {
    en: "Open GIS Map",
    hi: "जीआईएस नक्शा खोलें",
    mr: "जीआयएस नकाशा उघडा"
  },
  {
    en: "Explore Schemes",
    hi: "योजनाएं देखें",
    mr: "योजना पहा"
  },
  {
    en: "Medical Officer",
    hi: "चिकित्सा अधिकारी",
    mr: "वैद्यकीय अधिकारी"
  },
  {
    en: "Doctor on Duty",
    hi: "ड्यूटी पर डॉक्टर",
    mr: "उपस्थित डॉक्टर"
  },
  {
    en: "Facility",
    hi: "स्वास्थ्य केंद्र",
    mr: "आरोग्य केंद्र"
  },
  {
    en: "Hospital",
    hi: "अस्पताल",
    mr: "रुग्णालय"
  },
  {
    en: "Hospitals",
    hi: "अस्पताल",
    mr: "रुग्णालये"
  },
  {
    en: "Citizen",
    hi: "नागरिक",
    mr: "नागरिक"
  },
  {
    en: "Patient",
    hi: "मरीज",
    mr: "रुग्ण"
  },
  {
    en: "Doctor",
    hi: "डॉक्टर",
    mr: "डॉक्टर"
  },
  {
    en: "Admin",
    hi: "प्रशासक",
    mr: "प्रशासक"
  },
  {
    en: "ASHA Worker",
    hi: "आशा कार्यकर्ता",
    mr: "आशा सेविका"
  },
  {
    en: "Village",
    hi: "गांव",
    mr: "गाव"
  },
  {
    en: "District",
    hi: "जिला",
    mr: "जिल्हा"
  },
  {
    en: "Cluster",
    hi: "क्लस्टर",
    mr: "क्लस्टर"
  },
  {
    en: "Today",
    hi: "आज",
    mr: "आज"
  },
  {
    en: "Tomorrow",
    hi: "कल",
    mr: "उद्या"
  },
  {
    en: "Yesterday",
    hi: "कल (बीता हुआ)",
    mr: "काल"
  },
  {
    en: "Monday",
    hi: "सोमवार",
    mr: "सोमवार"
  },
  {
    en: "Tuesday",
    hi: "मंगलवार",
    mr: "मंगळवार"
  },
  {
    en: "Wednesday",
    hi: "बुधवार",
    mr: "बुधवार"
  },
  {
    en: "Thursday",
    hi: "गुरुवार",
    mr: "गुरुवार"
  },
  {
    en: "Friday",
    hi: "शुक्रवार",
    mr: "शुक्रवार"
  },
  {
    en: "Saturday",
    hi: "शनिवार",
    mr: "शनिवार"
  },
  {
    en: "Sunday",
    hi: "रविवार",
    mr: "रविवार"
  },
  {
    en: "September",
    hi: "सितम्बर",
    mr: "सप्टेंबर"
  },
  {
    en: "October",
    hi: "अक्टूबर",
    mr: "ऑक्टोबर"
  },
  {
    en: "November",
    hi: "नवम्बर",
    mr: "नोव्हेंबर"
  },
  {
    en: "December",
    hi: "दिसम्बर",
    mr: "डिसेंबर"
  },
  {
    en: "January",
    hi: "जनवरी",
    mr: "जानेवारी"
  },
  {
    en: "February",
    hi: "फरवरी",
    mr: "फेब्रुवारी"
  },
  {
    en: "March",
    hi: "मार्च",
    mr: "मार्च"
  },
  {
    en: "April",
    hi: "अप्रैल",
    mr: "एप्रिल"
  },
  {
    en: "May",
    hi: "मई",
    mr: "मे"
  },
  {
    en: "June",
    hi: "जून",
    mr: "जून"
  },
  {
    en: "July",
    hi: "जुलाई",
    mr: "जुलै"
  },
  {
    en: "August",
    hi: "अगस्त",
    mr: "ऑगस्ट"
  },
  {
    en: "Sep",
    hi: "सित",
    mr: "सप्टें"
  },
  {
    en: "Oct",
    hi: "अक्टू",
    mr: "ऑक्टो"
  },
  {
    en: "Nov",
    hi: "नव",
    mr: "नोव्हे"
  },
  {
    en: "Dec",
    hi: "दिस",
    mr: "डिसें"
  },
  {
    en: "Jan",
    hi: "जन",
    mr: "जाने"
  },
  {
    en: "Feb",
    hi: "फर",
    mr: "फेब्रु"
  },
  {
    en: "Mar",
    hi: "मार्च",
    mr: "मार्च"
  },
  {
    en: "Apr",
    hi: "अप्रैल",
    mr: "एप्रिल"
  },
  {
    en: "Jun",
    hi: "जून",
    mr: "जून"
  },
  {
    en: "Jul",
    hi: "जुलाई",
    mr: "जुलै"
  },
  {
    en: "Aug",
    hi: "अग",
    mr: "ऑग"
  },
  {
    en: "PHC",
    hi: "प्रा.आ.के.",
    mr: "प्रा.आ.के."
  },
  {
    en: "CHC",
    hi: "सा.आ.के.",
    mr: "सा.आ.के."
  },
  {
    en: "Sub-Centre",
    hi: "उप-केंद्र",
    mr: "उप-केंद्र"
  },
  {
    en: "Sub-Centres",
    hi: "उप-केंद्र",
    mr: "उप-केंद्रे"
  },
  {
    en: "Civil Hospital",
    hi: "जिला सिविल अस्पताल",
    mr: "जिल्हा सामान्य रुग्णालय"
  },
  {
    en: "Rural Hospital",
    hi: "ग्रामीण अस्पताल",
    mr: "ग्रामीण रुग्णालय"
  },
  {
    en: "District Hospital",
    hi: "जिला अस्पताल",
    mr: "जिल्हा रुग्णालय"
  },
  {
    en: "General Medicine",
    hi: "सामान्य चिकित्सा",
    mr: "सामान्य औषधोपचार"
  },
  {
    en: "Pediatrics",
    hi: "बाल रोग विभाग",
    mr: "बालरोग विभाग"
  },
  {
    en: "Gynecology",
    hi: "स्त्री रोग व प्रसूती",
    mr: "स्त्रीरोग व प्रसूती"
  },
  {
    en: "Orthopedics",
    hi: "अस्थि रोग विभाग",
    mr: "अस्थिरोग विभाग"
  },
  {
    en: "Cardiology",
    hi: "हृदय रोग विभाग",
    mr: "हृदयरोग विभाग"
  },
  {
    en: "Dentistry",
    hi: "दंत चिकित्सा विभाग",
    mr: "दंतवैद्यकीय विभाग"
  },
  {
    en: "Ayush",
    hi: "आयुष विभाग",
    mr: "आयुष विभाग"
  }
];

// Helper to translate any plain text string based on current language
export function translateText(text, lang) {
  if (!text || lang === 'en') return text;
  let translated = text;
  for (const item of domDictionary) {
    if (translated.includes(item.en)) {
      const replacement = item[lang] || item.hi;
      translated = translated.split(item.en).join(replacement);
    }
  }
  return translated;
}
