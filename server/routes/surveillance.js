const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/surveillance/alerts
 * Retrieve disease surveillance data and active outbreak alerts
 */
router.get('/alerts', (req, res) => {
  try {
    const { status, severity, category } = req.query;

    let query = `
      SELECT s.*, v.village_name, v.district, v.population,
             v.latitude, v.longitude, v.accessibility_score
      FROM disease_surveillance s
      JOIN villages v ON s.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND s.containment_status = ?`;
      params.push(status);
    }

    if (severity) {
      query += ` AND s.severity = ?`;
      params.push(severity);
    }

    if (category) {
      query += ` AND s.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY 
      CASE s.severity 
        WHEN 'Severe/Outbreak' THEN 1 
        WHEN 'Moderate' THEN 2 
        ELSE 3 
      END ASC,
      s.reported_date DESC
    `;

    const alerts = db.all(query, params);

    // High level summary metrics
    const totalActiveOutbreaks = alerts.filter(a => a.containment_status === 'Active').length;
    const severeOutbreaks = alerts.filter(a => a.severity === 'Severe/Outbreak' && a.containment_status === 'Active').length;
    const totalCases = alerts.reduce((sum, a) => sum + a.cases_reported, 0);

    return res.json({
      success: true,
      summary: {
        totalAlerts: alerts.length,
        totalActiveOutbreaks,
        severeOutbreaks,
        totalCasesReported: totalCases
      },
      alerts
    });
  } catch (err) {
    console.error('Error fetching surveillance alerts:', err);
    return res.status(500).json({ error: 'Failed to fetch surveillance data: ' + err.message });
  }
});

/**
 * POST /api/surveillance/report
 * Submit a syndromic disease cluster report (ASHA, Doctor, Admin)
 */
router.post('/report', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const {
      village_id, disease_name, category, cases_reported,
      severity, containment_status, action_taken
    } = req.body;

    if (!village_id || !disease_name || !category) {
      return res.status(400).json({ error: 'village_id, disease_name, and category are required' });
    }

    const reporterName = req.user.name + ` (${req.user.role.toUpperCase()})`;

    const result = db.run(`
      INSERT INTO disease_surveillance (
        village_id, disease_name, category, cases_reported,
        severity, containment_status, reported_by, action_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      village_id, disease_name, category,
      cases_reported || 1, severity || 'Moderate',
      containment_status || 'Active', reporterName,
      action_taken || null
    ]);

    // Also generate an automated notification for health administrators
    const adminUser = db.get(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminUser) {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `, [
        adminUser.user_id,
        `⚠️ New Disease Alert: ${disease_name}`,
        `${cases_reported || 1} cases of ${disease_name} reported in Village #${village_id} with severity ${severity || 'Moderate'}.`,
        'general'
      ]);
    }

    return res.status(201).json({
      success: true,
      message: 'Surveillance report filed successfully',
      report_id: Number(result.lastInsertRowid)
    });
  } catch (err) {
    console.error('Error filing surveillance report:', err);
    return res.status(500).json({ error: 'Failed to submit surveillance report: ' + err.message });
  }
});

/**
 * PUT /api/surveillance/:id/containment
 * Update containment status and action plan (Admin or Doctor)
 */
router.put('/:id/containment', authenticateToken, requireRoles('doctor', 'admin'), (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { containment_status, action_taken } = req.body;

    if (!containment_status) {
      return res.status(400).json({ error: 'containment_status is required' });
    }

    db.run(`
      UPDATE disease_surveillance
      SET containment_status = ?, action_taken = COALESCE(?, action_taken)
      WHERE report_id = ?
    `, [containment_status, action_taken, reportId]);

    const updated = db.get(`SELECT * FROM disease_surveillance WHERE report_id = ?`, [reportId]);
    return res.json({ success: true, alert: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
