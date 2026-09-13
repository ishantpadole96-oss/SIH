/**
 * RuralCare AI Health Screening & Clinical Decision Support Service
 * 
 * DISCLAIMER:
 * RuralCare AI Health Screening is an intelligent clinical decision support system
 * designed for triage and informational guidance in rural areas.
 * It is NOT a certified medical diagnosis and never replaces a registered medical practitioner.
 */

const CLINICAL_DISCLAIMER = 
  "RuralCare AI Screening is a clinical decision support tool designed for triage guidance and NOT a certified medical diagnosis. Always consult a qualified medical professional. In case of severe symptoms, visit the nearest emergency facility or call 108 immediately.";

/**
 * Perform comprehensive health screening based on symptoms and vitals
 */
function screenPatient(screeningData) {
  const {
    symptoms = [],
    duration_days = 1,
    severity = 'Moderate',
    vitals = {},
    age = 30,
    gender = 'Other',
    existing_conditions = ''
  } = screeningData;

  const symList = symptoms.map(s => s.toLowerCase());
  const conditionsLower = (existing_conditions || '').toLowerCase();

  let riskLevel = 'Low';
  let redFlags = [];
  let possibleConditions = [];
  let recommendation = '';
  let consultationRecommended = 0;
  let urgency = 'Self-care & Observation';
  let requiredFacilityType = 'PHC';

  // 1. Vital Signs Red-Flag Checks
  const temp = parseFloat(vitals.temperature || vitals.temp) || 98.6;
  const sysBP = parseFloat(vitals.systolic_bp || (vitals.bp ? vitals.bp.split('/')[0] : 120)) || 120;
  const diaBP = parseFloat(vitals.diastolic_bp || (vitals.bp ? vitals.bp.split('/')[1] : 80)) || 80;
  const spo2 = parseFloat(vitals.spo2) || 98;
  const sugar = parseFloat(vitals.blood_sugar || vitals.sugar) || 100;
  const heartRate = parseFloat(vitals.heart_rate || vitals.pulse) || 75;

  // Oxygen Saturation (SpO2)
  if (spo2 < 92) {
    riskLevel = 'Emergency';
    redFlags.push(`Critical Hypoxemia (SpO₂ ${spo2}% < 92%): severe respiratory compromise detected`);
    requiredFacilityType = 'Sub-District Hospital';
  } else if (spo2 <= 94) {
    if (riskLevel !== 'Emergency') riskLevel = 'High';
    redFlags.push(`Hypoxemia Alert (SpO₂ ${spo2}%): low oxygen saturation`);
    if (requiredFacilityType === 'PHC') requiredFacilityType = 'CHC';
  }

  // Blood Pressure
  if (sysBP >= 180 || diaBP >= 120) {
    riskLevel = 'Emergency';
    redFlags.push(`Hypertensive Crisis (BP ${sysBP}/${diaBP} mmHg): risk of target organ damage`);
    requiredFacilityType = 'Sub-District Hospital';
  } else if (sysBP >= 140 || diaBP >= 90) {
    if (riskLevel === 'Low') riskLevel = 'Moderate';
    redFlags.push(`Elevated Blood Pressure (BP ${sysBP}/${diaBP} mmHg): Stage 2 Hypertension`);
  }

  // Blood Glucose
  if (sugar >= 350) {
    riskLevel = 'Emergency';
    redFlags.push(`Severe Hyperglycemia (Sugar ${sugar} mg/dL): risk of Diabetic Ketoacidosis`);
    requiredFacilityType = 'CHC';
  } else if (sugar <= 55 && sugar > 0) {
    riskLevel = 'Emergency';
    redFlags.push(`Severe Hypoglycemia (Sugar ${sugar} mg/dL): immediate glucose required`);
  } else if (sugar >= 200) {
    if (riskLevel === 'Low') riskLevel = 'Moderate';
    redFlags.push(`Elevated Blood Glucose (${sugar} mg/dL)`);
  }

  // Body Temperature
  if (temp >= 103.0) {
    if (riskLevel !== 'Emergency') riskLevel = 'High';
    redFlags.push(`Severe Pyrexia (${temp}°F): high risk of febrile complications`);
  } else if (temp >= 100.4) {
    if (riskLevel === 'Low') riskLevel = 'Moderate';
  }

  // 2. Symptom Clustering & Emergency Syndrome Detection

  // Cardiovascular / Coronary Syndrome
  const hasChestPain = symList.some(s => s.includes('chest pain') || s.includes('chest pressure') || s.includes('chest tightness'));
  const hasSweating = symList.some(s => s.includes('sweat') || s.includes('perspiration') || s.includes('cold sweat'));
  const hasArmPain = symList.some(s => s.includes('left arm') || s.includes('arm pain') || s.includes('jaw pain') || s.includes('numbness'));
  const hasShortnessOfBreath = symList.some(s => s.includes('breath') || s.includes('dyspnea') || s.includes('gasping'));

  if (hasChestPain && (hasSweating || hasArmPain || hasShortnessOfBreath || age >= 40)) {
    riskLevel = 'Emergency';
    redFlags.push('Cardiovascular Red Flag: Symptoms characteristic of Acute Coronary Syndrome (Heart Attack)');
    possibleConditions.push('Acute Coronary Syndrome (Myocardial Infarction)', 'Angina Pectoris');
    requiredFacilityType = 'Sub-District Hospital';
  }

  // Neurological / Stroke
  const hasFacialDroop = symList.some(s => s.includes('face') || s.includes('droop') || s.includes('speech') || s.includes('paralysis') || s.includes('slurred'));
  if (hasFacialDroop) {
    riskLevel = 'Emergency';
    redFlags.push('Neurological Red Flag: Potential Acute Cerebrovascular Event (Stroke)');
    possibleConditions.push('Acute Ischemic Stroke', 'Transient Ischemic Attack');
    requiredFacilityType = 'Sub-District Hospital';
  }

  // Respiratory Infections
  const hasCough = symList.some(s => s.includes('cough') || s.includes('phlegm') || s.includes('sputum'));
  const hasFever = temp >= 100.4 || symList.some(s => s.includes('fever') || s.includes('chills'));

  if (hasCough && hasFever && hasShortnessOfBreath) {
    if (riskLevel !== 'Emergency') riskLevel = 'High';
    possibleConditions.push('Lower Respiratory Tract Infection (Pneumonia)', 'Acute Bronchitis', 'Severe Viral Pyrexia');
    if (requiredFacilityType === 'PHC') requiredFacilityType = 'CHC';
  } else if (hasCough && hasFever) {
    if (riskLevel === 'Low') riskLevel = 'Moderate';
    possibleConditions.push('Viral Upper Respiratory Infection', 'Influenza / Seasonal Flu');
  }

  // Gastrointestinal / Dehydration
  const hasDiarrhea = symList.some(s => s.includes('diarrhea') || s.includes('loose stool') || s.includes('loose motion'));
  const hasVomiting = symList.some(s => s.includes('vomit') || s.includes('nausea'));
  const hasAbdominalPain = symList.some(s => s.includes('stomach') || s.includes('abdominal pain') || s.includes('cramps'));

  if (hasDiarrhea && hasVomiting) {
    if (duration_days >= 3 || severity === 'Severe' || age <= 5 || age >= 65) {
      if (riskLevel !== 'Emergency') riskLevel = 'High';
      redFlags.push('Dehydration Alert: Multiple episodes of loose stool with vomiting');
      possibleConditions.push('Acute Gastroenteritis with Moderate Dehydration', 'Food-borne Enteric Infection');
    } else {
      if (riskLevel === 'Low') riskLevel = 'Moderate';
      possibleConditions.push('Acute Gastroenteritis (Mild/Moderate)', 'Viral Enteritis');
    }
  } else if (hasAbdominalPain && severity === 'Severe') {
    if (riskLevel !== 'Emergency') riskLevel = 'High';
    possibleConditions.push('Acute Abdomen (Appendicitis / Cholecystitis / Colic)');
    requiredFacilityType = 'CHC';
  }

  // Maternal & Pregnancy Considerations
  const isPregnant = conditionsLower.includes('pregnan') || conditionsLower.includes('trimester') || conditionsLower.includes('anc');
  if (isPregnant) {
    const hasBleeding = symList.some(s => s.includes('bleeding') || s.includes('spotting') || s.includes('pelvic pain'));
    if (hasBleeding || sysBP >= 140) {
      riskLevel = 'Emergency';
      redFlags.push('Obstetric Red Flag: Elevated BP or bleeding during pregnancy (Risk of Preeclampsia)');
      possibleConditions.push('Preeclampsia / Pregnancy Induced Hypertension', 'Obstetric Hemorrhage Risk');
      requiredFacilityType = 'CHC';
    } else {
      possibleConditions.push('Antenatal Health Evaluation');
    }
  }

  // Fallback conditions if none matched specifically
  if (possibleConditions.length === 0) {
    if (hasFever) {
      possibleConditions.push('Acute Febrile Illness (Viral / Malaria / Dengue screen recommended)');
    } else if (hasCough) {
      possibleConditions.push('Allergic Bronchospasm', 'Common Cold');
    } else if (hasAbdominalPain) {
      possibleConditions.push('Dyspepsia / Acid Peptic Disease');
    } else {
      possibleConditions.push('General Malaise / Fatigue / Non-Specific Symptoms');
    }
  }

  // Determine urgency & consultation recommendations & 3-Tier Triage
  let triageCategory = 'Normal';
  let smartActions = [];
  let suggestedSpecialist = 'General Medicine';
  let suggestedTests = ['CBC (Complete Blood Count)', 'Basic Metabolic Panel'];

  if (isPregnant) {
    suggestedSpecialist = 'Gynecology & Obstetrics';
    suggestedTests = ['CBC', 'USG Pelvis / Obstetric Ultrasound', 'Urine Albumin'];
  } else if (hasChestPain || hasSweating || sysBP >= 160) {
    suggestedSpecialist = 'Cardiology & Emergency Medicine';
    suggestedTests = ['12-Lead ECG', 'Troponin-I', 'Chest X-Ray', 'Lipid Profile'];
  } else if (age <= 12) {
    suggestedSpecialist = 'Pediatrics';
    suggestedTests = ['Pediatric Hemogram', 'Urine Routine', 'Hydration Evaluation'];
  } else if (hasDiarrhea || hasVomiting) {
    suggestedSpecialist = 'Gastroenterology / Internal Medicine';
    suggestedTests = ['Serum Electrolytes', 'Stool Routine', 'CBC'];
  }

  if (riskLevel === 'Emergency' || riskLevel === 'High') {
    triageCategory = 'High Risk';
    consultationRecommended = 1;
    urgency = riskLevel === 'Emergency' 
      ? 'IMMEDIATE EMERGENCY: Seek medical care within 1 hour'
      : 'Urgent Evaluation: Visit higher facility within 12-24 hours';
    
    recommendation = `CRITICAL DECISION SUPPORT: High-priority clinical red flags detected (${redFlags.length > 0 ? redFlags.join('; ') : 'Severe acute symptoms'}). Immediate referral to higher facility (${requiredFacilityType} or District Hospital) advised. Prepare patient stabilization.`;
    
    smartActions = [
      'Immediate medical evaluation recommended at secondary/tertiary facility.',
      'Notify supervising Medical Officer / ASHA supervisor immediately.',
      'Prepare urgent smart referral with pre-booked queue ticket.',
      'If SpO2 < 92% or BP >= 180/120, dispatch 108 emergency ambulance.'
    ];
  } else if (riskLevel === 'Moderate') {
    triageCategory = 'Needs Doctor';
    consultationRecommended = 1;
    urgency = 'Doctor Consultation: Schedule teleconsultation or PHC OPD within 24-48 hours';
    recommendation = `Moderate symptoms identified. Patient requires medical evaluation by a Medical Officer via Teleconsultation or at the local Primary Health Centre (PHC).`;
    smartActions = [
      'Connect patient with Medical Officer via Teleconsultation Hub.',
      'Schedule OPD appointment at nearest PHC.',
      'Provide basic oral rehydration or symptom relief as per ASHA kit protocol.',
      'Re-evaluate vitals if symptoms persist past 48 hours.'
    ];
  } else {
    triageCategory = 'Normal';
    consultationRecommended = 0;
    urgency = 'Self-care & Village Follow-up (48-72 hours)';
    recommendation = `Vitals and symptoms are in the safe normal baseline. No emergency escalation required. Provide village-level guidance and routine follow-up.`;
    smartActions = [
      'Administer local village-level first aid / symptomatic care.',
      'Counsel on hydration, nutrition, and rest.',
      'ASHA worker to conduct routine 72-hour follow-up check.',
      'Escalate if temperature rises above 101°F or new red flags develop.'
    ];
  }

  return {
    ai_risk_level: riskLevel,
    triage_category: triageCategory,
    red_flags: redFlags,
    possible_conditions: possibleConditions,
    recommendation: recommendation,
    consultation_recommended: consultationRecommended,
    urgency: urgency,
    required_facility_type: requiredFacilityType,
    smart_actions: smartActions,
    smart_referral_suggestion: {
      specialist: suggestedSpecialist,
      required_tests: suggestedTests.join(', '),
      urgency: triageCategory === 'High Risk' ? '🔴 Urgent' : '🟡 Routine',
      triage_color: triageCategory === 'High Risk' ? '#EF4444' : triageCategory === 'Needs Doctor' ? '#F59E0B' : '#10B981'
    },
    vitals_evaluated: {
      temperature: `${temp}°F`,
      blood_pressure: `${sysBP}/${diaBP} mmHg`,
      oxygen_saturation: `${spo2}%`,
      blood_sugar: `${sugar} mg/dL`,
      heart_rate: `${heartRate} bpm`
    },
    disclaimer: CLINICAL_DISCLAIMER
  };
}

module.exports = {
  CLINICAL_DISCLAIMER,
  screenPatient
};
