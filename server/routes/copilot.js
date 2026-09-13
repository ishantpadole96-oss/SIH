const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Knowledge Base of Approved Rural Clinical Decision Support Protocols (MoHFW & NHM Guidelines)
 */
const CLINICAL_PROTOCOLS = [
  {
    id: 'preeclampsia',
    triggers: ['pregnant', 'pregnancy', 'anc', 'trimester', 'bp', 'headache', 'swelling', 'blur', 'preeclampsia'],
    conditionCheck: (text, sysBP, diaBP) => {
      const isPregnant = /pregnant|pregnancy|anc|trimester|expecting/i.test(text);
      const highBP = (sysBP && sysBP >= 140) || (diaBP && diaBP >= 90) || /140|150|160|170|180|high bp|hypertension/i.test(text);
      return isPregnant && (highBP || /headache|swelling|blurred vision|epigastric/i.test(text));
    },
    triage_level: 'High Risk',
    color: '#EF4444',
    icon: 'AlertTriangle',
    diagnosis: 'Suspected Severe Preeclampsia / Gestational Hypertensive Crisis',
    actions: {
      en: [
        '🔴 Immediate medical evaluation recommended.',
        'Notify supervising Medical Officer and 108 emergency ambulance service.',
        'Place patient in left lateral tilt position to maintain placental perfusion.',
        'Do NOT administer oral fluids if convulsing or unconscious.',
        'Prepare urgent smart referral to District Hospital / FRU with Obstetrician and NICU.',
        'Ensure transport with accompanying health worker and emergency delivery kit.'
      ],
      hi: [
        '🔴 तत्काल चिकित्सीय मूल्यांकन की सिफारिश की जाती है।',
        'पर्यवेक्षी चिकित्सा अधिकारी और 108 एम्बुलेंस सेवा को तुरंत सूचित करें।',
        'गर्भवती महिला को बाईं करवट (left lateral position) लिटाएं।',
        'यदि ऐंठन या बेहोशी हो तो मुंह से कुछ भी न दें।',
        'जिला अस्पताल/FRU (स्त्री रोग विशेषज्ञ उपलब्ध) के लिए तत्काल स्मार्ट रेफरल तैयार करें।',
        'स्वास्थ्य कार्यकर्ता की देखरेख में तत्काल वाहन से रेफर करें।'
      ],
      mr: [
        '🔴 तातडीने वैद्यकीय तपासणीची शिफारस केली जाते.',
        'वैद्यकीय अधिकारी आणि १०८ रुग्णवाहिकेला तात्काळ माहिती द्या.',
        'गरोदर मातेला डाव्या कुशीवर झोपवा (रक्तप्रवाह सुरळीत राहण्यासाठी).',
        'रुग्ण बेशुद्ध किंवा झटके येत असल्यास तोंडाने काहीही देऊ नका.',
        'जिल्हा रुग्णालय / स्त्रीरोग तज्ज्ञ असलेल्या केंद्रात तातडीचे स्मार्ट रेफरल तयार करा.',
        'आरोग्य सेविकेच्या देखरेखीखाली तातडीने रुग्णालयात पोहोचवा.'
      ]
    },
    specialist: 'Gynecology & Obstetrics',
    tests: 'Urine Albumin (Dipstick), CBC, Platelet Count, Serum Creatinine, USG Obstetric Doppler',
    facility_type: 'District Hospital / Sub-District FRU'
  },
  {
    id: 'coronary_syndrome',
    triggers: ['chest pain', 'chest pressure', 'sweating', 'left arm', 'jaw pain', 'breathless', 'heart attack'],
    conditionCheck: (text) => /chest pain|chest pressure|heaviness|jaw pain|sweat|sweating|heart attack|myocardial/i.test(text),
    triage_level: 'High Risk',
    color: '#EF4444',
    icon: 'Flame',
    diagnosis: 'Suspected Acute Coronary Syndrome (Myocardial Infarction / Angina)',
    actions: {
      en: [
        '🔴 Immediate emergency referral and 108 Ambulance dispatch required.',
        'Keep patient sitting upright, calm, and minimize all physical exertion.',
        'Administer dispersible Aspirin 300mg as per standard first-responder protocol if conscious and non-allergic.',
        'If oxygen saturation < 94%, provide supplemental oxygen if available at Sub-Centre/PHC.',
        'Refer directly to District Hospital with ICU / Cath-lab facility.'
      ],
      hi: [
        '🔴 तत्काल आपातकालीन रेफरल और 108 एम्बुलेंस की आवश्यकता है।',
        'मरीज को शांत और आरामदायक बैठने की स्थिति में रखें, चलने-फिरने न दें।',
        'प्रोटोकॉल के अनुसार 300mg एस्पिरिन चबाने के लिए दें (यदि कोई एलर्जी न हो)।',
        'यदि ऑक्सीजन SpO₂ < 94% है तो तुरंत ऑक्सीजन सहायता प्रदान करें।',
        'आईसीयू/हृदयरोग सुविधा वाले जिला अस्पताल में तुरंत रेफर करें।'
      ],
      mr: [
        '🔴 तातडीचे आपत्कालीन रेफरल व १०८ रुग्णवाहिका बोलवा.',
        'रुग्णाला बसवून ठेवा, शांत ठेवा आणि हालचाल करू देऊ नका.',
        'मान्यताप्राप्त प्रोटोकॉलनुसार ३०० मि.ग्रॅ. एस्पिरिन चघळण्यास द्या (ॲलर्जी नसल्यास).',
        'ऑक्सिजन प्रमाण ९४% पेक्षा कमी असल्यास त्वरित ऑक्सिजन लावा.',
        'आयसीयू सुविधा असलेल्या जिल्हा शासकीय रुग्णालयात तात्काळ हलवा.'
      ]
    },
    specialist: 'Cardiology & Emergency Medicine',
    tests: '12-Lead ECG, Serum Troponin-I/T, CPK-MB, Chest X-Ray',
    facility_type: 'District Hospital / Cardiac Care Unit'
  },
  {
    id: 'pediatric_respiratory_diarrhea',
    triggers: ['child', 'baby', 'infant', 'vomiting', 'diarrhea', 'sunken eyes', 'fever', 'cough', 'fast breathing'],
    conditionCheck: (text) => /child|baby|infant|months|year old|kid/i.test(text) && /vomit|diarrhea|dehydrat|sunken|breath|fever/i.test(text),
    triage_level: 'Needs Doctor',
    color: '#F59E0B',
    icon: 'Baby',
    diagnosis: 'Pediatric Acute Illness (Gastroenteritis / Lower Respiratory Infection)',
    actions: {
      en: [
        '🟡 Prompt medical evaluation by Medical Officer recommended.',
        'Start Oral Rehydration Salts (ORS) solution immediately: 1 spoon every 2 minutes.',
        'Administer Zinc supplement 20mg (10mg if infant < 6 months).',
        'Check for danger signs: lethargy, inability to drink, persistent vomiting, chest indrawing.',
        'If danger signs present, escalate immediately to 🔴 High Risk referral.'
      ],
      hi: [
        '🟡 चिकित्सा अधिकारी द्वारा तत्काल जांच की सिफारिश की जाती है।',
        'तुरंत ओआरएस (ORS) घोल शुरू करें: हर 2 मिनट में एक चम्मच पिलाएं।',
        'जिंक की गोली (20mg, 6 माह से कम के लिए 10mg) पानी में घोलकर दें।',
        'खतरे के लक्षण जांचें: सुस्ती, दूध न पीना, लगातार उल्टी, पसलियों का चलना।',
        'यदि खतरे के लक्षण हों, तो तुरंत 🔴 हाई रिस्क रेफरल करें।'
      ],
      mr: [
        '🟡 वैद्यकीय अधिकाऱ्यांमार्फत तातडीची तपासणी आवश्यक.',
        'तातडीने ओआरएस (ORS) पाणी सुरू करा: दर २ मिनिटांनी एक चमचा पाजा.',
        'झिंक गोळी (२० मि.ग्रॅ., ६ महिन्यांखालील बाळासाठी १० मि.ग्रॅ.) पाण्यात विरघळवून द्या.',
        'धोक्याची चिन्हे तपासा: जास्त सुस्तपणा, पिण्यास नकार, बरगड्या ओढणे.',
        'धोक्याची चिन्हे आढळल्यास तात्काळ 🔴 उच्च जोखीम (High Risk) रेफरल करा.'
      ]
    },
    specialist: 'Pediatrics',
    tests: 'Pediatric Hemogram, Stool Examination, Serum Electrolytes',
    facility_type: 'PHC / Community Health Centre'
  }
];

