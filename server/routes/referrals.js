const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/referrals
 * Doctor / ASHA: Create a smart referral connecting Patient -> Referring Facility -> Referred Facility -> Doctor
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
      specialist_required = 'General Medicine',
      required_tests = 'None',
      queue_token,
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
      const d = db.get('SELECT staff_id FROM doctors WHERE facility_id = ? LIMIT 1', [parseInt(referring_facility_id)]);
      docId = d ? d.staff_id : 1;
    }

    // Auto-generate queue token if not supplied
    const generatedToken = queue_token || `Q-DH-${Math.floor(100 + Math.random() * 900)}`;

    let referral;
    db.transaction(() => {
      const insert = db.run(`
        INSERT INTO referrals (
          patient_id, referring_facility_id, referred_facility_id, doctor_id, 
          reason, priority, specialist_required, required_tests, queue_token,
          current_stage, status, clinical_summary
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Created', 'Pending', ?)
      `, [
        parseInt(patient_id), 
        parseInt(referring_facility_id), 
        parseInt(referred_facility_id), 
        docId, 
        reason, 
        priority, 
        specialist_required, 
        required_tests, 
        generatedToken, 
        clinical_summary || null
      ]);

      const referralId = Number(insert.lastInsertRowid);

      // Notify citizen
      const patient = db.get('SELECT p.user_id, u.village_id FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = ?', [parseInt(patient_id)]);
      const referredFacility = db.get('SELECT facility_name FROM facilities WHERE facility_id = ?', [parseInt(referred_facility_id)]);

      if (patient) {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Smart Referral Issued (Token: ${generatedToken})', ?, 'referral')
        `, [
          patient.user_id,
          `You have been referred to ${referredFacility ? referredFacility.facility_name : 'District Hospital'} for: ${reason}. Specialist: ${specialist_required}. Priority: ${priority}. Queue Token: ${generatedToken}`
        ]);

        // If priority is Urgent or Emergency, immediately alert village ASHA worker
        if (priority === 'Urgent' || priority === 'Emergency') {
          db.run(`
            INSERT INTO notifications (user_id, title, message, type)
            SELECT u.user_id, '🚨 High Priority Patient Referral', ?, 'referral'
            FROM users u
            WHERE u.role = 'asha' AND (u.village_id = ? OR u.village_id IS NULL)
          `, [
            `Patient referral #${referralId} (${priority}) issued to ${referredFacility ? referredFacility.facility_name : 'Hospital'}. Track arrival!`,
            patient.village_id
          ]);
        }
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
      message: 'Smart referral created successfully',
      referral
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/referrals/stuck
 * Healthcare Bottleneck Watchlist: Referrals where patient hasn't reached hospital or are marked stuck
 */
