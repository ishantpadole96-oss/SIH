const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { calculateVillageAccessibility, refreshAllVillageScores } = require('../services/accessibilityScore');

const router = express.Router();

/**
 * GET /api/villages
 * List all villages with accessibility scores & metrics
 */
router.get('/', (req, res) => {
  try {
    const villages = db.all(`
      SELECT v.*,
        (SELECT COUNT(*) FROM users WHERE village_id = v.village_id AND role = 'citizen') as resident_count,
        (SELECT COUNT(*) FROM facilities WHERE village_id = v.village_id) as facilities_count
      FROM villages v
      ORDER BY v.village_name ASC
    `);

    const enriched = villages.map(v => {
      let statusBadge = '🔴';
      let category = 'Poor/Underserved';
      if (v.accessibility_score >= 70) {
        statusBadge = '🟢';
        category = 'Good Accessibility';
      } else if (v.accessibility_score >= 45) {
        statusBadge = '🟡';
        category = 'Moderate Accessibility';
      }
      return {
        ...v,
        statusBadge,
        category
      };
    });

    return res.json({ villages: enriched });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/villages/:id
 * Get details for a single village
 */
router.get('/:id', (req, res) => {
  try {
    const villageId = parseInt(req.params.id);
    const analysis = calculateVillageAccessibility(villageId);

    if (!analysis) {
      return res.status(404).json({ error: 'Village not found' });
    }

    // Get assigned ASHA workers
    const ashaWorkers = db.all(`
      SELECT user_id, name, phone, email
      FROM users
      WHERE village_id = ? AND role = 'asha'
    `, [villageId]);

    // Get facilities inside this village
    const facilities = db.all(`
      SELECT facility_id, facility_name, facility_type, current_status, emergency_available, available_beds, total_beds
      FROM facilities
      WHERE village_id = ?
    `, [villageId]);

    return res.json({
      village: analysis,
      ashaWorkers,
      facilities
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/villages
 * Admin: Add or update a village
 */
router.post('/', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { village_name, district, state = 'Maharashtra', population = 1000, latitude, longitude } = req.body;

    if (!village_name || !district || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'village_name, district, latitude, and longitude are required' });
    }

    const insert = db.run(`
      INSERT INTO villages (village_name, district, state, population, latitude, longitude, accessibility_score)
      VALUES (?, ?, ?, ?, ?, ?, 50.0)
    `, [village_name, district, state, parseInt(population), parseFloat(latitude), parseFloat(longitude)]);

    const newId = Number(insert.lastInsertRowid);
    const analysis = calculateVillageAccessibility(newId);
    if (analysis) {
      db.run('UPDATE villages SET accessibility_score = ? WHERE village_id = ?', [analysis.score, newId]);
    }

    return res.status(201).json({
      message: 'Village added successfully',
      village: analysis
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/villages/refresh-scores
 * Recalculate accessibility scores for all villages
 */
router.post('/refresh-scores', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const updated = refreshAllVillageScores();
    return res.json({ message: 'Accessibility scores refreshed', count: updated.length, updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
