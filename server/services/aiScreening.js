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

  // Determine urgency & consultation recommendations
  if (riskLevel === 'Emergency') {
    consultationRecommended = 1;
    urgency = 'IMMEDIATE EMERGENCY: Seek medical care within 1 hour';
    recommendation = `CRITICAL WARNING: High-priority symptoms or vital sign red flags detected (${redFlags.join('; ')}). Do NOT wait. Call 108 Emergency Ambulance or report directly to the nearest Hospital with Emergency/Trauma/ICU capabilities.`;
  } else if (riskLevel === 'High') {
    consultationRecommended = 1;
    urgency = 'Prompt Consultation: Visit doctor within 12-24 hours';
    recommendation = `High-risk indicators identified (${redFlags.length > 0 ? redFlags.join('; ') : 'Severe clinical presentation'}). You should be examined by a doctor at a Primary Health Centre (PHC) or Community Health Centre (CHC) today. Stay hydrated, avoid strenuous physical activity, and monitor breathing.`;
  } else if (riskLevel === 'Moderate') {
    consultationRecommended = 1;
    urgency = 'Routine Consultation: Visit clinic within 48 hours';
    recommendation = `Moderate symptoms present. Schedule a routine OPD consultation at your nearest PHC. Take plenty of warm fluids, rest, and follow basic symptom care. If symptoms worsen or fever exceeds 102°F, seek prompt medical attention.`;
  } else {
    consultationRecommended = 0;
    urgency = 'Self-care & Observation (48-72 hours)';
    recommendation = `Your reported vitals and symptoms are currently in the low-risk range. Practice adequate hydration, balanced diet, and rest. If symptoms persist for more than 3-4 days or new symptoms develop, consult your local ASHA worker or PHC doctor.`;
  }

  return {
    ai_risk_level: riskLevel,
    red_flags: redFlags,
    possible_conditions: possibleConditions,
    recommendation: recommendation,
    consultation_recommended: consultationRecommended,
    urgency: urgency,
    required_facility_type: requiredFacilityType,
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
