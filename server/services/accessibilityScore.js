const db = require('../database/db');

/**
 * Calculate Haversine distance in kilometers between two geo-coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Calculate dynamic accessibility score (0 to 100) for a given village
 */
function calculateVillageAccessibility(villageId) {
  const village = db.get('SELECT * FROM villages WHERE village_id = ?', [villageId]);
  if (!village) return null;

  const facilities = db.all(`
    SELECT f.*, es.ambulance_available, es.response_time_minutes
    FROM facilities f
    LEFT JOIN emergency_services es ON f.facility_id = es.facility_id
  `);

  if (!facilities.length) {
    return { score: 10, category: 'Poor/Underserved', statusBadge: '🔴' };
  }

  // Find nearest facility
  let nearestFacility = null;
  let minDistance = Infinity;
  let nearestEmergencyFacility = null;
  let minEmergencyDistance = Infinity;

  for (const f of facilities) {
    const dist = calculateDistance(village.latitude, village.longitude, f.latitude, f.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestFacility = { ...f, distanceKm: dist };
    }
    if (f.emergency_available && dist < minEmergencyDistance) {
      minEmergencyDistance = dist;
      nearestEmergencyFacility = { ...f, distanceKm: dist };
    }
  }

  let score = 0;

  // 1. Proximity score (Max 30 pts)
  if (minDistance <= 3.0) score += 30;
  else if (minDistance <= 6.0) score += 24;
  else if (minDistance <= 10.0) score += 18;
  else if (minDistance <= 15.0) score += 10;
  else score += 3;

  // 2. Emergency response & ambulance score (Max 20 pts)
  if (nearestEmergencyFacility) {
    if (minEmergencyDistance <= 5.0 && nearestEmergencyFacility.ambulance_available) score += 20;
    else if (minEmergencyDistance <= 12.0 && nearestEmergencyFacility.ambulance_available) score += 14;
    else if (nearestEmergencyFacility.ambulance_available) score += 8;
    else score += 4;
  }

  // 3. Doctor availability score at nearest facility (Max 20 pts)
  if (nearestFacility) {
    const doctors = db.all(
      "SELECT COUNT(*) as count FROM doctors WHERE facility_id = ? AND availability_status = 'Available'",
      [nearestFacility.facility_id]
    );
    const availableDocs = doctors[0] ? doctors[0].count : 0;
    if (availableDocs >= 3) score += 20;
    else if (availableDocs >= 1) score += 14;
    else score += 2;
  }

  // 4. Medicine stock level score (Max 15 pts)
  if (nearestFacility) {
    const meds = db.all(
      'SELECT stock_status, COUNT(*) as count FROM medicine_stock WHERE facility_id = ? GROUP BY stock_status',
      [nearestFacility.facility_id]
    );
    let totalMeds = 0;
    let inStock = 0;
    for (const m of meds) {
      totalMeds += m.count;
      if (m.stock_status === 'In Stock') inStock += m.count;
    }
    const ratio = totalMeds > 0 ? inStock / totalMeds : 0;
    if (ratio >= 0.8) score += 15;
    else if (ratio >= 0.5) score += 10;
    else score += 3;
  }

  // 5. Bed availability score (Max 15 pts)
  if (nearestFacility) {
    const availBeds = nearestFacility.available_beds || 0;
    if (availBeds >= 15) score += 15;
    else if (availBeds >= 5) score += 10;
    else if (availBeds >= 1) score += 5;
    else score += 0;
  }

  const roundedScore = Math.min(100, Math.max(0, Math.round(score * 10) / 10));

  let category = 'Poor/Underserved';
  let statusBadge = '🔴';
  if (roundedScore >= 70) {
    category = 'Good Accessibility';
    statusBadge = '🟢';
  } else if (roundedScore >= 45) {
    category = 'Moderate Accessibility';
    statusBadge = '🟡';
  }

  return {
    village_id: village.village_id,
    village_name: village.village_name,
    district: village.district,
    population: village.population,
    latitude: village.latitude,
    longitude: village.longitude,
    score: roundedScore,
    category,
    statusBadge,
    nearest_facility: nearestFacility ? {
      name: nearestFacility.facility_name,
      type: nearestFacility.facility_type,
      distanceKm: nearestFacility.distanceKm
    } : null,
    nearest_emergency: nearestEmergencyFacility ? {
      name: nearestEmergencyFacility.facility_name,
      distanceKm: nearestEmergencyFacility.distanceKm,
      ambulance_available: !!nearestEmergencyFacility.ambulance_available
    } : null
  };
}

/**
 * Re-evaluate and persist accessibility scores for all villages
 */
function refreshAllVillageScores() {
  const villages = db.all('SELECT village_id FROM villages');
  const results = [];
  
  for (const v of villages) {
    const analysis = calculateVillageAccessibility(v.village_id);
    if (analysis) {
      db.run(
        'UPDATE villages SET accessibility_score = ? WHERE village_id = ?',
        [analysis.score, analysis.village_id]
      );
      results.push(analysis);
    }
  }
  return results;
}

module.exports = {
  calculateDistance,
  calculateVillageAccessibility,
  refreshAllVillageScores
};
