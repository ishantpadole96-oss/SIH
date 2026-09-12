const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/referrals
 * Doctor / ASHA: Create a referral connecting Patient -> Referring Facility -> Referred Facility -> Doctor
 */
router.post('/', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const {
      patient_id,
      referring_facility_id,
      referred_facility_id,
      doctor_id,
      reason,
      priority = 'Routine',
      clinical_summary
    } = req.body;

    if (!patient_id || !referring_facility_id || !referred_facility_id || !reason) {
      return res.status(400).json({ error: 'patient_id, referring_facility_id, referred_facility_id, and reason are required.' });
    }

    if (parseInt(referring_facility_id) === parseInt(referred_facility_id)) {
      return res.status(400).json({ error: 'Referring facility and Referred facility cannot be the same.' });
    }

    // Resolve doctor_id if not provided
    let docId = doctor_id ? parseInt(doctor_id) : null;
    if (!docId && req.user.role === 'doctor') {
      const doc = db.get('SELECT staff_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
      if (doc) docId = doc.staff_id;
    }
    if (!docId) {
      // Pick first doctor at referring facility
      const d = db.get('SELECT staff_id FROM doctors WHERE facility_id = ? LIMIT 1', [parseInt(referring_facility_id)]);
      docId = d ? d.staff_id : 1;
    }

    let referral;
    db.transaction(() => {
      const insert = db.run(`
        INSERT INTO referrals (patient_id, referring_facility_id, referred_facility_id, doctor_id, reason, priority, status, clinical_summary)
        VALUES (?, ?, ?, ?, ?, 'Pending', ?)
      `, [parseInt(patient_id), parseInt(referring_facility_id), parseInt(referred_facility_id), docId, reason, priority, clinical_summary || null]);

      const referralId = Number(insert.lastInsertRowid);

      // Notify citizen
      const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [parseInt(patient_id)]);
      const referredFacility = db.get('SELECT facility_name FROM facilities WHERE facility_id = ?', [parseInt(referred_facility_id)]);

      if (patient) {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Healthcare Referral Issued', ?, 'referral')
        `, [
          patient.user_id,
          `You have been referred to ${referredFacility ? referredFacility.facility_name : 'a higher facility'} for: ${reason}. Priority: ${priority}`
        ]);
      }

      referral = db.get(`
        SELECT r.*, 
               f1.facility_name as referring_facility_name,
               f2.facility_name as referred_facility_name,
               d.name as doctor_name,
               u.name as patient_name
        FROM referrals r
        JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
        JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
        JOIN doctors d ON r.doctor_id = d.staff_id
        JOIN patients p ON r.patient_id = p.patient_id
        JOIN users u ON p.user_id = u.user_id
        WHERE r.referral_id = ?
      `, [referralId]);
    });

    return res.status(201).json({
      message: 'Referral created successfully',
      referral
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/referrals/my
 * Citizen: Get all personal referrals and tracking progress
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const referrals = db.all(`
      SELECT r.*, 
             f1.facility_name as referring_facility_name, f1.facility_type as referring_facility_type,
             f2.facility_name as referred_facility_name, f2.facility_type as referred_facility_type, f2.address as destination_address, f2.contact as destination_contact,
             d.name as doctor_name, d.specialization
      FROM referrals r
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.patient_id = ?
      ORDER BY r.created_at DESC
    `, [patient.patient_id]);

    return res.json({ referrals });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/referrals
 * Staff / Doctor / Admin / ASHA: List referrals with filters
 */
router.get('/', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const { facility_id, status, priority, patient_id } = req.query;

    let query = `
      SELECT r.*, 
             u.name as patient_name, u.phone as patient_phone, u.age as patient_age, u.gender as patient_gender,
             f1.facility_name as referring_facility_name,
             f2.facility_name as referred_facility_name,
             d.name as doctor_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (facility_id) {
      query += ` AND (r.referring_facility_id = ? OR r.referred_facility_id = ?)`;
      params.push(parseInt(facility_id), parseInt(facility_id));
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }

    if (patient_id) {
      query += ` AND r.patient_id = ?`;
      params.push(parseInt(patient_id));
    }

    query += ` ORDER BY r.priority = 'Emergency' DESC, r.priority = 'Urgent' DESC, r.created_at DESC`;

    const referrals = db.all(query, params);
    return res.json({ referrals });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/referrals/:id/status
 * Update referral lifecycle status (Pending -> Accepted -> Completed / Declined)
 */
router.put('/:id/status', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const { status, clinical_summary } = req.body;

    if (!status || !['Pending', 'Accepted', 'Completed', 'Declined'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required (Pending, Accepted, Completed, Declined)' });
    }

    const ref = db.get('SELECT * FROM referrals WHERE referral_id = ?', [referralId]);
    if (!ref) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    db.run(`
      UPDATE referrals
      SET status = ?, clinical_summary = COALESCE(?, clinical_summary), updated_at = CURRENT_TIMESTAMP
      WHERE referral_id = ?
    `, [status, clinical_summary || null, referralId]);

    // Notify patient
    const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [ref.patient_id]);
    if (patient) {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Referral Status Updated', ?, 'referral')
      `, [patient.user_id, `Your referral status is now "${status}".`]);
    }

    const updated = db.get(`
      SELECT r.*, 
             f1.facility_name as referring_facility_name,
             f2.facility_name as referred_facility_name,
             d.name as doctor_name
      FROM referrals r
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.referral_id = ?
    `, [referralId]);

    return res.json({
      message: 'Referral status updated',
      referral: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
