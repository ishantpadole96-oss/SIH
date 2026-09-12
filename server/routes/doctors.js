const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/doctors
 * List doctors with facility and availability filters
 */
router.get('/', (req, res) => {
  try {
    const { facility_id, specialization, availability_status } = req.query;

    let query = `
      SELECT d.*, f.facility_name, f.facility_type, v.village_name
      FROM doctors d
      JOIN facilities f ON d.facility_id = f.facility_id
      LEFT JOIN villages v ON f.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (facility_id) {
      query += ` AND d.facility_id = ?`;
      params.push(parseInt(facility_id));
    }

    if (specialization) {
      query += ` AND d.specialization LIKE ?`;
      params.push(`%${specialization}%`);
    }

    if (availability_status) {
      query += ` AND d.availability_status = ?`;
      params.push(availability_status);
    }

    query += ` ORDER BY d.availability_status ASC, d.name ASC`;

    const doctors = db.all(query, params);
    return res.json({ doctors });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/doctors/:id
 * Get single doctor profile
 */
router.get('/:id', (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    const doctor = db.get(`
      SELECT d.*, f.facility_name, f.facility_type, f.address as facility_address, f.contact as facility_contact
      FROM doctors d
      JOIN facilities f ON d.facility_id = f.facility_id
      WHERE d.staff_id = ?
    `, [staffId]);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    return res.json({ doctor });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/doctors/:id/status
 * Update doctor availability and working schedule (Doctor themselves or Admin)
 */
router.put('/:id/status', authenticateToken, requireRoles('doctor', 'admin'), (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    const { availability_status, working_hours, working_days } = req.body;

    const doctor = db.get('SELECT * FROM doctors WHERE staff_id = ?', [staffId]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Role check: If doctor, must be their own profile
    if (req.user.role === 'doctor' && doctor.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You are only authorized to update your own availability status.' });
    }

    const newStatus = availability_status || doctor.availability_status;
    const newHours = working_hours || doctor.working_hours;
    const newDays = working_days || doctor.working_days;

    db.run(`
      UPDATE doctors
      SET availability_status = ?, working_hours = ?, working_days = ?
      WHERE staff_id = ?
    `, [newStatus, newHours, newDays, staffId]);

    const updated = db.get('SELECT * FROM doctors WHERE staff_id = ?', [staffId]);

    return res.json({
      message: 'Doctor schedule and availability updated',
      doctor: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
