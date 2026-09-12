const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/feedback
 * Citizen: Submit facility rating (1-5) and review
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { facility_id, rating, feedback_text } = req.body;

    if (!facility_id || !rating) {
      return res.status(400).json({ error: 'facility_id and rating (1-5) are required' });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const facility = db.get('SELECT facility_name FROM facilities WHERE facility_id = ?', [parseInt(facility_id)]);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const insert = db.run(`
      INSERT INTO feedback (patient_id, facility_id, rating, feedback_text)
      VALUES (?, ?, ?, ?)
    `, [patient.patient_id, parseInt(facility_id), numRating, feedback_text || null]);

    const created = db.get('SELECT * FROM feedback WHERE feedback_id = ?', [Number(insert.lastInsertRowid)]);

    return res.status(201).json({
      message: 'Thank you for submitting facility feedback!',
      feedback: created
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/feedback/facility/:facilityId
 * Get reviews and average star ratings for a facility
 */
router.get('/facility/:facilityId', (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId);

    const reviews = db.all(`
      SELECT fb.*, u.name as patient_name
      FROM feedback fb
      JOIN patients p ON fb.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      WHERE fb.facility_id = ?
      ORDER BY fb.date_submitted DESC
    `, [facilityId]);

    const stats = db.get(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as stars_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as stars_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as stars_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as stars_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as stars_1
      FROM feedback
      WHERE facility_id = ?
    `, [facilityId]);

    return res.json({
      facility_id: facilityId,
      stats: {
        total_reviews: stats ? stats.total_reviews : 0,
        average_rating: stats && stats.average_rating ? Math.round(stats.average_rating * 10) / 10 : 4.5,
        rating_distribution: {
          5: stats ? stats.stars_5 : 0,
          4: stats ? stats.stars_4 : 0,
          3: stats ? stats.stars_3 : 0,
          2: stats ? stats.stars_2 : 0,
          1: stats ? stats.stars_1 : 0
        }
      },
      reviews
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/feedback/my
 * Citizen: Get all feedback submitted by logged-in user
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) return res.status(404).json({ error: 'Patient profile not found.' });

    const feedbackList = db.all(`
      SELECT fb.*, f.facility_name, f.facility_type
      FROM feedback fb
      JOIN facilities f ON fb.facility_id = f.facility_id
      WHERE fb.patient_id = ?
      ORDER BY fb.date_submitted DESC
    `, [patient.patient_id]);

    return res.json({ feedback: feedbackList });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
