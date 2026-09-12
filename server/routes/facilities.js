const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { calculateDistance } = require('../services/accessibilityScore');

const router = express.Router();

/**
 * GET /api/facilities
 * Search and filter healthcare facilities with dynamic availability and metrics
 */
router.get('/', (req, res) => {
  try {
    const {
      search,
      district,
      facility_type,
      service,
      emergency_only,
      open_now,
      village_id,
      user_lat,
      user_lng,
      max_distance
    } = req.query;

    let query = `
      SELECT f.*, v.village_name, v.district,
             es.ambulance_available, es.emergency_contact, es.ambulance_phone, es.response_time_minutes,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id AND d.availability_status = 'Available') as doctors_available_count,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id) as total_doctors_count,
             (SELECT AVG(rating) FROM feedback fb WHERE fb.facility_id = f.facility_id) as average_rating,
             (SELECT COUNT(*) FROM feedback fb WHERE fb.facility_id = f.facility_id) as total_reviews_count
      FROM facilities f
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
      WHERE 1=1
    `;

    const params = [];

    // Filter by district
    if (district && district !== 'All') {
      query += ` AND v.district = ?`;
      params.push(district);
    }

    // Filter by search keyword
    if (search) {
      query += ` AND (f.facility_name LIKE ? OR f.address LIKE ? OR v.village_name LIKE ? OR v.district LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // Filter by facility type
    if (facility_type && facility_type !== 'All') {
      query += ` AND f.facility_type = ?`;
      params.push(facility_type);
    }

    // Filter by emergency availability
    if (emergency_only === 'true' || emergency_only === '1') {
      query += ` AND f.emergency_available = 1`;
    }

    // Filter by open now
    if (open_now === 'true' || open_now === '1') {
      query += ` AND f.current_status = 'Open'`;
    }

    // Filter by specific service offered
    if (service && service !== 'All') {
      query += ` AND EXISTS (
        SELECT 1 FROM services s 
        WHERE s.facility_id = f.facility_id 
        AND s.service_name LIKE ?
        AND s.availability_status = 'Available'
      )`;
      params.push(`%${service}%`);
    }

    let facilities = db.all(query, params);

    // Get origin coordinates for distance calculation
    let originLat = user_lat ? parseFloat(user_lat) : null;
    let originLng = user_lng ? parseFloat(user_lng) : null;

    if ((!originLat || !originLng) && village_id) {
      const v = db.get('SELECT latitude, longitude FROM villages WHERE village_id = ?', [parseInt(village_id)]);
      if (v) {
        originLat = v.latitude;
        originLng = v.longitude;
      }
    }

    // Enrich with distance and services summary
    facilities = facilities.map(f => {
      let distanceKm = null;
      if (originLat && originLng) {
        distanceKm = calculateDistance(originLat, originLng, f.latitude, f.longitude);
      }

      // Fetch top available services
      const facilityServices = db.all(
        "SELECT service_name, availability_status FROM services WHERE facility_id = ? AND availability_status = 'Available'",
        [f.facility_id]
      ).map(s => s.service_name);

      // Fetch medicine summary
      const medSummary = db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN stock_status = 'In Stock' THEN 1 ELSE 0 END) as in_stock,
          SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock,
          SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock
        FROM medicine_stock
        WHERE facility_id = ?
      `, [f.facility_id]);

      return {
        ...f,
        distanceKm,
        services: facilityServices,
        medicine_summary: medSummary,
        average_rating: f.average_rating ? Math.round(f.average_rating * 10) / 10 : 4.2
      };
    });

    // Filter by max distance if requested
    if (max_distance && originLat && originLng) {
      const maxDist = parseFloat(max_distance);
      facilities = facilities.filter(f => f.distanceKm !== null && f.distanceKm <= maxDist);
    }

    // Sort by distance if location available, else by beds/rating
    if (originLat && originLng) {
      facilities.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else {
      facilities.sort((a, b) => b.available_beds - a.available_beds);
    }

    return res.json({ facilities });
  } catch (err) {
    console.error('Facility search error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/facilities/availability/all
 * Real-time hospital availability board for every facility
 */
router.get('/availability/all', (req, res) => {
  try {
    const facilities = db.all(`
      SELECT f.facility_id, f.facility_name, f.facility_type, f.address, f.opening_hours,
             f.current_status, f.emergency_available, f.total_beds, f.available_beds,
             v.village_name, v.district,
             es.ambulance_available, es.emergency_contact, es.ambulance_phone,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id AND d.availability_status = 'Available') as doctors_available,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id) as total_doctors
      FROM facilities f
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
      ORDER BY f.facility_type DESC, f.available_beds DESC
    `);

    const board = facilities.map(f => {
      const activeServices = db.all(
        "SELECT service_name FROM services WHERE facility_id = ? AND availability_status = 'Available' LIMIT 5",
        [f.facility_id]
      ).map(s => s.service_name);

      const medStats = db.get(`
        SELECT 
          SUM(CASE WHEN stock_status = 'In Stock' THEN 1 ELSE 0 END) as in_stock,
          SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock
        FROM medicine_stock
        WHERE facility_id = ?
      `, [f.facility_id]);

      let medicineStatus = 'Available';
      if (medStats && medStats.out_of_stock > 2) {
        medicineStatus = 'Partial / Shortage';
      }

      return {
        ...f,
        services_preview: activeServices,
        medicine_status: medicineStatus
      };
    });

    return res.json({ availabilityBoard: board });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/facilities/emergency/nearest
 * Find nearest emergency facility from coordinates or village_id
 */
router.get('/emergency/nearest', (req, res) => {
  try {
    const { user_lat, user_lng, village_id } = req.query;

    let lat = user_lat ? parseFloat(user_lat) : null;
    let lng = user_lng ? parseFloat(user_lng) : null;

    if ((!lat || !lng) && village_id) {
      const v = db.get('SELECT latitude, longitude FROM villages WHERE village_id = ?', [parseInt(village_id)]);
      if (v) {
        lat = v.latitude;
        lng = v.longitude;
      }
    }

    // Default fallback to central rural coordinates (Shivapur) if neither provided
    if (!lat || !lng) {
      lat = 18.2851;
      lng = 73.8824;
    }

    const emergencyFacilities = db.all(`
      SELECT f.*, v.village_name, es.ambulance_available, es.emergency_contact, es.ambulance_phone, es.response_time_minutes, es.trauma_care_level,
             (SELECT COUNT(*) FROM doctors d WHERE d.facility_id = f.facility_id AND d.availability_status = 'Available') as doctors_available
      FROM facilities f
      JOIN emergency_services es ON f.facility_id = es.facility_id
      LEFT JOIN villages v ON f.village_id = v.village_id
      WHERE f.emergency_available = 1 AND f.current_status IN ('Open', 'Emergency Only')
    `);

    let nearest = null;
    let minDistance = Infinity;

    for (const ef of emergencyFacilities) {
      const d = calculateDistance(lat, lng, ef.latitude, ef.longitude);
      if (d < minDistance) {
        minDistance = d;
        nearest = { ...ef, distanceKm: d };
      }
    }

    return res.json({
      nearest_emergency_facility: nearest,
      user_location_used: { lat, lng }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/facilities/:id
 * Get full facility profile with doctors, services, medicines, and feedback
 */
router.get('/:id', (req, res) => {
  try {
    const facilityId = parseInt(req.params.id);

    const facility = db.get(`
      SELECT f.*, v.village_name, v.district, v.state,
             es.ambulance_available, es.emergency_contact, es.ambulance_phone, es.response_time_minutes, es.trauma_care_level
      FROM facilities f
      LEFT JOIN villages v ON f.village_id = v.village_id
      LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
      WHERE f.facility_id = ?
    `, [facilityId]);

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const doctors = db.all(`
      SELECT d.*, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.facility_id = ?
    `, [facilityId]);

    const services = db.all(`
      SELECT * FROM services WHERE facility_id = ?
    `, [facilityId]);

    const medicines = db.all(`
      SELECT * FROM medicine_stock WHERE facility_id = ? ORDER BY medicine_name ASC
    `, [facilityId]);

    const feedback = db.all(`
      SELECT fb.*, u.name as patient_name
      FROM feedback fb
      JOIN patients p ON fb.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      WHERE fb.facility_id = ?
      ORDER BY fb.date_submitted DESC
      LIMIT 10
    `, [facilityId]);

    const avgRating = db.get('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM feedback WHERE facility_id = ?', [facilityId]);

    return res.json({
      facility: {
        ...facility,
        average_rating: avgRating && avgRating.avg_rating ? Math.round(avgRating.avg_rating * 10) / 10 : 4.5,
        total_reviews: avgRating ? avgRating.count : 0
      },
      doctors,
      services,
      medicines,
      feedback
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/facilities/:id/availability
 * Update bed counts, open status, and emergency flag (Authorized: Doctor/Staff or Admin)
 */
router.put('/:id/availability', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const facilityId = parseInt(req.params.id);
    const { available_beds, total_beds, current_status, emergency_available } = req.body;

    const facility = db.get('SELECT * FROM facilities WHERE facility_id = ?', [facilityId]);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Role check: If doctor, ensure they belong to this facility (or allow admin)
    if (req.user.role === 'doctor') {
      const doc = db.get('SELECT facility_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
      if (!doc || doc.facility_id !== facilityId) {
        return res.status(403).json({ error: 'You are only authorized to update availability for your assigned facility.' });
      }
    }

    const updatedTotal = total_beds !== undefined ? parseInt(total_beds) : facility.total_beds;
    const updatedAvail = available_beds !== undefined ? parseInt(available_beds) : facility.available_beds;
    const updatedStatus = current_status || facility.current_status;
    const updatedEmergency = emergency_available !== undefined ? (emergency_available ? 1 : 0) : facility.emergency_available;

    if (updatedAvail > updatedTotal) {
      return res.status(400).json({ error: 'Available beds cannot exceed total beds.' });
    }

    db.run(`
      UPDATE facilities
      SET total_beds = ?, available_beds = ?, current_status = ?, emergency_available = ?
      WHERE facility_id = ?
    `, [updatedTotal, updatedAvail, updatedStatus, updatedEmergency, facilityId]);

    const updated = db.get('SELECT * FROM facilities WHERE facility_id = ?', [facilityId]);

    return res.json({
      message: 'Facility availability updated successfully',
      facility: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
