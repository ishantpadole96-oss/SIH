const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditLogger');

const router = express.Router();

/**
 * POST /api/consultations/queue
 * Health Worker / Citizen: Submit a checkup consultation request into FCFS doctor queue
 * (Specification Section 9.5 & Section 10)
 */
router.post('/queue', authenticateToken, requireRoles('asha', 'citizen', 'admin'), (req, res) => {
  try {
    const {
      patient_id,
      health_center_id,
      chief_complaint,
      symptoms_text,
      duration = '1-2 days',
      vitals,
      urgency = 'Routine'
    } = req.body;

    if (!patient_id || !chief_complaint) {
      return res.status(400).json({ error: 'patient_id and chief_complaint are required.' });
    }

    const targetFacilityId = health_center_id ? parseInt(health_center_id) : (req.user?.village_id || 1);

    // FCFS Routing: Check active doctors assigned to this Health Center/facility (Section 10)
    // Exclude doctors currently in an active consultation
    const availableDoctor = db.get(`
      SELECT d.staff_id, d.name, d.user_id
      FROM doctors d
      WHERE d.facility_id = ? 
        AND d.availability_status = 'Available'
        AND d.staff_id NOT IN (
          SELECT assigned_doctor_id FROM consultation_requests 
          WHERE status IN ('In Consultation', 'Assigned') AND assigned_doctor_id IS NOT NULL
        )
      LIMIT 1
    `, [targetFacilityId]);

    const assignedDoctorId = availableDoctor ? availableDoctor.staff_id : null;
    const initialStatus = assignedDoctorId ? 'Assigned' : 'Queued';

    const insert = db.run(`
      INSERT INTO consultation_requests (
        patient_id, health_center_id, worker_id, chief_complaint, symptoms_text,
        duration, vitals_json, urgency, assigned_doctor_id, status, assigned_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parseInt(patient_id),
      targetFacilityId,
      req.user.user_id,
      chief_complaint,
      symptoms_text || chief_complaint,
      duration,
      vitals ? JSON.stringify(vitals) : null,
      urgency,
      assignedDoctorId,
      initialStatus,
      assignedDoctorId ? new Date().toISOString() : null
    ]);

    const requestId = Number(insert.lastInsertRowid);

    // Notify assigned doctor if auto-assigned
    if (availableDoctor) {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'New Consultation Assigned (FCFS Queue)', ?, 'appointment')
      `, [
        availableDoctor.user_id,
        `Case #${requestId}: Patient assigned from queue. Chief Complaint: ${chief_complaint}. Urgency: ${urgency}.`
      ]);
    }

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSULTATION_REQUEST_QUEUED',
      resource_type: 'consultation_request',
      resource_id: requestId,
      details: { patient_id, urgency, assigned_doctor_id: assignedDoctorId, status: initialStatus }
    });

    const requestRecord = db.get(`
      SELECT cr.*, u.name as patient_name, u.age as patient_age, u.gender as patient_gender,
             d.name as assigned_doctor_name, f.facility_name
      FROM consultation_requests cr
      JOIN patients p ON cr.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN doctors d ON cr.assigned_doctor_id = d.staff_id
      JOIN facilities f ON cr.health_center_id = f.facility_id
      WHERE cr.request_id = ?
    `, [requestId]);

    return res.status(201).json({
      message: assignedDoctorId ? `Assigned to ${availableDoctor.name}` : 'Request placed in FCFS Queue (All doctors currently busy)',
      request: requestRecord
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/consultations/queue
 * Doctor / Staff: Get live FCFS consultation queue for facility
 */
router.get('/queue', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    let doctorStaffId = null;
    let facilityId = null;

    if (req.user.role === 'doctor') {
      const doc = db.get('SELECT staff_id, facility_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
      if (doc) {
        doctorStaffId = doc.staff_id;
        facilityId = doc.facility_id;
      }
    }

    const queue = db.all(`
      SELECT cr.*, u.name as patient_name, u.age as patient_age, u.gender as patient_gender, u.phone as patient_phone,
             p.blood_group, p.existing_conditions, p.allergies,
             d.name as doctor_name, f.facility_name,
             hw.name as health_worker_name
      FROM consultation_requests cr
      JOIN patients p ON cr.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN doctors d ON cr.assigned_doctor_id = d.staff_id
      JOIN facilities f ON cr.health_center_id = f.facility_id
      LEFT JOIN users hw ON cr.worker_id = hw.user_id
      WHERE cr.status IN ('Queued', 'Assigned', 'In Consultation')
      ORDER BY 
        CASE cr.urgency WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END,
        cr.queued_at ASC
    `);

    return res.json({
      queue_length: queue.length,
      queue
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/consultations/:id/accept
 * Doctor accepts consultation request
 */
router.put('/:id/accept', authenticateToken, requireRoles('doctor'), (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const doc = db.get('SELECT staff_id, name FROM doctors WHERE user_id = ?', [req.user.user_id]);
    if (!doc) return res.status(404).json({ error: 'Doctor staff profile not found' });

    db.run(`
      UPDATE consultation_requests
      SET assigned_doctor_id = ?, status = 'In Consultation', assigned_at = COALESCE(assigned_at, CURRENT_TIMESTAMP)
      WHERE request_id = ?
    `, [doc.staff_id, requestId]);

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSULTATION_ACCEPTED',
      resource_type: 'consultation_request',
      resource_id: requestId,
      details: { doctor_id: doc.staff_id }
    });

    const updated = db.get('SELECT * FROM consultation_requests WHERE request_id = ?', [requestId]);
    return res.json({ message: 'Consultation started', consultation: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/consultations/:id/complete
 * Doctor finalizes consultation
 */
router.put('/:id/complete', authenticateToken, requireRoles('doctor'), (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { doctor_notes, recommendation } = req.body;

    db.run(`
      UPDATE consultation_requests
      SET status = 'Completed', doctor_notes = ?, completed_at = CURRENT_TIMESTAMP
      WHERE request_id = ?
    `, [doctor_notes || recommendation || 'Consultation concluded', requestId]);

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSULTATION_COMPLETED',
      resource_type: 'consultation_request',
      resource_id: requestId,
      details: { doctor_notes }
    });

    return res.json({ message: 'Consultation marked completed successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
