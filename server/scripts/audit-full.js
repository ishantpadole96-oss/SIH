const db = require('../database/db');

console.log('=== FULL DATABASE AUDIT ===\n');

// 1. Facilities Phone length check by STD code type
const facilities = db.db.prepare('SELECT facility_id, facility_name, contact, address, latitude, longitude, village_id FROM facilities').all();
console.log('Total Facilities:', facilities.length);

let malformedPhones = [];
facilities.forEach(f => {
  const parts = f.contact ? f.contact.split('-') : [];
  if (parts.length === 2) {
    const std = parts[0];
    const num = parts[1];
    // std 020, 022 must have 8-digit num
    if (['020', '022'].includes(std) && num.length !== 8) {
      malformedPhones.push({ id: f.facility_id, name: f.facility_name, contact: f.contact, reason: `${std} requires 8 digits, has ${num.length}` });
    }
    // std 4-digit like 0253, 0240, 0712 must have 7-digit num
    else if (std.length === 4 && num.length !== 7) {
      malformedPhones.push({ id: f.facility_id, name: f.facility_name, contact: f.contact, reason: `${std} requires 7 digits, has ${num.length}` });
    }
    // std 5-digit like 02525, 02135 must have 6-digit num
    else if (std.length === 5 && num.length !== 6) {
      malformedPhones.push({ id: f.facility_id, name: f.facility_name, contact: f.contact, reason: `${std} requires 6 digits, has ${num.length}` });
    }
  } else {
    malformedPhones.push({ id: f.facility_id, name: f.facility_name, contact: f.contact, reason: 'No hyphen format' });
  }
});
console.log(`Malformed facility phone numbers: ${malformedPhones.length}`);
if (malformedPhones.length > 0) {
  console.log('First 10 malformed phones:');
  console.table(malformedPhones.slice(0, 10));
}

// 2. Health camps audit
const camps = db.db.prepare('SELECT camp_id, title, location, district, start_date, end_date, contact_number FROM health_camps').all();
console.log('\nHealth camps count:', camps.length);
console.table(camps);

// 3. Patients audit
const patients = db.db.prepare('SELECT patient_id, name, age, gender, phone, village_id, emergency_contact FROM patients LIMIT 10').all();
console.log('\nPatients sample:');
console.table(patients);

// 4. Referrals audit
const referrals = db.db.prepare(`
  SELECT r.referral_id, r.urgency, r.status, 
         f1.facility_name as from_fac, f2.facility_name as to_fac
  FROM referrals r
  JOIN facilities f1 ON r.from_facility_id = f1.facility_id
  JOIN facilities f2 ON r.to_facility_id = f2.facility_id
  LIMIT 5
`).all();
console.log('\nReferrals sample:');
console.table(referrals);

// 5. Check coordinates alignment with villages
const distMismatch = db.db.prepare(`
  SELECT f.facility_id, f.facility_name, f.latitude as f_lat, f.longitude as f_lng,
         v.village_name, v.latitude as v_lat, v.longitude as v_lng
  FROM facilities f
  JOIN villages v ON f.village_id = v.village_id
  WHERE ABS(f.latitude - v.latitude) > 0.5 OR ABS(f.longitude - v.longitude) > 0.5
`).all();
console.log('\nFacilities with coordinate mismatch (>50km away from assigned village):', distMismatch.length);
if (distMismatch.length > 0) console.table(distMismatch);