router.get('/stuck', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const stuckReferrals = db.all(`
      SELECT r.*,
             u.name as patient_name, u.phone as patient_phone, u.age as patient_age, u.gender as patient_gender,
             v.village_name,
             f1.facility_name as referring_facility_name,
             f2.facility_name as referred_facility_name,
             d.name as doctor_name,
             ROUND((julianday('now') - julianday(r.created_at)) * 24, 1) as hours_elapsed
      FROM referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.current_stage = 'Stuck - Follow-up Required'
         OR (r.current_stage = 'Created' AND r.status != 'Completed' AND (julianday('now') - julianday(r.created_at)) * 24 > 12)
      ORDER BY r.priority = 'Emergency' DESC, r.priority = 'Urgent' DESC, r.created_at ASC
    `);

    return res.json({ stuckReferrals });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/referrals/:id/stage
 * 6-Stage Referral Tracking Lifecycle Transition:
 * Created -> Patient Reached -> Consultation -> Test -> Treatment -> Follow-up -> Stuck
 */
router.put('/:id/stage', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const { stage, notes, bottleneck_reason } = req.body;

    const validStages = [
      'Created',
      'Patient Reached',
      'Consultation',
      'Test',
      'Treatment',
      'Follow-up',
      'Stuck - Follow-up Required'
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
    }

    const ref = db.get(`
      SELECT r.*, u.user_id, u.name as patient_name, u.village_id,
             f1.facility_name as referring_name, f2.facility_name as destination_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      WHERE r.referral_id = ?
    `, [referralId]);

    if (!ref) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    let timestampColumn = null;
    let newStatus = ref.status;

    if (stage === 'Patient Reached') {
      timestampColumn = 'reached_at';
      newStatus = 'Accepted';
    } else if (stage === 'Consultation') {
      timestampColumn = 'consultation_at';
      newStatus = 'Accepted';
    } else if (stage === 'Test') {
      timestampColumn = 'test_at';
      newStatus = 'Accepted';
    } else if (stage === 'Treatment') {
      timestampColumn = 'treatment_at';
      newStatus = 'Accepted';
    } else if (stage === 'Follow-up') {
      timestampColumn = 'completed_at';
      newStatus = 'Completed';
    }

    db.transaction(() => {
      let updateSql = `
        UPDATE referrals 
        SET current_stage = ?,
            status = ?,
            clinical_summary = COALESCE(?, clinical_summary),
            updated_at = CURRENT_TIMESTAMP
      `;
      const params = [stage, newStatus, notes || null];

      if (timestampColumn) {
        updateSql += `, ${timestampColumn} = COALESCE(${timestampColumn}, CURRENT_TIMESTAMP)`;
      }

      if (stage === 'Stuck - Follow-up Required') {
        updateSql += `, bottleneck_reason = ?, last_followup_alert_at = CURRENT_TIMESTAMP, asha_followup_status = 'Pending Visit'`;
        params.push(bottleneck_reason || 'Patient did not reach destination hospital within expected time window');
      } else if (stage === 'Patient Reached') {
        updateSql += `, bottleneck_reason = NULL, asha_followup_status = 'Resolved'`;
      }

      updateSql += ` WHERE referral_id = ?`;
      params.push(referralId);

      db.run(updateSql, params);

      // If patient is stuck or dropout detected, fire high-priority alert to village ASHA worker
      if (stage === 'Stuck - Follow-up Required') {
        const alertMsg = `⚠️ Referral not completed – follow-up required! Patient ${ref.patient_name} did not reach ${ref.destination_name}. Reason: ${bottleneck_reason || 'Travel delayed'}. Please conduct urgent home visit.`;
        
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          SELECT u.user_id, '⚠️ Referral Follow-up Required', ?, 'referral'
          FROM users u
          WHERE u.role = 'asha' AND (u.village_id = ? OR u.village_id IS NULL)
        `, [alertMsg, ref.village_id]);
      } else {
        // Standard patient notification
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Referral Journey Update', ?, 'referral')
        `, [
          ref.user_id,
          `Your health journey referral stage is now "${stage}" at ${ref.destination_name}.`
        ]);
      }
    });

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
      message: `Referral progressed to stage: ${stage}`,
      referral: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/referrals/:id/asha-followup
 * ASHA worker updates follow-up action for unreached / stuck patient
 */
router.put('/:id/asha-followup', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const { asha_followup_status, asha_followup_notes, mark_reached } = req.body;

    const ref = db.get('SELECT * FROM referrals WHERE referral_id = ?', [referralId]);
    if (!ref) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    db.transaction(() => {
      let sql = `
        UPDATE referrals
        SET asha_followup_status = ?,
            asha_followup_notes = COALESCE(?, asha_followup_notes),
            updated_at = CURRENT_TIMESTAMP
      `;
      const params = [asha_followup_status || 'Home Visited', asha_followup_notes || null];

      if (mark_reached) {
        sql += `, current_stage = 'Patient Reached', reached_at = CURRENT_TIMESTAMP, status = 'Accepted', bottleneck_reason = NULL`;
      }

      sql += ` WHERE referral_id = ?`;
      params.push(referralId);

      db.run(sql, params);
    });

    const updated = db.get('SELECT * FROM referrals WHERE referral_id = ?', [referralId]);
    return res.json({
      message: 'ASHA follow-up record updated',
      referral: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/referrals/tracking/:id
 * Detailed audit trail of referral journey
 */
router.get('/tracking/:id', authenticateToken, (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const ref = db.get(`
      SELECT r.*,
             u.name as patient_name, u.phone as patient_phone, u.age as patient_age, u.gender as patient_gender,
             p.blood_group, p.health_journey_id,
             f1.facility_name as referring_facility_name, f1.facility_type as referring_facility_type, f1.address as referring_address,
             f2.facility_name as referred_facility_name, f2.facility_type as referred_facility_type, f2.address as destination_address, f2.contact as destination_contact,
             d.name as doctor_name, d.specialization
      FROM referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      JOIN facilities f1 ON r.referring_facility_id = f1.facility_id
      JOIN facilities f2 ON r.referred_facility_id = f2.facility_id
      JOIN doctors d ON r.doctor_id = d.staff_id
      WHERE r.referral_id = ?
    `, [referralId]);

    if (!ref) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const stagesTimeline = [
      {
        stage: 'Created',
        label: 'Referral Created',
        timestamp: ref.created_at,
        facility: ref.referring_facility_name,
        completed: true
      },
      {
        stage: 'Patient Reached',
        label: 'Hospital Check-in',
        timestamp: ref.reached_at,
        facility: ref.referred_facility_name,
        completed: !!ref.reached_at
      },
      {
        stage: 'Consultation',
        label: 'Doctor Consultation',
        timestamp: ref.consultation_at,
        doctor: ref.doctor_name,
        completed: !!ref.consultation_at
      },
      {
        stage: 'Test',
        label: 'Diagnostics & Labs',
        timestamp: ref.test_at,
        tests: ref.required_tests,
        completed: !!ref.test_at
      },
      {
        stage: 'Treatment',
        label: 'Treatment & Pharmacy',
        timestamp: ref.treatment_at,
        completed: !!ref.treatment_at
      },
      {
        stage: 'Follow-up',
        label: 'Discharge & PHC Follow-up',
        timestamp: ref.completed_at,
        completed: !!ref.completed_at
      }
    ];

    return res.json({
      referral: ref,
      timeline: stagesTimeline
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
