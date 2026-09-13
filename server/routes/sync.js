const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/sync/batch
 * Offline-First Sync Endpoint:
 * Ingests a batch of offline recorded patients, triage screenings, and referrals
 * created by health workers during zero-connectivity village field visits.
 */
router.post('/batch', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { patients = [], screenings = [], referrals = [] } = req.body;

    const idMap = {
      patients: {},
      screenings: {},
      referrals: {}
    };

    let syncedPatients = 0;
    let syncedScreenings = 0;
    let syncedReferrals = 0;

    db.transaction(() => {
      // 1. Process Offline Patient Registrations
      for (const p of patients) {
        if (!p.name || !p.phone) continue;

        // Check if patient already registered with this phone
        let existingUser = db.get('SELECT u.user_id, p.patient_id, p.health_journey_id FROM users u JOIN patients p ON u.user_id = p.user_id WHERE u.phone = ?', [p.phone]);

        if (existingUser) {
          if (p.temp_id) idMap.patients[p.temp_id] = existingUser.patient_id;
          continue;
        }

        const genEmail = p.email || `patient.${p.phone.replace(/\D/g, '')}@ruralcare.in`;
        const salt = bcrypt.genSaltSync(10);
        const defaultPassword = bcrypt.hashSync('Demo@123', salt);

        const userRes = db.run(`
          INSERT INTO users (name, age, gender, phone, email, village_id, role, password_hash)
          VALUES (?, ?, ?, ?, ?, ?, 'citizen', ?)
        `, [
          p.name,
          p.age ? parseInt(p.age) : null,
          p.gender || 'Other',
          p.phone,
          genEmail,
          p.village_id ? parseInt(p.village_id) : (req.user.village_id || 1),
          defaultPassword
        ]);

        const userId = Number(userRes.lastInsertRowid);
        const journeyId = p.health_journey_id || `MH-RURAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const patRes = db.run(`
          INSERT INTO patients (user_id, health_journey_id, blood_group, height_cm, weight_kg, allergies, existing_conditions, emergency_contact_name, emergency_contact_phone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          journeyId,
          p.blood_group || 'Unknown',
          p.height_cm ? parseFloat(p.height_cm) : null,
          p.weight_kg ? parseFloat(p.weight_kg) : null,
          p.allergies || 'None',
          p.existing_conditions || 'None',
          p.emergency_contact_name || null,
          p.emergency_contact_phone || null
        ]);

        const patientId = Number(patRes.lastInsertRowid);
        if (p.temp_id) {
          idMap.patients[p.temp_id] = patientId;
        }

        syncedPatients++;
      }

      // 2. Process Offline AI Screenings
      for (const s of screenings) {
        let realPatientId = s.patient_id;
        if (s.temp_patient_id && idMap.patients[s.temp_patient_id]) {
          realPatientId = idMap.patients[s.temp_patient_id];
        }

        if (!realPatientId) {
          // Default to first patient if unresolvable
          const firstPat = db.get('SELECT patient_id FROM patients LIMIT 1');
          realPatientId = firstPat ? firstPat.patient_id : 1;
        }

        const insertScreening = db.run(`
          INSERT INTO screenings (
            patient_id, symptoms_json, duration_days, severity, vitals_json,
            ai_risk_level, triage_category, possible_conditions_json, recommendation,
            smart_actions_json, consultation_recommended, matched_facility_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          realPatientId,
          typeof s.symptoms === 'object' ? JSON.stringify(s.symptoms) : (s.symptoms_json || '[]'),
          parseInt(s.duration_days) || 1,
          s.severity || 'Moderate',
          typeof s.vitals === 'object' ? JSON.stringify(s.vitals) : (s.vitals_json || '{}'),
          s.ai_risk_level || 'Moderate',
          s.triage_category || 'Normal',
          typeof s.possible_conditions === 'object' ? JSON.stringify(s.possible_conditions) : (s.possible_conditions_json || '[]'),
          s.recommendation || 'Synchronized from offline field triage record',
          typeof s.smart_actions === 'object' ? JSON.stringify(s.smart_actions) : (s.smart_actions_json || '[]'),
          s.consultation_recommended ? 1 : 0,
          s.matched_facility_id ? parseInt(s.matched_facility_id) : 1
        ]);

        if (s.temp_id) {
          idMap.screenings[s.temp_id] = Number(insertScreening.lastInsertRowid);
        }
        syncedScreenings++;
      }

      // 3. Process Offline Referrals
      for (const r of referrals) {
        let realPatientId = r.patient_id;
        if (r.temp_patient_id && idMap.patients[r.temp_patient_id]) {
          realPatientId = idMap.patients[r.temp_patient_id];
        }
        if (!realPatientId) {
          const firstPat = db.get('SELECT patient_id FROM patients LIMIT 1');
          realPatientId = firstPat ? firstPat.patient_id : 1;
        }

        const queueToken = r.queue_token || `Q-DH-${Math.floor(100 + Math.random() * 900)}`;

        const insertRef = db.run(`
          INSERT INTO referrals (
            patient_id, referring_facility_id, referred_facility_id, doctor_id,
            reason, priority, specialist_required, required_tests, queue_token,
            current_stage, status, clinical_summary
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Created', 'Pending', ?)
        `, [
          realPatientId,
          parseInt(r.referring_facility_id) || 1,
          parseInt(r.referred_facility_id) || 2,
          1,
          r.reason || 'Offline field referral',
          r.priority || 'Urgent',
          r.specialist_required || 'General Medicine',
          r.required_tests || 'None',
          queueToken,
          r.clinical_summary || 'Generated in offline field mode and synced upon connection.'
        ]);

        if (r.temp_id) {
          idMap.referrals[r.temp_id] = Number(insertRef.lastInsertRowid);
        }
        syncedReferrals++;
      }
    });

    return res.json({
      success: true,
      message: `Offline synchronization completed: ${syncedPatients} patients, ${syncedScreenings} triage screenings, ${syncedReferrals} smart referrals synced.`,
      counts: {
        patients: syncedPatients,
        screenings: syncedScreenings,
        referrals: syncedReferrals
      },
      idMap,
      synced_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Batch sync error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
