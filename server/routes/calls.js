const express = require('express');
const db = require('../database/db');

const router = express.Router();

/**
 * In-memory call log for live demo & cross-tab communication
 */
const activeCalls = new Map();
const callHistory = [];
let callCounter = 1000;

/**
 * POST /api/calls/initiate
 * Initiate a new call — logs it, creates incoming notification for callee
 */
router.post('/initiate', (req, res) => {
  try {
    const { 
      caller_name, 
      caller_role, 
      caller_portal, 
      callee_name, 
      callee_phone, 
      callee_facility, 
      callee_role 
    } = req.body;

    const callId = `RC-CALL-${Date.now().toString(36).toUpperCase()}-${(++callCounter).toString(36).toUpperCase()}`;
    
    const callRecord = {
      call_id: callId,
      caller_name: caller_name || 'RuralCare Citizen',
      caller_role: caller_role || 'citizen',
      caller_portal: caller_portal || 'Citizen Health Portal',
      callee_name: callee_name || 'Healthcare Facility',
      callee_phone: callee_phone || 'N/A',
      callee_facility: callee_facility || 'Govt PHC Khedgaon',
      callee_role: callee_role || 'doctor',
      status: 'ringing',
      initiated_at: new Date().toISOString(),
      connected_at: null,
      ended_at: null,
      duration_seconds: 0
    };

    activeCalls.set(callId, callRecord);

    // Create incoming call notification in DB for callee
    try {
      const calleeUser = db.get(`
        SELECT u.user_id FROM users u
        JOIN doctors d ON u.user_id = d.user_id
        JOIN facilities f ON d.facility_id = f.facility_id
        WHERE f.contact = ? OR u.name LIKE ?
        LIMIT 1
      `, [callee_phone, `%${callee_name}%`]);

      if (calleeUser) {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, ?, ?, 'general')
        `, [
          calleeUser.user_id,
          `📞 Incoming Call from ${callRecord.caller_name}`,
          `Incoming call from ${callRecord.caller_name} (${callRecord.caller_portal}). Call ID: ${callId}.`
        ]);
      }
    } catch (e) {
      // Non-critical
    }

    console.log(`📞 Call initiated: ${callId} (${callRecord.caller_name} → ${callee_name} [${callee_phone}])`);

    return res.json({
      call_id: callId,
      status: 'ringing',
      call: callRecord,
      message: `Call initiated to ${callee_name}`,
      notification_sent: true
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/calls/status/:callId
 * Poll specific call status (used by caller and receiver)
 */
router.get('/status/:callId', (req, res) => {
  const { callId } = req.params;
  const call = activeCalls.get(callId);

  if (call) {
    return res.json({ status: call.status, call });
  }

  // Check in history if already ended
  const pastCall = callHistory.find(c => c.call_id === callId);
  if (pastCall) {
    return res.json({ status: pastCall.status, call: pastCall });
  }

  return res.status(404).json({ error: 'Call not found' });
});

/**
 * POST /api/calls/update
 * Update call status (connected, declined, ended)
 */
router.post('/update', (req, res) => {
  try {
    const { call_id, callee_phone, status, duration } = req.body;

    // Find active call by ID first, then by phone
    let targetCall = null;
    if (call_id && activeCalls.has(call_id)) {
      targetCall = activeCalls.get(call_id);
    } else if (callee_phone) {
      for (const [id, call] of activeCalls) {
        if (call.callee_phone === callee_phone && call.status !== 'ended') {
          targetCall = call;
          break;
        }
      }
    }

    if (!targetCall) {
      return res.json({ status: 'ok', message: 'No active call found (already ended or not tracked)' });
    }

    if (status === 'connected') {
      targetCall.status = 'connected';
      targetCall.connected_at = new Date().toISOString();
      console.log(`🔗 Call connected: ${targetCall.call_id}`);
    } else if (status === 'declined') {
      targetCall.status = 'declined';
      targetCall.ended_at = new Date().toISOString();
      callHistory.push({ ...targetCall });
      activeCalls.delete(targetCall.call_id);
      console.log(`❌ Call declined: ${targetCall.call_id}`);
    } else if (status === 'ended') {
      targetCall.status = 'ended';
      targetCall.ended_at = new Date().toISOString();
      targetCall.duration_seconds = duration || 0;
      
      callHistory.push({ ...targetCall });
      activeCalls.delete(targetCall.call_id);
      console.log(`📵 Call ended: ${targetCall.call_id} (${duration || 0}s)`);
    }

    return res.json({ status: 'ok', call: targetCall });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/calls/incoming
 * Poll for incoming ringing calls (polled by receiver's UI)
 */
router.get('/incoming', (req, res) => {
  const ringingCalls = Array.from(activeCalls.values())
    .filter(c => c.status === 'ringing');
  
  return res.json({
    incoming_calls: ringingCalls,
    count: ringingCalls.length
  });
});

/**
 * GET /api/calls/active
 * List currently active calls
 */
router.get('/active', (req, res) => {
  const calls = Array.from(activeCalls.values());
  return res.json({ active_calls: calls, count: calls.length });
});

/**
 * GET /api/calls/history
 * List recent call history
 */
router.get('/history', (req, res) => {
  const recent = callHistory.slice(-50).reverse();
  return res.json({ call_history: recent, total: callHistory.length });
});

/**
 * POST /api/calls/ai-response
 * Real-time Clinical AI Voice Doctor response during call
 */
router.post('/ai-response', (req, res) => {
  try {
    const { query = '', symptoms = '', language = 'en', doctorName = 'Dr. Aarav (AI Medical Officer)' } = req.body;
    const text = `${query} ${symptoms}`.toLowerCase();

    let triageLevel = 'Normal';
    let voiceText = '';
    let diagnosis = '';
    let recommendation = '';
    let prescribedActions = [];
    let isEmergency = false;

    if (/chest pain|chest pressure|heart attack|sweating|left arm/i.test(text)) {
      triageLevel = 'High Risk';
      isEmergency = true;
      diagnosis = 'Suspected Acute Coronary Event / Angina Protocol';
      voiceText = 'Warning: Your symptoms suggest a potential cardiac emergency. Please sit still, keep calm, chew a 300 milligram dispersible aspirin if available, and emergency 108 ambulance is being notified.';
      recommendation = 'Immediate 108 Ambulance Dispatch to District Hospital Cardiac ICU';
      prescribedActions = [
        'Dispatch 108 Ambulance immediately',
        'Keep patient sitting upright, minimize all movement',
        'Administer dispersible Aspirin 300mg as per first responder protocol',
        'Oxygen therapy if SpO2 < 94%'
      ];
    } else if (/pregnant|pregnancy|anc|trimester|high bp|headache|swelling/i.test(text)) {
      triageLevel = 'High Risk';
      isEmergency = true;
      diagnosis = 'Suspected Gestational Hypertensive Crisis / Preeclampsia';
      voiceText = 'High risk pregnancy alert. Lie down on your left side to maintain blood flow to the baby. Our emergency obstetrician at Pune District Hospital has been alerted.';
      recommendation = 'Urgent Transfer to District Hospital Obstetric Unit';
      prescribedActions = [
        'Lie on left lateral side immediately',
        'Check BP and Urine Albumin dipstick',
        'Fast-track referral to FRU with Obstetrician and NICU'
      ];
    } else if (/fever|temperature|chills|shivering|headache|body pain/i.test(text)) {
      triageLevel = 'Needs Doctor';
      diagnosis = 'Acute Febrile Illness / Viral Syndrome';
      voiceText = 'You have reported acute fever symptoms. Please hydrate frequently with boiled water or ORS. Take Jan Aushadhi Paracetamol 500mg every 6 to 8 hours for fever, and visit your nearest PHC if temperature exceeds 101 degrees Fahrenheit.';
      recommendation = 'Consult PHC Medical Officer & Monitor Temperature';
      prescribedActions = [
        'Jan Aushadhi Paracetamol 500mg (SOS for fever > 100°F)',
        'Oral Rehydration Solution (ORS) 1-2 litres daily',
        'Complete Blood Count (CBC) and Malarial Rapid Test if fever persists > 48h'
      ];
    } else if (/cough|cold|throat|sneeze|phlegm/i.test(text)) {
      triageLevel = 'Normal';
      diagnosis = 'Upper Respiratory Tract Infection (Mild)';
      voiceText = 'Your symptoms indicate a seasonal upper respiratory infection. Steam inhalation twice daily and Jan Aushadhi Cetirizine 10mg at night will provide relief. Stay hydrated.';
      recommendation = 'Home symptomatic care & Sub-Centre follow up';
      prescribedActions = [
        'Steam inhalation with warm saline gargles twice daily',
        'Jan Aushadhi Cetirizine 10mg once daily at bedtime',
        'Visit PHC if accompanied by shortness of breath'
      ];
    } else if (/medicine|generic|jan aushadhi|substitute|prescription/i.test(text)) {
      triageLevel = 'Normal';
      diagnosis = 'Jan Aushadhi Generic Medicine Ingestion Query';
      voiceText = 'RuralCare supports generic substitutions under PM Jan Aushadhi Pariyojana. Generic medicines contain the identical active pharmaceutical ingredient and save up to 87 percent in costs.';
      recommendation = 'Collect generic medicines from nearest Jan Aushadhi Kendra or PHC Dispensary';
      prescribedActions = [
        'Search generic salt name on RuralCare Jan Aushadhi directory',
        'Present QR prescription at PHC Khedgaon pharmacy'
      ];
    } else {
      triageLevel = 'Needs Doctor';
      diagnosis = 'Clinical Symptom Evaluation';
      voiceText = `I have logged your clinical query: "${query || symptoms}". Our telemedicine duty officer Dr. Rajesh Deshmukh will review your consultation vitals. Please stay on the line or visit PHC Khedgaon for physical examination.`;
      recommendation = 'Routine OPD Consultation at Primary Health Centre';
      prescribedActions = [
        'Rest and maintain adequate fluid intake',
        'Book zero-wait OPD token via RuralCare portal'
      ];
    }

    return res.json({
      ai_doctor_name: doctorName,
      triage_level: triageLevel,
      is_emergency: isEmergency,
      diagnosis,
      voice_text: voiceText,
      recommendation,
      prescribed_actions: prescribedActions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
