const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/appointments
 * Book a new appointment
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { facility_id, doctor_id, appointment_date, appointment_time, reason, patient_id: reqPatientId } = req.body;

    if (!facility_id || !doctor_id || !appointment_date || !appointment_time || !reason) {
      return res.status(400).json({ error: 'Facility, Doctor, Date, Time, and Reason are required.' });
    }

    // Determine target patient_id
    let targetPatientId;
    if (req.user.role === 'citizen') {
      const p = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
      if (!p) {
        return res.status(404).json({ error: 'Patient profile not found for this user.' });
      }
      targetPatientId = p.patient_id;
    } else {
      // ASHA or Doctor booking for a patient
      if (!reqPatientId) {
        return res.status(400).json({ error: 'Patient ID is required when booking as healthcare worker.' });
      }
      targetPatientId = parseInt(reqPatientId);
    }

    // Validate facility and doctor exist
    const facility = db.get('SELECT facility_name FROM facilities WHERE facility_id = ?', [parseInt(facility_id)]);
    if (!facility) return res.status(404).json({ error: 'Selected facility not found.' });

    const doctor = db.get('SELECT staff_id, user_id, name FROM doctors WHERE staff_id = ?', [parseInt(doctor_id)]);
    if (!doctor) return res.status(404).json({ error: 'Selected doctor not found.' });

    // Validate doctor belongs to facility
    const docInFac = db.get('SELECT staff_id FROM doctors WHERE staff_id = ? AND facility_id = ?', [parseInt(doctor_id), parseInt(facility_id)]);
    if (!docInFac) {
      return res.status(400).json({ error: 'Selected doctor does not practice at this facility.' });
    }

    let appointment;
    db.transaction(() => {
      const insert = db.run(`
        INSERT INTO appointments (patient_id, facility_id, doctor_id, appointment_date, appointment_time, status, reason)
        VALUES (?, ?, ?, ?, ?, 'Scheduled', ?)
      `, [targetPatientId, parseInt(facility_id), parseInt(doctor_id), appointment_date, appointment_time, reason]);

      const appointmentId = Number(insert.lastInsertRowid);

      // Notify citizen
      const patientUser = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [targetPatientId]);
      if (patientUser) {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Appointment Confirmed', ?, 'appointment')
        `, [patientUser.user_id, `Your appointment with ${doctor.name} at ${facility.facility_name} is confirmed for ${appointment_date} at ${appointment_time}.`]);
      }

      // Notify doctor
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'New Appointment Booked', ?, 'appointment')
      `, [doctor.user_id, `A new consultation has been booked for ${appointment_date} at ${appointment_time}. Reason: ${reason}`]);

      appointment = db.get(`
        SELECT a.*, d.name as doctor_name, d.specialization, f.facility_name, f.facility_type, f.address
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.staff_id
        JOIN facilities f ON a.facility_id = f.facility_id
        WHERE a.appointment_id = ?
      `, [appointmentId]);
    });

    return res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/appointments/my
 * Citizen: Get all personal appointments
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const appointments = db.all(`
      SELECT a.*, d.name as doctor_name, d.specialization, f.facility_name, f.facility_type, f.contact as facility_contact
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.staff_id
      JOIN facilities f ON a.facility_id = f.facility_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [patient.patient_id]);

    return res.json({ appointments });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/appointments/doctor/today
 * Doctor: Get appointments scheduled for logged-in doctor
 */
router.get('/doctor/today', authenticateToken, requireRoles('doctor', 'admin'), (req, res) => {
  try {
    let doctorId;
    if (req.user.role === 'doctor') {
      const doc = db.get('SELECT staff_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
      if (!doc) return res.status(404).json({ error: 'Doctor staff record not found.' });
      doctorId = doc.staff_id;
    } else {
      doctorId = req.query.doctor_id ? parseInt(req.query.doctor_id) : 1;
    }

    const today = new Date().toISOString().split('T')[0];

    const appointments = db.all(`
      SELECT a.*, u.name as patient_name, u.age as patient_age, u.gender as patient_gender, u.phone as patient_phone,
             p.blood_group, p.existing_conditions, p.allergies,
             f.facility_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      JOIN facilities f ON a.facility_id = f.facility_id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `, [doctorId]);

    return res.json({
      todayDate: today,
      appointments
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/appointments/:id/status
 * Update appointment status (Doctor / Staff / Admin)
 */
router.put('/:id/status', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status, doctor_notes } = req.body;

    if (!status || !['Scheduled', 'Completed', 'Cancelled', 'No Show'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required (Scheduled, Completed, Cancelled, No Show)' });
    }

    const apt = db.get('SELECT * FROM appointments WHERE appointment_id = ?', [appointmentId]);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    db.run(`
      UPDATE appointments
      SET status = ?, doctor_notes = COALESCE(?, doctor_notes)
      WHERE appointment_id = ?
    `, [status, doctor_notes || null, appointmentId]);

    // Notify patient
    const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [apt.patient_id]);
    if (patient) {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Appointment Status Updated', ?, 'appointment')
      `, [patient.user_id, `Your appointment status has been updated to "${status}". Notes: ${doctor_notes || 'None'}`]);
    }

    const updated = db.get(`
      SELECT a.*, d.name as doctor_name, f.facility_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.staff_id
      JOIN facilities f ON a.facility_id = f.facility_id
      WHERE a.appointment_id = ?
    `, [appointmentId]);

    return res.json({
      message: 'Appointment status updated successfully',
      appointment: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
