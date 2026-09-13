const db = require('../database/db');

console.log('=== CHECKING RURALCARE.DB DATASET ===\n');

// 1. Check facility count & types
const facTypes = db.db.prepare('SELECT facility_type, COUNT(*) as count FROM facilities GROUP BY facility_type').all();
console.log('Facility types in DB:');
console.table(facTypes);

// 2. Check villages count
const villageCount = db.db.prepare('SELECT COUNT(*) as count FROM villages').get();
console.log('Villages count:', villageCount.count);

// 3. Check for out-of-bounds coordinates (Maharashtra is approx Lat 15.6 - 22.1, Lng 72.6 - 80.9)
const outOfBoundsVillages = db.db.prepare(`
  SELECT village_id, village_name, district, latitude, longitude 
  FROM villages 
  WHERE latitude < 15.6 OR latitude > 22.2 OR longitude < 72.5 OR longitude > 81.0
`).all();
console.log('Out of bounds villages (lat/lng outside MH):', outOfBoundsVillages.length);
if (outOfBoundsVillages.length > 0) console.table(outOfBoundsVillages);

const outOfBoundsFacilities = db.db.prepare(`
  SELECT facility_id, facility_name, latitude, longitude, contact 
  FROM facilities 
  WHERE latitude < 15.6 OR latitude > 22.2 OR longitude < 72.5 OR longitude > 81.0
`).all();
console.log('Out of bounds facilities (lat/lng outside MH):', outOfBoundsFacilities.length);
if (outOfBoundsFacilities.length > 0) console.table(outOfBoundsFacilities);

// 4. Check contacts / phone numbers
const allContacts = db.db.prepare(`
  SELECT facility_id, facility_name, contact, address 
  FROM facilities 
  LIMIT 25
`).all();
console.log('\nSample Facility Contacts:');
console.table(allContacts);

// 5. Check District Hospitals specifically
const districtHospitals = db.db.prepare(`
  SELECT facility_id, facility_name, latitude, longitude, contact, address
  FROM facilities
  WHERE facility_type = 'Government Hospital'
  LIMIT 15
`).all();
console.log('\nDistrict Civil Hospitals:');
console.table(districtHospitals);

// 6. Check emergency services table
const emServices = db.db.prepare(`
  SELECT * FROM emergency_services LIMIT 10
`).all();
console.log('\nEmergency services count:', db.db.prepare('SELECT COUNT(*) as count FROM emergency_services').get().count);
console.table(emServices);
