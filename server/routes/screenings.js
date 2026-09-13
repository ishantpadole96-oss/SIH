const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { screenPatient, CLINICAL_DISCLAIMER } = require('../services/aiScreening');
const { calculateDistance } = require('../services/accessibilityScore');

const router = express.Router();

/**
 * POST /api/screenings
 * Perform AI health screening and persist record
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      symptoms = [],
      duration_days = 1,
      severity = 'Moderate',
      vitals = {},
      existing_conditions = '',
      user_lat,
      user_lng,
      patient_id: reqPatientId
    } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one symptom for screening.' });
    }

    // Determine target patient and user
    let targetPatientId;
    let targetUser;

    if (req.user.role === 'citizen') {
      const p = db.get('SELECT p.patient_id, u.* FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = ?', [req.user.user_id]);
      if (!p) {
        return res.status(404).json({ error: 'Patient profile not found.' });
      }
      targetPatientId = p.patient_id;
      targetUser = p;
    } else {
      // ASHA or Doctor screening a patient
      if (!reqPatientId) {
        return res.status(400).json({ error: 'Patient ID required when screening as a healthcare worker.' });
      }
      const p = db.get('SELECT p.patient_id, u.* FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = ?', [parseInt(reqPatientId)]);
      if (!p) return res.status(404).json({ error: 'Target patient not found.' });
      targetPatientId = p.patient_id;
      targetUser = p;
    }

    // Run AI Clinical Decision Support Engine
    const screeningResult = screenPatient({
      symptoms,
      duration_days: parseInt(duration_days) || 1,
      severity,
      vitals,
      age: targetUser.age || 35,
      gender: targetUser.gender || 'Other',
      existing_conditions: existing_conditions || targetUser.existing_conditions || ''
    });

    // Find Appropriate Healthcare Facilities based on required tier and location
    let userLat = user_lat ? parseFloat(user_lat) : null;
    let userLng = user_lng ? parseFloat(user_lng) : null;

    if ((!userLat || !userLng) && targetUser.village_id) {
      const v = db.get('SELECT latitude, longitude FROM villages WHERE village_id = ?', [targetUser.village_id]);
      if (v) {
        userLat = v.latitude;
        userLng = v.longitude;
      }
    }

    // Default coordinates fallback (Shivapur)
    if (!userLat || !userLng) {
      userLat = 18.2851;
      userLng = 73.8824;
    }

    // Query facilities matching required capability
    const allFacilities = db.all(`
      SELECT f.*, v.village_name, es.ambulance_available, es.emergency_contact, es.ambulance_phone,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id AND d.availability_status = 'Available') as doctors_available
      FROM facilities f
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
      WHERE f.current_status IN ('Open', 'Emergency Only')
    `);

    // Calculate distance and filter suitability
    let matchedFacilities = allFacilities.map(f => ({
      ...f,
      distanceKm: calculateDistance(userLat, userLng, f.latitude, f.longitude)
    }));

    // If High or Emergency, prioritize CHC / Sub-District Hospital / emergency enabled
    if (screeningResult.ai_risk_level === 'Emergency' || screeningResult.ai_risk_level === 'High') {
      matchedFacilities.sort((a, b) => {
        // Emergency facility preference
        if (a.emergency_available !== b.emergency_available) return b.emergency_available - a.emergency_available;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      // Low/Moderate -> Sort strictly by closest distance
      matchedFacilities.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    const topMatchedFacility = matchedFacilities.length > 0 ? matchedFacilities[0] : null;

    // Persist screening record in database
    let savedScreening;
    db.transaction(() => {
      const insert = db.run(`
        INSERT INTO screenings (
          patient_id, symptoms_json, duration_days, severity, vitals_json,
          ai_risk_level, triage_category, possible_conditions_json, recommendation,
          smart_actions_json, consultation_recommended, matched_facility_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        targetPatientId,
        JSON.stringify(symptoms),
        parseInt(duration_days) || 1,
        severity,
        JSON.stringify(vitals),
        screeningResult.ai_risk_level,
        screeningResult.triage_category || 'Normal',
        JSON.stringify(screeningResult.possible_conditions),
        screeningResult.recommendation,
        JSON.stringify(screeningResult.smart_actions || []),
        screeningResult.consultation_recommended,
        topMatchedFacility ? topMatchedFacility.facility_id : null
      ]);

      const screeningId = Number(insert.lastInsertRowid);

      // If High or Emergency risk, notify patient and village ASHA workers
      if (screeningResult.ai_risk_level === 'Emergency' || screeningResult.ai_risk_level === 'High') {
        // Patient alert
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, '⚠️ Urgent Health Screening Alert', ?, 'screening')
        `, [
          targetUser.user_id,
          `Your screening indicates ${screeningResult.ai_risk_level} risk. Recommended facility: ${topMatchedFacility ? topMatchedFacility.facility_name : 'District Hospital'}.`
        ]);

        // ASHA worker alert
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          SELECT u.user_id, 'High-Risk Villager Alert', ?, 'screening'
          FROM users u
          WHERE u.role = 'asha' AND (u.village_id = ? OR u.village_id IS NULL)
        `, [`Patient ${targetUser.name} flagged as ${screeningResult.ai_risk_level} risk. Symptoms: ${symptoms.join(', ')}`, targetUser.village_id]);
      }

      savedScreening = db.get('SELECT * FROM screenings WHERE screening_id = ?', [screeningId]);
    });

    return res.status(201).json({
      message: 'Screening evaluation complete',
      screening_id: savedScreening.screening_id,
      screening_data: screeningResult,
      matched_facilities: matchedFacilities.slice(0, 4),
      recommended_facility: topMatchedFacility,
      disclaimer: CLINICAL_DISCLAIMER
    });
  } catch (err) {
    console.error('Screening error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/screenings/my
 * Citizen: Get personal screening history
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) return res.status(404).json({ error: 'Patient profile not found.' });

    const screenings = db.all(`
      SELECT s.*, f.facility_name as matched_facility_name, f.facility_type as matched_facility_type
      FROM screenings s
      LEFT JOIN facilities f ON s.matched_facility_id = f.facility_id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `, [patient.patient_id]);

    const formatted = screenings.map(sc => ({
      ...sc,
      symptoms: JSON.parse(sc.symptoms_json || '[]'),
      possible_conditions: JSON.parse(sc.possible_conditions_json || '[]'),
      vitals: JSON.parse(sc.vitals_json || '{}')
    }));

    return res.json({ screenings: formatted, disclaimer: CLINICAL_DISCLAIMER });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/screenings/high-risk
 * ASHA / Doctor / Admin: List high-risk and emergency screening cases for active community triage
 */
router.get('/high-risk', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const highRisk = db.all(`
      SELECT s.*, 
             p.patient_id, p.blood_group, p.existing_conditions,
             u.name as patient_name, u.age as patient_age, u.gender as patient_gender, u.phone as patient_phone,
             v.village_name,
             f.facility_name as matched_facility_name
      FROM screenings s
      JOIN patients p ON s.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      LEFT JOIN facilities f ON s.matched_facility_id = f.facility_id
      WHERE s.ai_risk_level IN ('High', 'Emergency')
      ORDER BY s.ai_risk_level = 'Emergency' DESC, s.created_at DESC
    `);

    const formatted = highRisk.map(sc => ({
      ...sc,
      symptoms: JSON.parse(sc.symptoms_json || '[]'),
      possible_conditions: JSON.parse(sc.possible_conditions_json || '[]'),
      vitals: JSON.parse(sc.vitals_json || '{}')
    }));

    return res.json({ highRiskCases: formatted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
