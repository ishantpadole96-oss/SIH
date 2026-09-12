const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/complaints
 * Citizen: File a new complaint against a healthcare facility
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { facility_id, complaint_type, description } = req.body;

    if (!facility_id || !complaint_type || !description) {
      return res.status(400).json({ error: 'facility_id, complaint_type, and description are required.' });
    }

    const validTypes = [
      'Doctor Unavailable', 
      'Medicine Unavailable', 
      'Facility Closed', 
      'Long Waiting Time', 
      'Service Unavailable', 
      'Poor Service', 
      'Equipment Unavailable', 
      'Other'
    ];

    if (!validTypes.includes(complaint_type)) {
      return res.status(400).json({ error: `Invalid complaint type. Valid types: ${validTypes.join(', ')}` });
    }

    // Resolve patient_id for current citizen
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const facility = db.get('SELECT facility_name FROM facilities WHERE facility_id = ?', [parseInt(facility_id)]);
    if (!facility) {
      return res.status(404).json({ error: 'Target facility not found.' });
    }

    let complaint;
    db.transaction(() => {
      const insert = db.run(`
        INSERT INTO complaints (patient_id, facility_id, complaint_type, description, status)
        VALUES (?, ?, ?, ?, 'Submitted')
      `, [patient.patient_id, parseInt(facility_id), complaint_type, description]);

      const complaintId = Number(insert.lastInsertRowid);

      // Notify citizen of submission
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Grievance Ticket Registered', ?, 'complaint')
      `, [req.user.user_id, `Your complaint #${complaintId} regarding "${complaint_type}" at ${facility.facility_name} has been submitted.`]);

      // Notify admins
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        SELECT u.user_id, 'New Citizen Grievance Logged', ?, 'complaint'
        FROM users u WHERE u.role = 'admin' LIMIT 2
      `, [`New grievance #${complaintId} filed by ${req.user.name} regarding ${complaint_type} at ${facility.facility_name}.`]);

      complaint = db.get(`
        SELECT c.*, f.facility_name, f.facility_type
        FROM complaints c
        JOIN facilities f ON c.facility_id = f.facility_id
        WHERE c.complaint_id = ?
      `, [complaintId]);
    });

    return res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/complaints/my
 * Citizen: Track personal complaints & admin responses
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const complaints = db.all(`
      SELECT c.*, f.facility_name, f.facility_type, v.village_name
      FROM complaints c
      JOIN facilities f ON c.facility_id = f.facility_id
      LEFT JOIN villages v ON f.village_id = v.village_id
      WHERE c.patient_id = ?
      ORDER BY c.created_at DESC
    `, [patient.patient_id]);

    return res.json({ complaints });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/complaints
 * Admin / Staff: List all complaints with status and facility filters
 */
router.get('/', authenticateToken, requireRoles('admin', 'doctor', 'asha'), (req, res) => {
  try {
    const { status, facility_id, complaint_type } = req.query;

    let query = `
      SELECT c.*, 
             f.facility_name, f.facility_type,
             u.name as patient_name, u.phone as patient_phone, v.village_name
      FROM complaints c
      JOIN facilities f ON c.facility_id = f.facility_id
      JOIN patients p ON c.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN villages v ON u.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (facility_id) {
      query += ` AND c.facility_id = ?`;
      params.push(parseInt(facility_id));
    }

    if (complaint_type) {
      query += ` AND c.complaint_type = ?`;
      params.push(complaint_type);
    }

    query += ` ORDER BY c.status = 'Submitted' DESC, c.status = 'In Progress' DESC, c.created_at DESC`;

    const complaints = db.all(query, params);
    return res.json({ complaints });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/complaints/:id/status
 * Admin: Update complaint lifecycle (Submitted -> In Progress -> Resolved) and add response
 */
router.put('/:id/status', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { status, admin_response } = req.body;

    if (!status || !['Submitted', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: Submitted, In Progress, Resolved' });
    }

    const complaint = db.get('SELECT * FROM complaints WHERE complaint_id = ?', [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const resolvedAt = status === 'Resolved' ? new Date().toISOString() : null;

    db.run(`
      UPDATE complaints
      SET status = ?, 
          admin_response = COALESCE(?, admin_response),
          resolved_at = CASE WHEN ? = 'Resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
      WHERE complaint_id = ?
    `, [status, admin_response || null, status, complaintId]);

    // Notify citizen
    const patient = db.get('SELECT user_id FROM patients WHERE patient_id = ?', [complaint.patient_id]);
    if (patient) {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Grievance Status Update', ?, 'complaint')
      `, [patient.user_id, `Your grievance #${complaintId} has been updated to "${status}". ${admin_response ? 'Admin Note: ' + admin_response : ''}`]);
    }

    const updated = db.get(`
      SELECT c.*, f.facility_name
      FROM complaints c
      JOIN facilities f ON c.facility_id = f.facility_id
      WHERE c.complaint_id = ?
    `, [complaintId]);

    return res.json({
      message: 'Complaint status and admin response updated successfully',
      complaint: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
