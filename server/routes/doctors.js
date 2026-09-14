const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/doctors
 * List doctors with facility, availability, and district filters
 */
router.get('/', (req, res) => {
  try {
    const { facility_id, specialization, availability_status, district } = req.query;

    let query = `
      SELECT d.*, f.facility_name, f.facility_type, v.village_name, v.district,
             u.email, u.phone
      FROM doctors d
      JOIN facilities f ON d.facility_id = f.facility_id
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (facility_id) {
      query += ` AND d.facility_id = ?`;
      params.push(parseInt(facility_id));
    }

    if (district && district !== 'All') {
      query += ` AND v.district = ?`;
      params.push(district);
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
 * POST /api/doctors
 * Admin: Appoint/add a new doctor and assign to a village or group of villages
 */
router.post('/', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization = 'General Medicine',
      facility_id,
      assigned_villages = 'Shivapur, Khedgaon',
      working_days = 'Mon-Sat',
      working_hours = '09:00 AM - 05:00 PM',
      availability_status = 'Available'
    } = req.body;

    if (!name || !facility_id) {
      return res.status(400).json({ error: 'Doctor name and facility_id are required' });
    }

    const cleanEmail = (email && email.trim()) || `dr.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now().toString().slice(-4)}@ruralcare.in`;
    const cleanPhone = (phone && phone.trim()) || `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    let newDoctor;
    db.transaction(() => {
      // 1. Find or create user
      let user = db.get('SELECT user_id FROM users WHERE email = ? OR phone = ?', [cleanEmail, cleanPhone]);
      let userId;
      if (!user) {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const passHash = bcrypt.hashSync('Demo@123', salt);
        const insUser = db.run(`
          INSERT INTO users (name, email, phone, role, password_hash)
          VALUES (?, ?, ?, 'doctor', ?)
        `, [name, cleanEmail, cleanPhone, passHash]);
        userId = Number(insUser.lastInsertRowid);
      } else {
        userId = user.user_id;
        db.run('UPDATE users SET role = "doctor" WHERE user_id = ?', [userId]);
      }

      // 2. Insert into doctors table with assigned_villages
      const insDoc = db.run(`
        INSERT INTO doctors (user_id, facility_id, name, specialization, availability_status, working_days, working_hours, assigned_villages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        parseInt(facility_id),
        name,
        specialization,
        availability_status,
        working_days,
        working_hours,
        Array.isArray(assigned_villages) ? assigned_villages.join(', ') : assigned_villages
      ]);

      const staffId = Number(insDoc.lastInsertRowid);
      newDoctor = db.get(`
        SELECT d.*, f.facility_name, f.facility_type, v.village_name, v.district, u.email, u.phone
        FROM doctors d
        JOIN facilities f ON d.facility_id = f.facility_id
        LEFT JOIN villages v ON f.village_id = v.village_id
        LEFT JOIN users u ON d.user_id = u.user_id
        WHERE d.staff_id = ?
      `, [staffId]);
    });

    return res.status(201).json({
      message: `Dr. ${name} successfully appointed and assigned to: ${newDoctor.assigned_villages}`,
      doctor: newDoctor
    });
  } catch (err) {
    console.error('Appoint doctor error:', err);
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