/**
 * POST /api/copilot/evaluate
 * Smart Health Worker Copilot: Rule-based Clinical Decision Support Assistant
 */
router.post('/evaluate', authenticateToken, (req, res) => {
  try {
    const { query = '', symptoms = '', vitals = {}, language = 'en' } = req.body;
    const combinedText = `${query} ${symptoms}`.toLowerCase();

    const sysBP = parseFloat(vitals.systolic_bp || (vitals.bp ? vitals.bp.split('/')[0] : 0));
    const diaBP = parseFloat(vitals.diastolic_bp || (vitals.bp ? vitals.bp.split('/')[1] : 0));
    const spo2 = parseFloat(vitals.spo2 || 100);
    const temp = parseFloat(vitals.temperature || 98.6);

    // 1. Check against specific approved protocols
    let matchedProtocol = CLINICAL_PROTOCOLS.find(proto => proto.conditionCheck(combinedText, sysBP, diaBP));

    // 2. High risk vital sign override
    if (!matchedProtocol && (spo2 < 92 || sysBP >= 180 || diaBP >= 110 || temp >= 104)) {
      matchedProtocol = {
        id: 'critical_vitals',
        triage_level: 'High Risk',
        color: '#EF4444',
        diagnosis: `Critical Vitals Detected (SpO₂ ${spo2}%, BP ${sysBP}/${diaBP}, Temp ${temp}°F)`,
        actions: {
          en: [
            '🔴 High Risk alert: Vitals exceed safety baseline.',
            'Immediate doctor teleconsultation or emergency transport to Sub-District / District Hospital.',
            'Keep patient calm, monitor airways and breathing continuous check.',
            'Prepare smart referral package with vitals telemetry.'
          ],
          hi: [
            '🔴 उच्च जोखिम: वाइटल्स सामान्य सीमा से बहुत अधिक/कम हैं।',
            'तुरंत डॉक्टर से टेलीकंसल्टेशन करें या जिला अस्पताल के लिए वाहन प्रबंधित करें।',
            'मरीज को शांत रखें और सांस की निगरानी करें।',
            'वाइटल्स डेटा के साथ स्मार्ट रेफरल तैयार करें।'
          ],
          mr: [
            '🔴 उच्च जोखीम: शरीराचे निर्देशक (Vitals) धोक्याच्या पातळीवर आहेत.',
            'तातडीने डॉक्टरांशी टेलिकन्सल्टेशन करा किंवा रुग्णालयात पाठवा.',
            'रुग्णाला शांत ठेवा आणि श्वासोच्छ्वासावर लक्ष ठेवा.',
            'स्मार्ट रेफरल तयार करून वैद्यकीय मदत मिळवा.'
          ]
        },
        specialist: 'Internal Medicine / Emergency',
        tests: 'Emergency ECG, Complete Blood Profile, ABG (if SpO2 low)',
        facility_type: 'Community Health Centre / District Hospital'
      };
    }

    // 3. Fallback generic clinical decision guidance
    if (!matchedProtocol) {
      const isModerate = combinedText.includes('fever') || combinedText.includes('pain') || combinedText.includes('cough') || temp >= 100.4;
      matchedProtocol = {
        id: isModerate ? 'general_moderate' : 'general_mild',
        triage_level: isModerate ? 'Needs Doctor' : 'Normal',
        color: isModerate ? '#F59E0B' : '#10B981',
        diagnosis: isModerate ? 'Moderate Clinical Symptoms (Needs Medical Consultation)' : 'Mild Non-Urgent Presentation',
        actions: {
          en: isModerate ? [
            '🟡 Schedule OPD consultation at PHC or initiate Teleconsultation.',
            'Provide primary symptom relief as per ASHA protocol kit.',
            'Advise hydration and rest for 48 hours.',
            'Re-evaluate if condition deteriorates or high fever develops.'
          ] : [
            '🟢 Normal / Mild condition: Local village-level follow-up.',
            'Counsel patient on balanced diet, hydration, and hygiene.',
            'Advise routine 72-hour ASHA check-in.',
            'No higher hospital referral necessary at this time.'
          ],
          hi: isModerate ? [
            '🟡 प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से जांच या टेलीकंसल्टेशन कराएं।',
            'आशा किट के अनुसार प्राथमिक राहत दवाएं दें।',
            'भरपूर पानी पीने और 48 घंटे आराम करने की सलाह दें।',
            'यदि बुखार 102°F से ऊपर जाए तो तुरंत डॉक्टर को दिखाएं।'
          ] : [
            '🟢 सामान्य/हल्के लक्षण: ग्राम स्तर पर सामान्य देखभाल।',
            'संतुलित आहार, स्वच्छ पानी और आराम की सलाह दें।',
            'आशा कार्यकर्ता द्वारा 3 दिन बाद सामान्य फॉलो-अप।',
            'इस समय किसी बड़े अस्पताल रेफरल की आवश्यकता नहीं है।'
          ],
          mr: isModerate ? [
            '🟡 प्राथमिक आरोग्य केंद्रात (PHC) डॉक्टरांचा सल्ला घ्या किंवा टेलिकन्सल्टेशन करा.',
            'आशा किटमधील मान्यतेनुसार प्राथमिक उपचार द्या.',
            'भरपूर पाणी आणि विश्रांतीचा सल्ला द्या.',
            'त्रास वाढल्यास किंवा ताप वाढल्यास तातडीने दाखवा.'
          ] : [
            '🟢 सामान्य लक्षणे: स्थानिक पातळीवर साधी काळजी घ्या.',
            'संतुलित आहार, पाणी आणि स्वच्छतेचा सल्ला द्या.',
            'आशा सेविकेने ३ दिवसांनी पुन्हा भेट घ्यावी.',
            'सध्या मोठ्या रुग्णालयात जाण्याची गरज नाही.'
          ]
        },
        specialist: 'General Medicine (MBBS Medical Officer)',
        tests: 'Routine Hemogram, Urine Routine (if needed)',
        facility_type: 'Primary Health Centre (PHC)'
      };
    }

    return res.json({
      triage_level: matchedProtocol.triage_level,
      color: matchedProtocol.color,
      diagnosis: matchedProtocol.diagnosis,
      specialist_required: matchedProtocol.specialist,
      required_tests: matchedProtocol.tests,
      recommended_facility: matchedProtocol.facility_type,
      actions: matchedProtocol.actions,
      disclaimer: 'RuralCare Clinical Decision Support: Recommendations generated from standard MoHFW/NHM clinical guidelines for auxiliary rural healthcare workers. Not an autonomous medical diagnosis.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
