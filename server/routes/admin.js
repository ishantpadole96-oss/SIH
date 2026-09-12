const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { calculateVillageAccessibility } = require('../services/accessibilityScore');

const router = express.Router();

/**
 * GET /api/admin/analytics/overview
 * High-level executive KPI metrics computed from live relational database
 */
router.get('/analytics/overview', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    // Total facilities
    const totalFacilities = db.get('SELECT COUNT(*) as count FROM facilities');

    // Total registered patients
    const totalPatients = db.get('SELECT COUNT(*) as count FROM patients');

    // Doctors & staffing
    const doctorsCount = db.get(`
      SELECT 
        COUNT(*) as total_doctors,
        SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as available_doctors
      FROM doctors
    `);

    // Bed capacity & occupancy
    const bedStats = db.get(`
      SELECT 
        SUM(total_beds) as total_beds,
        SUM(available_beds) as available_beds
      FROM facilities
    `);

    // Medicine shortages
    const medicineStats = db.get(`
      SELECT 
        COUNT(*) as total_medicines,
        SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock
      FROM medicine_stock
    `);

    // Complaints
    const complaintStats = db.get(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `);

    // Referrals
    const referralStats = db.get(`
      SELECT 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM referrals
    `);

    // Overall ratings
    const ratingStats = db.get(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM feedback
    `);

    // Villages population and coverage
    const villageStats = db.get(`
      SELECT 
        COUNT(*) as total_villages,
        SUM(population) as total_population,
        AVG(accessibility_score) as avg_accessibility_score,
        SUM(CASE WHEN accessibility_score < 45 THEN 1 ELSE 0 END) as underserved_villages_count
      FROM villages
    `);

    // Total screenings & risk breakdown
    const screeningStats = db.get(`
      SELECT 
        COUNT(*) as total_screenings,
        SUM(CASE WHEN ai_risk_level = 'High' OR ai_risk_level = 'Emergency' THEN 1 ELSE 0 END) as critical_cases
      FROM screenings
    `);

    return res.json({
      overview: {
        total_facilities: totalFacilities ? totalFacilities.count : 0,
        total_patients: totalPatients ? totalPatients.count : 0,
        doctors: {
          total: doctorsCount ? doctorsCount.total_doctors : 0,
          available: doctorsCount ? doctorsCount.available_doctors : 0
        },
        beds: {
          total: bedStats ? bedStats.total_beds : 0,
          available: bedStats ? bedStats.available_beds : 0,
          occupied: bedStats ? (bedStats.total_beds - bedStats.available_beds) : 0,
          occupancy_rate: bedStats && bedStats.total_beds > 0 ? Math.round(((bedStats.total_beds - bedStats.available_beds) / bedStats.total_beds) * 100) : 0
        },
        medicine_shortages: {
          out_of_stock: medicineStats ? medicineStats.out_of_stock : 0,
          low_stock: medicineStats ? medicineStats.low_stock : 0,
          total_monitored: medicineStats ? medicineStats.total_medicines : 0
        },
        complaints: {
          total: complaintStats ? complaintStats.total_complaints : 0,
          active_pending: complaintStats ? (complaintStats.submitted + complaintStats.in_progress) : 0,
          resolved: complaintStats ? complaintStats.resolved : 0,
          resolution_rate: complaintStats && complaintStats.total_complaints > 0 ? Math.round((complaintStats.resolved / complaintStats.total_complaints) * 100) : 0
        },
        referrals: {
          total: referralStats ? referralStats.total_referrals : 0,
          pending: referralStats ? referralStats.pending : 0,
          completed: referralStats ? referralStats.completed : 0,
          completion_rate: referralStats && referralStats.total_referrals > 0 ? Math.round((referralStats.completed / referralStats.total_referrals) * 100) : 0
        },
        average_facility_rating: ratingStats && ratingStats.avg_rating ? Math.round(ratingStats.avg_rating * 10) / 10 : 4.4,
        total_reviews: ratingStats ? ratingStats.total_reviews : 0,
        villages: {
          total: villageStats ? villageStats.total_villages : 0,
          total_population: villageStats ? villageStats.total_population : 0,
          avg_accessibility: villageStats && villageStats.avg_accessibility_score ? Math.round(villageStats.avg_accessibility_score * 10) / 10 : 60.5,
          underserved_count: villageStats ? villageStats.underserved_villages_count : 0
        },
        screenings: {
          total: screeningStats ? screeningStats.total_screenings : 0,
          critical: screeningStats ? screeningStats.critical_cases : 0
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/accessibility
 * Underserved village analysis and accessibility rankings
 */
router.get('/analytics/accessibility', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const villages = db.all('SELECT village_id FROM villages ORDER BY village_id ASC');
    const analyses = [];

    for (const v of villages) {
      const a = calculateVillageAccessibility(v.village_id);
      if (a) analyses.push(a);
    }

    // Sort ascending by score (lowest/most underserved first)
    analyses.sort((a, b) => a.score - b.score);

    const underserved = analyses.filter(v => v.score < 45);
    const moderate = analyses.filter(v => v.score >= 45 && v.score < 70);
    const good = analyses.filter(v => v.score >= 70);

    return res.json({
      summary: {
        total_analyzed: analyses.length,
        underserved_count: underserved.length,
        moderate_count: moderate.length,
        good_count: good.length
      },
      underserved_villages: underserved,
      all_villages_ranking: analyses
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/quality
 * Comparative healthcare quality charts & performance metrics
 */
router.get('/analytics/quality', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    // 1. Facility ratings breakdown
    const facilityRatings = db.all(`
      SELECT f.facility_id, f.facility_name, f.facility_type,
             AVG(fb.rating) as avg_rating,
             COUNT(fb.feedback_id) as review_count
      FROM facilities f
      LEFT JOIN feedback fb ON f.facility_id = fb.facility_id
      GROUP BY f.facility_id
      ORDER BY avg_rating DESC
    `).map(f => ({
      ...f,
      avg_rating: f.avg_rating ? Math.round(f.avg_rating * 10) / 10 : 4.0
    }));

    // 2. Complaint categories breakdown
    const complaintsByType = db.all(`
      SELECT complaint_type, COUNT(*) as count
      FROM complaints
      GROUP BY complaint_type
      ORDER BY count DESC
    `);

    // 3. Medicine shortage distribution across facilities
    const shortagesByFacility = db.all(`
      SELECT f.facility_name, f.facility_type,
             SUM(CASE WHEN m.stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock,
             SUM(CASE WHEN m.stock_status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock
      FROM facilities f
      LEFT JOIN medicine_stock m ON f.facility_id = m.facility_id
      GROUP BY f.facility_id
      ORDER BY out_of_stock DESC
    `);

    // 4. Referral completion rate per facility
    const referralRates = db.all(`
      SELECT f.facility_name,
             COUNT(r.referral_id) as total_referrals,
             SUM(CASE WHEN r.status = 'Completed' THEN 1 ELSE 0 END) as completed,
             SUM(CASE WHEN r.status = 'Pending' THEN 1 ELSE 0 END) as pending
      FROM facilities f
      LEFT JOIN referrals r ON f.facility_id = r.referring_facility_id
      GROUP BY f.facility_id
    `);

    return res.json({
      facilityRatings,
      complaintsByType,
      shortagesByFacility,
      referralRates
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/gis-map
 * Comprehensive GIS dataset for rendering the interactive rural healthcare map
 */
router.get('/analytics/gis-map', (req, res) => {
  try {
    const villages = db.all(`
      SELECT v.*,
        (SELECT COUNT(*) FROM users WHERE village_id = v.village_id AND role = 'citizen') as resident_count
      FROM villages v
    `).map(v => {
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
        type: 'village',
        statusBadge,
        category
      };
    });

    const facilities = db.all(`
      SELECT f.*, v.village_name, es.ambulance_available, es.emergency_contact, es.ambulance_phone,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id AND d.availability_status = 'Available') as doctors_available,
             (SELECT AVG(rating) FROM feedback fb WHERE fb.facility_id = f.facility_id) as average_rating
      FROM facilities f
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
    `).map(f => ({
      ...f,
      type: 'facility',
      average_rating: f.average_rating ? Math.round(f.average_rating * 10) / 10 : 4.5
    }));

    return res.json({
      center: { lat: 19.75, lng: 75.71, zoom: 7 },
      villages,
      facilities
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
