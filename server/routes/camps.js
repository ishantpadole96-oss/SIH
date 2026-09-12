const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/camps
 * List upcoming and ongoing health camps with village and facility details
 */
router.get('/', (req, res) => {
  try {
    const { village_id, status } = req.query;

    let query = `
      SELECT hc.*, f.facility_name, f.facility_type, f.contact as facility_contact,
             v.village_name, v.district,
             (SELECT COUNT(*) FROM camp_registrations cr WHERE cr.camp_id = hc.camp_id) as total_registered
      FROM health_camps hc
      JOIN facilities f ON hc.facility_id = f.facility_id
      JOIN villages v ON hc.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (village_id) {
      query += ` AND hc.village_id = ?`;
      params.push(parseInt(village_id));
    }

    if (status) {
      query += ` AND hc.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY hc.camp_date ASC`;

    const camps = db.all(query, params);
    return res.json({ camps });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/camps/:id/register
 * Citizen: Register for a health camp
 */
router.post('/:id/register', authenticateToken, (req, res) => {
  try {
    const campId = parseInt(req.params.id);

    const camp = db.get('SELECT * FROM health_camps WHERE camp_id = ?', [campId]);
    if (!camp) {
      return res.status(404).json({ error: 'Health camp not found' });
    }

    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found for this user.' });
    }

    // Check if already registered
    const existing = db.get('SELECT registration_id FROM camp_registrations WHERE camp_id = ? AND patient_id = ?', [campId, patient.patient_id]);
    if (existing) {
      return res.status(409).json({ error: 'You are already registered for this health camp.' });
    }

    db.run(`
      INSERT INTO camp_registrations (camp_id, patient_id)
      VALUES (?, ?)
    `, [campId, patient.patient_id]);

    // Send confirmation notification
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Health Camp Registration Confirmed', ?, 'camp')
    `, [req.user.user_id, `You are registered for "${camp.camp_name}" on ${camp.camp_date} at ${camp.location}.`]);

    return res.status(201).json({
      message: 'Successfully registered for health camp!',
      camp_name: camp.camp_name,
      date: camp.camp_date,
      location: camp.location
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/camps/my
 * Citizen: List registered camps
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) return res.status(404).json({ error: 'Patient profile not found.' });

    const registeredCamps = db.all(`
      SELECT hc.*, cr.registered_at, cr.attended,
             f.facility_name, v.village_name
      FROM camp_registrations cr
      JOIN health_camps hc ON cr.camp_id = hc.camp_id
      JOIN facilities f ON hc.facility_id = f.facility_id
      JOIN villages v ON hc.village_id = v.village_id
      WHERE cr.patient_id = ?
      ORDER BY hc.camp_date ASC
    `, [patient.patient_id]);

    return res.json({ registeredCamps });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/camps
 * Staff / Admin: Create/Schedule a new health camp
 */
router.post('/', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const { facility_id, village_id, camp_name, location, camp_date, start_time, end_time, services_offered, target_audience } = req.body;

    if (!facility_id || !village_id || !camp_name || !location || !camp_date || !start_time || !end_time || !services_offered) {
      return res.status(400).json({ error: 'All fields are required to schedule a health camp.' });
    }

    const insert = db.run(`
      INSERT INTO health_camps (facility_id, village_id, camp_name, location, camp_date, start_time, end_time, services_offered, target_audience, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming')
    `, [
      parseInt(facility_id),
      parseInt(village_id),
      camp_name,
      location,
      camp_date,
      start_time,
      end_time,
      services_offered,
      target_audience || 'All Villagers'
    ]);

    const created = db.get('SELECT * FROM health_camps WHERE camp_id = ?', [Number(insert.lastInsertRowid)]);

    // Broadcast notification to residents of that village
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT u.user_id, 'New Health Camp Announced in Your Village', ?, 'camp'
      FROM users u WHERE u.village_id = ?
    `, [`Upcoming: ${camp_name} on ${camp_date} at ${location}. Services: ${services_offered}`, parseInt(village_id)]);

    return res.status(201).json({
      message: 'Health camp scheduled successfully',
      camp: created
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
