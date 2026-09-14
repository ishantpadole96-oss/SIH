const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditLogger');

const router = express.Router();

/**
 * POST /api/prescriptions
 * Doctor: Issue an immutable, versioned digital prescription
 * (Specification Section 14)
 */
router.post('/', authenticateToken, requireRoles('doctor'), (req, res) => {
  try {
    const {
      consultation_id,
      patient_id,
      diagnosis,
      diet_lifestyle,
      instructions,
      follow_up,
      medicines = []
    } = req.body;

    if (!patient_id || medicines.length === 0) {
      return res.status(400).json({ error: 'patient_id and at least one medicine item are required.' });
    }

    const doc = db.get('SELECT staff_id, name, facility_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
    const doctorStaffId = doc ? doc.staff_id : 1;

    let createdRx;
    db.transaction(() => {
      // 1. Insert Prescription Parent Record
      const rxInsert = db.run(`
        INSERT INTO prescriptions (
          consultation_id, patient_id, doctor_id, version, status,
          diagnosis, diet_lifestyle, instructions, follow_up
        )
        VALUES (?, ?, ?, 1, 'Issued', ?, ?, ?, ?)
      `, [
        consultation_id || null,
        parseInt(patient_id),
        doctorStaffId,
        diagnosis || 'Clinical Diagnosis',
        diet_lifestyle || '',
        instructions || '',
        follow_up || 'Follow up after 7 days if symptoms persist'
      ]);

      const rxId = Number(rxInsert.lastInsertRowid);

      // 2. Insert Prescription Items
      for (const m of medicines) {
        db.run(`
          INSERT INTO prescription_items (
            prescription_id, medicine_name, strength, dose, frequency, duration, route, instructions
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rxId,
          m.name || m.medicine_name,
          m.strength || null,
          m.dose || m.dosage || '1 unit',
          m.frequency || 'Twice daily',
          m.duration || '5 days',
          m.route || 'Oral',
          m.instructions || ''
        ]);
      }

      // 3. Add to patient clinical health_records as encounter summary
      db.run(`
        INSERT INTO health_records (patient_id, doctor_id, facility_id, diagnosis_notes, prescription)
        VALUES (?, ?, ?, ?, ?)
      `, [
        parseInt(patient_id),
        doctorStaffId,
        doc ? doc.facility_id : 1,
        diagnosis || 'Clinical Diagnosis',
        medicines.map(m => `${m.name || m.medicine_name} (${m.frequency || 'OD'} x ${m.duration || '5d'})`).join('; ')
      ]);

      // 4. Notify patient
      const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [parseInt(patient_id)]);
      if (patient) {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'New Digital Prescription Issued', ?, 'general')
        `, [patient.user_id, `Dr. ${doc ? doc.name : 'Rajesh Deshmukh'} has issued a verified digital prescription (Rx #${rxId}, v1).`]);
      }

      logAuditEvent({
        actor_id: req.user.user_id,
        actor_role: req.user.role,
        action: 'PRESCRIPTION_ISSUED',
        resource_type: 'prescription',
        resource_id: rxId,
        details: { version: 1, medicine_count: medicines.length, patient_id }
      });

      createdRx = db.get(`
        SELECT p.*, d.name as doctor_name
        FROM prescriptions p
        JOIN doctors d ON p.doctor_id = d.staff_id
        WHERE p.prescription_id = ?
      `, [rxId]);
    });

    const items = db.all('SELECT * FROM prescription_items WHERE prescription_id = ?', [createdRx.prescription_id]);

    return res.status(201).json({
      message: 'Prescription issued successfully (Immutable Version 1)',
      prescription: {
        ...createdRx,
        items
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/prescriptions/:id/amend
 * Doctor: Issue an amended prescription version (v2, v3...) without silently rewriting historical record
 * (Specification Section 14)
 */
router.post('/:id/amend', authenticateToken, requireRoles('doctor'), (req, res) => {
  try {
    const parentRxId = parseInt(req.params.id);
    const { diagnosis, diet_lifestyle, instructions, follow_up, medicines = [] } = req.body;

    const oldRx = db.get('SELECT * FROM prescriptions WHERE prescription_id = ?', [parentRxId]);
    if (!oldRx) return res.status(404).json({ error: 'Original prescription not found.' });

    const nextVersion = oldRx.version + 1;
    let newRx;

    db.transaction(() => {
      // Mark old version as Amended
      db.run("UPDATE prescriptions SET status = 'Amended' WHERE prescription_id = ?", [parentRxId]);

      // Create new version
      const ins = db.run(`
        INSERT INTO prescriptions (
          consultation_id, patient_id, doctor_id, version, status,
          diagnosis, diet_lifestyle, instructions, follow_up, previous_version_id
        )
        VALUES (?, ?, ?, ?, 'Issued', ?, ?, ?, ?, ?)
      `, [
        oldRx.consultation_id,
        oldRx.patient_id,
        oldRx.doctor_id,
        nextVersion,
        diagnosis || oldRx.diagnosis,
        diet_lifestyle || oldRx.diet_lifestyle,
        instructions || oldRx.instructions,
        follow_up || oldRx.follow_up,
        parentRxId
      ]);

      const newRxId = Number(ins.lastInsertRowid);

      for (const m of medicines) {
        db.run(`
          INSERT INTO prescription_items (
            prescription_id, medicine_name, strength, dose, frequency, duration, route, instructions
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newRxId,
          m.name || m.medicine_name,
          m.strength || null,
          m.dose || m.dosage || '1 unit',
          m.frequency || 'Twice daily',
          m.duration || '5 days',
          m.route || 'Oral',
          m.instructions || ''
        ]);
      }

      logAuditEvent({
        actor_id: req.user.user_id,
        actor_role: req.user.role,
        action: 'PRESCRIPTION_AMENDED',
        resource_type: 'prescription',
        resource_id: newRxId,
        details: { old_version: oldRx.version, new_version: nextVersion, parent_prescription_id: parentRxId }
      });

      newRx = db.get('SELECT * FROM prescriptions WHERE prescription_id = ?', [newRxId]);
    });

    const items = db.all('SELECT * FROM prescription_items WHERE prescription_id = ?', [newRx.prescription_id]);

    return res.status(201).json({
      message: `Prescription amended successfully to Version ${nextVersion}`,
      prescription: {
        ...newRx,
        items
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/prescriptions/patient/:patientId
 * Get versioned prescription history for a patient
 */
router.get('/patient/:patientId', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const prescriptions = db.all(`
      SELECT p.*, d.name as doctor_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.staff_id
      WHERE p.patient_id = ?
      ORDER BY p.issued_at DESC
    `, [patientId]);

    const result = prescriptions.map(rx => ({
      ...rx,
      items: db.all('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.prescription_id])
    }));

    return res.json({ prescriptions: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
