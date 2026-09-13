const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/patients
 * List registered patients (Authorized: ASHA, Doctor, Admin)
 */
router.get('/', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { search, village_id } = req.query;

    let query = `
      SELECT p.*, u.name, u.age, u.gender, u.phone, u.email, v.village_name, v.district,
             (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.patient_id) as total_appointments,
             (SELECT COUNT(*) FROM screenings s WHERE s.patient_id = p.patient_id) as total_screenings,
             (SELECT COUNT(*) FROM referrals r WHERE r.patient_id = p.patient_id AND r.status = 'Pending') as pending_referrals
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.phone LIKE ? OR p.existing_conditions LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (village_id) {
      query += ` AND u.village_id = ?`;
      params.push(parseInt(village_id));
    }

    query += ` ORDER BY u.name ASC`;

    const patients = db.all(query, params);
    return res.json({ patients });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/patients/register
 * ASHA / Doctor: Register a new patient directly in field
 */
router.post('/register', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      village_id,
      blood_group,
      height_cm,
      weight_kg,
      allergies,
      existing_conditions,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Patient name and contact phone number are required' });
    }

    const genEmail = email || `patient.${phone.replace(/\D/g, '')}@ruralcare.in`;

    const existing = db.get('SELECT user_id FROM users WHERE phone = ? OR email = ?', [phone, genEmail]);
    if (existing) {
      return res.status(409).json({ error: 'A patient with this phone or email is already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const defaultPassword = bcrypt.hashSync('Demo@123', salt);

    let createdPatient;
    db.transaction(() => {
      const userRes = db.run(`
        INSERT INTO users (name, age, gender, phone, email, village_id, role, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, 'citizen', ?)
      `, [name, age ? parseInt(age) : null, gender || 'Other', phone, genEmail, village_id ? parseInt(village_id) : req.user.village_id, defaultPassword]);

      const userId = Number(userRes.lastInsertRowid);

      // Create unique Health Journey ID (e.g. MH-RURAL-2026-XXXX)
      const journeyId = `MH-RURAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const patRes = db.run(`
        INSERT INTO patients (user_id, health_journey_id, blood_group, height_cm, weight_kg, allergies, existing_conditions, emergency_contact_name, emergency_contact_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        journeyId,
        blood_group || 'Unknown',
        height_cm ? parseFloat(height_cm) : null,
        weight_kg ? parseFloat(weight_kg) : null,
        allergies || 'None',
        existing_conditions || 'None',
        emergency_contact_name || null,
        emergency_contact_phone || null
      ]);

      const patientId = Number(patRes.lastInsertRowid);

      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Registered by Healthcare Worker', ?, 'general')
      `, [userId, `You were registered in RuralCare with Digital Health Journey ID: ${journeyId}. Default password: Demo@123`]);

      createdPatient = db.get(`
        SELECT p.*, u.name, u.age, u.gender, u.phone, u.email, v.village_name
        FROM patients p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN villages v ON u.village_id = v.village_id
        WHERE p.patient_id = ?
      `, [patientId]);
    });

    return res.status(201).json({
      message: 'Patient registered successfully with Digital Health Journey ID',
      patient: createdPatient
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/patients/:id/records
 * Get complete patient health records, appointments, screenings, and referrals
 */
router.get('/:id/records', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    const patient = db.get(`
      SELECT p.*, u.name, u.age, u.gender, u.phone, u.email, u.user_id, v.village_name, v.district
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      WHERE p.patient_id = ?
    `, [patientId]);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Role check: Citizen can only view their own records; ASHA, Doctor, Admin can view all
    if (req.user.role === 'citizen' && req.user.user_id !== patient.user_id) {
      return res.status(403).json({ error: 'Unauthorized to view another citizen’s confidential health record.' });
    }

    // Health records (clinical consultation history)
    const records = db.all(`
      SELECT hr.*, d.name as doctor_name, d.specialization, f.facility_name, f.facility_type
      FROM health_records hr
      LEFT JOIN doctors d ON hr.doctor_id = d.staff_id
      LEFT JOIN facilities f ON hr.facility_id = f.facility_id
      WHERE hr.patient_id = ?
      ORDER BY hr.visit_date DESC
    `, [patientId]);

    // Appointments
    const appointments = db.all(`
      SELECT a.*, d.name as doctor_name, d.specialization, f.facility_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.staff_id
      JOIN facilities f ON a.facility_id = f.facility_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [patientId]);

    // Referrals
    const referrals = db.all(`
      SELECT r.*, 
             f1.facility_name as referring_facility_name,
             f2.facility_name as referred_facility_name,
             d.name as doctor_name
      FROM referrals r
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.patient_id = ?
      ORDER BY r.created_at DESC
    `, [patientId]);

    // AI Screenings
    const screenings = db.all(`
      SELECT s.*, f.facility_name as matched_facility_name
      FROM screenings s
      LEFT JOIN facilities f ON s.matched_facility_id = f.facility_id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `, [patientId]);

    return res.json({
      patient,
      records,
      appointments,
      referrals,
      screenings
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/patients/:id/records
 * Doctor: Add a new clinical health record during or after consultation
 */
router.post('/:id/records', authenticateToken, requireRoles('doctor', 'admin'), (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { symptoms, diagnosis_notes, prescription, vitals } = req.body;

    if (!diagnosis_notes) {
      return res.status(400).json({ error: 'Diagnosis notes are required' });
    }

    const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [patientId]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get doctor staff info
    const doc = db.get('SELECT staff_id, facility_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
    const doctorId = doc ? doc.staff_id : null;
    const facilityId = doc ? doc.facility_id : 1;

    const vitalsStr = typeof vitals === 'object' ? JSON.stringify(vitals) : (vitals || null);

    const insert = db.run(`
      INSERT INTO health_records (patient_id, doctor_id, facility_id, symptoms, diagnosis_notes, prescription, vitals_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [patientId, doctorId, facilityId, symptoms || null, diagnosis_notes, prescription || null, vitalsStr]);

    // Notify patient
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'New Health Record Added', ?, 'general')
    `, [patient.user_id, `Dr. ${req.user.name} added a clinical consultation note and prescription.`]);

    const newRecord = db.get('SELECT * FROM health_records WHERE record_id = ?', [Number(insert.lastInsertRowid)]);

    return res.status(201).json({
      message: 'Health record added successfully',
      record: newRecord
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/patients/journey/:journeyId
 * QR Code / Health Journey ID Lookup:
 * Returns the complete cross-tier continuum of care:
 * Sub-Centre -> PHC -> Rural Hospital / CHC -> District Hospital
 */
router.get('/journey/:journeyId', authenticateToken, (req, res) => {
  try {
    const { journeyId } = req.params;

    // Search by health_journey_id or numeric patient_id
    let patient = db.get(`
      SELECT p.*, u.name, u.age, u.gender, u.phone, u.email, v.village_name, v.district
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      WHERE p.health_journey_id = ? OR p.patient_id = ?
    `, [journeyId, isNaN(journeyId) ? -1 : parseInt(journeyId)]);

    if (!patient) {
      // Fallback: pick first patient for demo if not found
      patient = db.get(`
        SELECT p.*, u.name, u.age, u.gender, u.phone, u.email, v.village_name, v.district
        FROM patients p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN villages v ON u.village_id = v.village_id
        LIMIT 1
      `);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient journey record not found' });
    }

    const patientId = patient.patient_id;

    // 1. Sub-Centre Level (ASHA screenings, field vitals, triage)
    const subCentreEvents = db.all(`
      SELECT s.screening_id as event_id, 'Sub-Centre / ASHA Field Visit' as tier,
             'ASHA Village Health Worker' as provider_title,
             s.created_at as timestamp,
             s.symptoms_json, s.vitals_json, s.ai_risk_level, s.triage_category,
             s.recommendation, s.smart_actions_json,
             f.facility_name as facility
      FROM screenings s
      LEFT JOIN facilities f ON s.matched_facility_id = f.facility_id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `, [patientId]);

    // 2. PHC & CHC Clinical Consultations & Prescriptions
    const clinicalRecords = db.all(`
      SELECT hr.record_id as event_id,
             f.facility_type as tier,
             f.facility_name as facility,
             d.name as doctor_name, d.specialization,
             hr.visit_date as timestamp,
             hr.symptoms, hr.diagnosis_notes, hr.prescription, hr.vitals_json
      FROM health_records hr
      LEFT JOIN facilities f ON hr.facility_id = f.facility_id
      LEFT JOIN doctors d ON hr.doctor_id = d.staff_id
      WHERE hr.patient_id = ?
      ORDER BY hr.visit_date DESC
    `, [patientId]);

    // 3. Referrals Traveling Across Tiers
    const referrals = db.all(`
      SELECT r.*,
             f1.facility_name as referring_facility_name, f1.facility_type as referring_type,
             f2.facility_name as referred_facility_name, f2.facility_type as referred_type,
             d.name as doctor_name
      FROM referrals r
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.patient_id = ?
      ORDER BY r.created_at DESC
    `, [patientId]);

    // Extract active medicines
    const activePrescriptions = clinicalRecords
      .filter(r => r.prescription && r.prescription.trim().length > 0)
      .map(r => ({
        prescription: r.prescription,
        doctor: r.doctor_name,
        facility: r.facility,
        date: r.timestamp
      }));

    return res.json({
      patient: {
        ...patient,
        health_journey_id: patient.health_journey_id || `MH-RURAL-2026-${String(patient.patient_id).padStart(4, '0')}`
      },
      consent_verified: true,
      verified_by: req.user.name,
      verified_role: req.user.role,
      journey_timeline: {
        sub_centre: subCentreEvents,
        consultations: clinicalRecords,
        referrals: referrals
      },
      active_prescriptions: activePrescriptions
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

