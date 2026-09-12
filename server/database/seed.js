const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Starting RuralCare database seeding...');

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Clean existing data in reverse dependency order
  const tables = [
    'notifications', 'camp_registrations', 'health_camps', 'complaints',
    'feedback', 'emergency_services', 'screenings', 'referrals',
    'appointments', 'health_records', 'patients', 'medicine_stock',
    'services', 'doctors', 'facilities', 'users', 'villages'
  ];

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const table of tables) {
      db.exec(`DELETE FROM ${table};`);
      db.exec(`DELETE FROM sqlite_sequence WHERE name='${table}';`);
    }
    db.exec('COMMIT;');
  } catch (e) {
    db.exec('ROLLBACK;');
    console.warn('Note during clean:', e.message);
  }

  // Common password hash for 'Demo@123'
  const salt = bcrypt.genSaltSync(10);
  const demoPasswordHash = bcrypt.hashSync('Demo@123', salt);

  db.transaction(() => {
    // ----------------------------------------------------
    // 1. VILLAGES (Real rural geographic coords in Pune district)
    // ----------------------------------------------------
    const villages = [
      { id: 1, name: 'Shivapur', district: 'Pune', state: 'Maharashtra', population: 3200, lat: 18.2851, lng: 73.8824, accessibility: 38.5 },
      { id: 2, name: 'Khed', district: 'Pune', state: 'Maharashtra', population: 8500, lat: 18.3204, lng: 73.9102, accessibility: 78.0 },
      { id: 3, name: 'Manchar', district: 'Pune', state: 'Maharashtra', population: 14200, lat: 18.3550, lng: 73.9450, accessibility: 86.4 },
      { id: 4, name: 'Velhe', district: 'Pune', state: 'Maharashtra', population: 2100, lat: 18.2201, lng: 73.7905, accessibility: 32.0 },
      { id: 5, name: 'Bhor', district: 'Pune', state: 'Maharashtra', population: 18500, lat: 18.1502, lng: 73.8504, accessibility: 91.2 },
      { id: 6, name: 'Saswad', district: 'Pune', state: 'Maharashtra', population: 12000, lat: 18.3450, lng: 74.0300, accessibility: 68.5 },
      { id: 7, name: 'Jejuri', district: 'Pune', state: 'Maharashtra', population: 9800, lat: 18.2750, lng: 74.1550, accessibility: 64.0 },
      { id: 8, name: 'Ghoti Khurd', district: 'Pune', state: 'Maharashtra', population: 1450, lat: 18.2050, lng: 73.7300, accessibility: 24.8 }
    ];

    const villageStmt = db.db.prepare(`
      INSERT INTO villages (village_id, village_name, district, state, population, latitude, longitude, accessibility_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of villages) {
      villageStmt.run(v.id, v.name, v.district, v.state, v.population, v.lat, v.lng, v.accessibility);
    }
    console.log(`✓ Seeded ${villages.length} Villages`);

    // ----------------------------------------------------
    // 2. USERS (Demo accounts for Citizen, ASHA, Doctor, Admin)
    // ----------------------------------------------------
    const users = [
      // 1: Citizen (Ramesh Patil)
      { id: 1, name: 'Ramesh Patil', age: 46, gender: 'Male', phone: '9876543210', email: 'ramesh@ruralcare.in', village_id: 1, role: 'citizen' },
      // 2: Citizen (Kavita Shinde)
      { id: 2, name: 'Kavita Shinde', age: 28, gender: 'Female', phone: '9876543211', email: 'kavita@ruralcare.in', village_id: 4, role: 'citizen' },
      // 3: Citizen (Suresh Jadhav)
      { id: 3, name: 'Suresh Jadhav', age: 58, gender: 'Male', phone: '9876543212', email: 'suresh@ruralcare.in', village_id: 8, role: 'citizen' },
      // 4: ASHA Worker (Sunita Bai)
      { id: 4, name: 'Sunita Bai', age: 36, gender: 'Female', phone: '9876543220', email: 'sunita.asha@ruralcare.in', village_id: 1, role: 'asha' },
      // 5: ASHA Worker (Meena Kamble)
      { id: 5, name: 'Meena Kamble', age: 39, gender: 'Female', phone: '9876543221', email: 'meena.asha@ruralcare.in', village_id: 4, role: 'asha' },
      // 6: Doctor (Dr. Rajesh Deshmukh - MBBS, PHC Medical Officer)
      { id: 6, name: 'Dr. Rajesh Deshmukh', age: 41, gender: 'Male', phone: '9876543230', email: 'dr.rajesh@ruralcare.in', village_id: 2, role: 'doctor' },
      // 7: Doctor (Dr. Ananya Sen - MD Gynecologist, CHC)
      { id: 7, name: 'Dr. Ananya Sen', age: 38, gender: 'Female', phone: '9876543231', email: 'dr.ananya@ruralcare.in', village_id: 3, role: 'doctor' },
      // 8: Doctor (Dr. Vikram Joshi - MS General Surgery & Trauma, Hospital)
      { id: 8, name: 'Dr. Vikram Joshi', age: 48, gender: 'Male', phone: '9876543232', email: 'dr.vikram@ruralcare.in', village_id: 5, role: 'doctor' },
      // 9: Doctor (Dr. Pooja Chavan - DCH Pediatrician)
      { id: 9, name: 'Dr. Pooja Chavan', age: 34, gender: 'Female', phone: '9876543233', email: 'dr.pooja@ruralcare.in', village_id: 4, role: 'doctor' },
      // 10: Admin (District Officer Sharma)
      { id: 10, name: 'District Officer Sharma', age: 47, gender: 'Male', phone: '9876543240', email: 'admin@ruralcare.in', village_id: 5, role: 'admin' }
    ];

    const userStmt = db.db.prepare(`
      INSERT INTO users (user_id, name, age, gender, phone, email, village_id, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of users) {
      userStmt.run(u.id, u.name, u.age, u.gender, u.phone, u.email, u.village_id, u.role, demoPasswordHash);
    }
    console.log(`✓ Seeded ${users.length} Users with role-based credentials`);

    // ----------------------------------------------------
    // 3. HEALTHCARE FACILITIES
    // ----------------------------------------------------
    const facilities = [
      {
        id: 1,
        name: 'Khed Primary Health Centre (PHC)',
        type: 'PHC',
        address: 'Main Road, Khed Market, Taluka Rajgurunagar',
        village_id: 2,
        lat: 18.3204,
        lng: 73.9102,
        contact: '02135-224411',
        hours: '24x7 Emergency & OPD (08:00 AM - 08:00 PM)',
        status: 'Open',
        emergency: 1,
        total_beds: 15,
        available_beds: 6
      },
      {
        id: 2,
        name: 'Manchar Community Health Centre (CHC)',
        type: 'CHC',
        address: 'Pune-Nashik Highway, Manchar Bypass',
        village_id: 3,
        lat: 18.3550,
        lng: 73.9450,
        contact: '02133-223344',
        hours: '24 Hours Open',
        status: 'Open',
        emergency: 1,
        total_beds: 40,
        available_beds: 17
      },
      {
        id: 3,
        name: 'Bhor Sub-District Government Hospital',
        type: 'Sub-District Hospital',
        address: 'Civil Hospital Road, Bhor City Centre',
        village_id: 5,
        lat: 18.1502,
        lng: 73.8504,
        contact: '02113-222100',
        hours: '24 Hours Open',
        status: 'Open',
        emergency: 1,
        total_beds: 100,
        available_beds: 34
      },
      {
        id: 4,
        name: 'Shivapur Health Sub-Centre',
        type: 'Sub-Centre',
        address: 'Gram Panchayat Complex, Shivapur',
        village_id: 1,
        lat: 18.2851,
        lng: 73.8824,
        contact: '02135-298711',
        hours: '09:00 AM - 05:00 PM',
        status: 'Open',
        emergency: 0,
        total_beds: 4,
        available_beds: 2
      },
      {
        id: 5,
        name: 'Velhe Primary Health Centre (PHC)',
        type: 'PHC',
        address: 'Torna Fort Foothills Road, Velhe',
        village_id: 4,
        lat: 18.2201,
        lng: 73.7905,
        contact: '02130-221233',
        hours: '08:00 AM - 06:00 PM',
        status: 'Open',
        emergency: 1,
        total_beds: 10,
        available_beds: 3
      },
      {
        id: 6,
        name: 'Saswad Rural CHC',
        type: 'CHC',
        address: 'Near Bus Stand, Saswad Town',
        village_id: 6,
        lat: 18.3450,
        lng: 74.0300,
        contact: '02115-222555',
        hours: '24 Hours Open',
        status: 'Open',
        emergency: 1,
        total_beds: 30,
        available_beds: 9
      }
    ];

    const facilityStmt = db.db.prepare(`
      INSERT INTO facilities (facility_id, facility_name, facility_type, address, village_id, latitude, longitude, contact, opening_hours, current_status, emergency_available, total_beds, available_beds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of facilities) {
      facilityStmt.run(f.id, f.name, f.type, f.address, f.village_id, f.lat, f.lng, f.contact, f.hours, f.status, f.emergency, f.total_beds, f.available_beds);
    }
    console.log(`✓ Seeded ${facilities.length} Healthcare Facilities`);

    // ----------------------------------------------------
    // 4. DOCTORS / STAFF
    // ----------------------------------------------------
    const doctors = [
      { id: 1, user_id: 6, facility_id: 1, name: 'Dr. Rajesh Deshmukh', spec: 'MBBS - General Medicine', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 04:00 PM' },
      { id: 2, user_id: 7, facility_id: 2, name: 'Dr. Ananya Sen', spec: 'MD - Obstetrics & Gynecology', status: 'Available', days: 'Mon-Sat', hours: '08:00 AM - 03:00 PM' },
      { id: 3, user_id: 8, facility_id: 3, name: 'Dr. Vikram Joshi', spec: 'MS - General Surgery & Trauma', status: 'Available', days: 'Mon-Sun', hours: '24x7 On-Call / 10 AM - 2 PM' },
      { id: 4, user_id: 9, facility_id: 5, name: 'Dr. Pooja Chavan', spec: 'DCH - Pediatrics & Child Health', status: 'In Consultation', days: 'Mon-Fri', hours: '09:00 AM - 05:00 PM' }
    ];

    const docStmt = db.db.prepare(`
      INSERT INTO doctors (staff_id, user_id, facility_id, name, specialization, availability_status, working_days, working_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of doctors) {
      docStmt.run(d.id, d.user_id, d.facility_id, d.name, d.spec, d.status, d.days, d.hours);
    }
    console.log(`✓ Seeded ${doctors.length} Doctors`);

    // ----------------------------------------------------
    // 5. SERVICES PER FACILITY
    // ----------------------------------------------------
    const services = [
      // Khed PHC
      { facility_id: 1, name: 'General Outpatient (OPD)', status: 'Available', timings: '08:00 AM - 02:00 PM' },
      { facility_id: 1, name: 'Emergency Triage & First Aid', status: 'Available', timings: '24x7' },
      { facility_id: 1, name: 'Maternal & Normal Delivery', status: 'Available', timings: '24x7' },
      { facility_id: 1, name: 'Child Immunization', status: 'Available', timings: 'Every Wed & Fri' },
      { facility_id: 1, name: 'Basic Lab Diagnostics', status: 'Available', timings: '09:00 AM - 04:00 PM' },
      
      // Manchar CHC
      { facility_id: 2, name: 'Specialist Gynecology & C-Section', status: 'Available', timings: '24x7' },
      { facility_id: 2, name: 'Pediatric Care & Neonatal Stabilization', status: 'Available', timings: '24x7' },
      { facility_id: 2, name: 'Digital X-Ray & Ultrasound', status: 'Available', timings: '09:00 AM - 05:00 PM' },
      { facility_id: 2, name: 'Minor & Major Operation Theatre', status: 'Available', timings: 'Emergency 24x7' },
      { facility_id: 2, name: 'Comprehensive Blood Storage Centre', status: 'Available', timings: '24x7' },

      // Bhor Hospital
      { facility_id: 3, name: 'Trauma & Critical Care ICU', status: 'Available', timings: '24x7' },
      { facility_id: 3, name: 'General & Orthopedic Surgery', status: 'Available', timings: '24x7' },
      { facility_id: 3, name: 'Dialysis Unit', status: 'Available', timings: '08:00 AM - 08:00 PM' },
      { facility_id: 3, name: 'Full Pathology & Biochemistry Lab', status: 'Available', timings: '24x7' },

      // Shivapur Sub-Centre
      { facility_id: 4, name: 'Basic First Aid & Dressing', status: 'Available', timings: '09:00 AM - 05:00 PM' },
      { facility_id: 4, name: 'Antenatal Checkup (ANC)', status: 'Available', timings: 'Tuesdays' },
      { facility_id: 4, name: 'Non-Communicable Disease Screening', status: 'Available', timings: 'Daily' },

      // Velhe PHC
      { facility_id: 5, name: 'General Medicine OPD', status: 'Available', timings: '09:00 AM - 04:00 PM' },
      { facility_id: 5, name: 'Snakebite & Rabies Treatment', status: 'Available', timings: '24x7' },
      { facility_id: 5, name: 'Immunization & Nutrition Clinic', status: 'Available', timings: 'Thursdays' }
    ];

    const svcStmt = db.db.prepare(`
      INSERT INTO services (facility_id, service_name, availability_status, timings)
      VALUES (?, ?, ?, ?)
    `);
    for (const s of services) {
      svcStmt.run(s.facility_id, s.name, s.status, s.timings);
    }
    console.log(`✓ Seeded ${services.length} Facility Services`);

    // ----------------------------------------------------
    // 6. MEDICINE STOCK
    // ----------------------------------------------------
    const medicines = [
      // Khed PHC (Facility 1)
      { f_id: 1, name: 'Paracetamol 500mg', cat: 'Analgesic/Antipyretic', qty: 450, unit: 'strips', status: 'In Stock' },
      { f_id: 1, name: 'Amoxicillin 500mg', cat: 'Antibiotic', qty: 180, unit: 'strips', status: 'In Stock' },
      { f_id: 1, name: 'ORS (Oral Rehydration Salts)', cat: 'Essential Electrolytes', qty: 320, unit: 'sachets', status: 'In Stock' },
      { f_id: 1, name: 'Metformin 500mg', cat: 'Antidiabetic', qty: 60, unit: 'strips', status: 'Low Stock' },
      { f_id: 1, name: 'Amlodipine 5mg', cat: 'Antihypertensive', qty: 0, unit: 'strips', status: 'Out of Stock' },
      { f_id: 1, name: 'Iron & Folic Acid Tablets', cat: 'Maternal Nutrition', qty: 500, unit: 'strips', status: 'In Stock' },
      { f_id: 1, name: 'Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 12, unit: 'vials', status: 'In Stock' },

      // Manchar CHC (Facility 2)
      { f_id: 2, name: 'Paracetamol 500mg', cat: 'Analgesic/Antipyretic', qty: 1200, unit: 'strips', status: 'In Stock' },
      { f_id: 2, name: 'Amoxicillin 500mg', cat: 'Antibiotic', qty: 400, unit: 'strips', status: 'In Stock' },
      { f_id: 2, name: 'Amlodipine 5mg', cat: 'Antihypertensive', qty: 350, unit: 'strips', status: 'In Stock' },
      { f_id: 2, name: 'Metformin 500mg', cat: 'Antidiabetic', qty: 280, unit: 'strips', status: 'In Stock' },
      { f_id: 2, name: 'Ceftriaxone 1g Inj', cat: 'Injectable Antibiotic', qty: 150, unit: 'vials', status: 'In Stock' },
      { f_id: 2, name: 'Salbutamol Nebules', cat: 'Respiratory', qty: 85, unit: 'ampoules', status: 'In Stock' },
      { f_id: 2, name: 'Oxytocin Injection', cat: 'Maternal Delivery', qty: 120, unit: 'ampoules', status: 'In Stock' },

      // Bhor Hospital (Facility 3)
      { f_id: 3, name: 'Paracetamol 500mg', cat: 'Analgesic/Antipyretic', qty: 3000, unit: 'strips', status: 'In Stock' },
      { f_id: 3, name: 'Amlodipine 5mg', cat: 'Antihypertensive', qty: 800, unit: 'strips', status: 'In Stock' },
      { f_id: 3, name: 'Insulin Glargine', cat: 'Antidiabetic', qty: 95, unit: 'vials', status: 'In Stock' },
      { f_id: 3, name: 'Anti-Rabies Vaccine', cat: 'Vaccine', qty: 140, unit: 'vials', status: 'In Stock' },
      { f_id: 3, name: 'Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 50, unit: 'vials', status: 'In Stock' },

      // Shivapur Sub-Centre (Facility 4)
      { f_id: 4, name: 'Paracetamol 500mg', cat: 'Analgesic/Antipyretic', qty: 80, unit: 'strips', status: 'Low Stock' },
      { f_id: 4, name: 'ORS (Oral Rehydration Salts)', cat: 'Essential Electrolytes', qty: 110, unit: 'sachets', status: 'In Stock' },
      { f_id: 4, name: 'Iron & Folic Acid Tablets', cat: 'Maternal Nutrition', qty: 140, unit: 'strips', status: 'In Stock' },
      { f_id: 4, name: 'Amoxicillin 250mg', cat: 'Antibiotic', qty: 0, unit: 'strips', status: 'Out of Stock' },

      // Velhe PHC (Facility 5)
      { f_id: 5, name: 'Paracetamol 500mg', cat: 'Analgesic/Antipyretic', qty: 250, unit: 'strips', status: 'In Stock' },
      { f_id: 5, name: 'Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 8, unit: 'vials', status: 'Low Stock' },
      { f_id: 5, name: 'Cetirizine 10mg', cat: 'Antiallergic', qty: 190, unit: 'strips', status: 'In Stock' }
    ];

    const medStmt = db.db.prepare(`
      INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const m of medicines) {
      medStmt.run(m.f_id, m.name, m.cat, m.qty, m.unit, m.status);
    }
    console.log(`✓ Seeded ${medicines.length} Medicine Inventory Records`);

    // ----------------------------------------------------
    // 7. PATIENTS
    // ----------------------------------------------------
    const patients = [
      { id: 1, user_id: 1, blood: 'O+', height: 168, weight: 68, allergies: 'Penicillin', conditions: 'Hypertension (3 yrs)', ec_name: 'Sunita Patil (Wife)', ec_phone: '9876543299' },
      { id: 2, user_id: 2, blood: 'B+', height: 156, weight: 54, allergies: 'None', conditions: 'Asthma (Mild), Prenatal 24 Weeks', ec_name: 'Anil Shinde (Husband)', ec_phone: '9876543298' },
      { id: 3, user_id: 3, blood: 'A+', height: 172, weight: 74, allergies: 'Sulfa Drugs', conditions: 'Type 2 Diabetes, Joint Pain', ec_name: 'Ganesh Jadhav (Son)', ec_phone: '9876543297' }
    ];

    const patStmt = db.db.prepare(`
      INSERT INTO patients (patient_id, user_id, blood_group, height_cm, weight_kg, allergies, existing_conditions, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of patients) {
      patStmt.run(p.id, p.user_id, p.blood, p.height, p.weight, p.allergies, p.conditions, p.ec_name, p.ec_phone);
    }
    console.log(`✓ Seeded ${patients.length} Patient Profiles`);

    // ----------------------------------------------------
    // 8. HEALTH RECORDS
    // ----------------------------------------------------
    const healthRecords = [
      {
        patient_id: 1,
        doctor_id: 1,
        facility_id: 1,
        symptoms: 'Headache, persistent dizziness, elevated blood pressure',
        diagnosis: 'Essential Stage 1 Hypertension with fatigue',
        prescription: 'Tab Amlodipine 5mg (1-0-0) x 30 days, low sodium diet',
        vitals: JSON.stringify({ bp: '148/94 mmHg', pulse: '78 bpm', temp: '98.4 F', spo2: '98%' })
      },
      {
        patient_id: 2,
        doctor_id: 2,
        facility_id: 2,
        symptoms: 'Second trimester routine checkup, mild wheezing in cold mornings',
        diagnosis: 'Intrauterine Single Pregnancy at 24 weeks; mild seasonal bronchospasm',
        prescription: 'Iron Folic Acid (1-0-0), Calcium 500mg (0-1-0), Salbutamol inhaler SOS',
        vitals: JSON.stringify({ bp: '116/76 mmHg', pulse: '82 bpm', temp: '98.6 F', spo2: '97%', fetalHeartRate: '144 bpm' })
      },
      {
        patient_id: 3,
        doctor_id: 1,
        facility_id: 1,
        symptoms: 'Increased thirst, tingling sensation in feet, knee stiffness',
        diagnosis: 'Uncontrolled Type 2 Diabetes Mellitus with bilateral osteoarthritis knees',
        prescription: 'Tab Metformin 500mg BD after food, Paracetamol 500mg SOS',
        vitals: JSON.stringify({ bp: '130/84 mmHg', pulse: '76 bpm', temp: '98.2 F', fastingSugar: '188 mg/dL', postPrandial: '246 mg/dL' })
      }
    ];

    const hrStmt = db.db.prepare(`
      INSERT INTO health_records (patient_id, doctor_id, facility_id, symptoms, diagnosis_notes, prescription, vitals_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const hr of healthRecords) {
      hrStmt.run(hr.patient_id, hr.doctor_id, hr.facility_id, hr.symptoms, hr.diagnosis, hr.prescription, hr.vitals);
    }
    console.log(`✓ Seeded ${healthRecords.length} Clinical Health Records`);

    // ----------------------------------------------------
    // 9. APPOINTMENTS
    // ----------------------------------------------------
    const today = new Date().toISOString().split('T')[0];
    const appointments = [
      {
        patient_id: 1,
        facility_id: 1,
        doctor_id: 1,
        date: today,
        time: '10:30 AM',
        status: 'Scheduled',
        reason: 'Monthly Blood Pressure follow-up & renewal of Amlodipine prescription',
        notes: null
      },
      {
        patient_id: 2,
        facility_id: 2,
        doctor_id: 2,
        date: today,
        time: '11:45 AM',
        status: 'Scheduled',
        reason: '24-week Anomaly Scan & Obstetrician Consultation',
        notes: null
      },
      {
        patient_id: 3,
        facility_id: 1,
        doctor_id: 1,
        date: '2026-09-10',
        time: '02:00 PM',
        status: 'Completed',
        reason: 'Severe diabetic foot tingling checkup',
        notes: 'Advised strict diet and regular walking. HbA1c test requested.'
      }
    ];

    const aptStmt = db.db.prepare(`
      INSERT INTO appointments (patient_id, facility_id, doctor_id, appointment_date, appointment_time, status, reason, doctor_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of appointments) {
      aptStmt.run(a.patient_id, a.facility_id, a.doctor_id, a.date, a.time, a.status, a.reason, a.notes);
    }
    console.log(`✓ Seeded ${appointments.length} Appointments`);

    // ----------------------------------------------------
    // 10. REFERRALS (Inter-tier healthcare transfers)
    // ----------------------------------------------------
    const referrals = [
      {
        patient_id: 1,
        referring_f: 1, // Khed PHC
        referred_f: 2,  // Manchar CHC
        doctor_id: 1,   // Dr. Rajesh
        reason: 'Refractory Hypertension with suspected renal vascular etiology requiring 2D Echo and Ultrasound Doppler',
        priority: 'Urgent',
        status: 'Pending',
        summary: 'Patient has persistent BP > 150/95 despite monotherapy. Needs higher diagnostic workup not available at PHC.'
      },
      {
        patient_id: 3,
        referring_f: 1, // Khed PHC
        referred_f: 3,  // Bhor Hospital
        doctor_id: 1,   // Dr. Rajesh
        reason: 'Diabetic Peripheral Neuropathy & Osteoarthritis Knee Evaluation by Orthopedic Surgeon',
        priority: 'Routine',
        status: 'Accepted',
        summary: 'Referred for specialist orthopedic evaluation and custom orthotic footwear.'
      }
    ];

    const refStmt = db.db.prepare(`
      INSERT INTO referrals (patient_id, referring_facility_id, referred_facility_id, doctor_id, reason, priority, status, clinical_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of referrals) {
      refStmt.run(r.patient_id, r.referring_f, r.referred_f, r.doctor_id, r.reason, r.priority, r.status, r.summary);
    }
    console.log(`✓ Seeded ${referrals.length} Inter-facility Referrals`);

    // ----------------------------------------------------
    // 11. AI HEALTH SCREENINGS
    // ----------------------------------------------------
    const screenings = [
      {
        patient_id: 1,
        symptoms: JSON.stringify(['High Fever', 'Shortness of Breath', 'Dry Cough', 'Chest Tightness']),
        duration: 4,
        severity: 'Severe',
        vitals: JSON.stringify({ temp: '102.4 F', bp: '138/88 mmHg', spo2: '93%', sugar: '130 mg/dL' }),
        risk_level: 'High',
        conditions: JSON.stringify(['Acute Lower Respiratory Infection', 'Pneumonia', 'Severe Viral Pyrexia']),
        recommendation: 'Immediate clinical evaluation strongly advised due to oxygen saturation below 94% and high continuous fever. Oxygen support and chest imaging may be indicated.',
        consultation: 1,
        matched_f: 2 // Manchar CHC (has X-ray and 24x7 emergency)
      },
      {
        patient_id: 2,
        symptoms: JSON.stringify(['Mild Nausea', 'Fatigue', 'Morning Dizziness']),
        duration: 2,
        severity: 'Mild',
        vitals: JSON.stringify({ temp: '98.4 F', bp: '110/70 mmHg', spo2: '99%', sugar: '92 mg/dL' }),
        risk_level: 'Low',
        conditions: JSON.stringify(['Normal Second Trimester Pregnancy Symptoms', 'Mild Dehydration']),
        recommendation: 'Rest adequately, increase hydration with electrolytes/lemon water, consume small frequent meals. Continue prenatal vitamins and routine ANC schedule.',
        consultation: 0,
        matched_f: 1
      },
      {
        patient_id: 3,
        symptoms: JSON.stringify(['Severe Chest Pain', 'Profuse Sweating', 'Left Arm Numbness']),
        duration: 1,
        severity: 'Critical',
        vitals: JSON.stringify({ temp: '98.6 F', bp: '165/105 mmHg', spo2: '95%', sugar: '190 mg/dL' }),
        risk_level: 'Emergency',
        conditions: JSON.stringify(['Acute Coronary Syndrome (Myocardial Infarction / Heart Attack)', 'Hypertensive Crisis']),
        recommendation: 'EMERGENCY: Immediate emergency medical intervention required! Dial 108 ambulance immediately or proceed to the nearest trauma/ICU-equipped hospital without delay.',
        consultation: 1,
        matched_f: 3 // Bhor Hospital (has ICU and Trauma)
      }
    ];

    const scrStmt = db.db.prepare(`
      INSERT INTO screenings (patient_id, symptoms_json, duration_days, severity, vitals_json, ai_risk_level, possible_conditions_json, recommendation, consultation_recommended, matched_facility_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const sc of screenings) {
      scrStmt.run(sc.patient_id, sc.symptoms, sc.duration, sc.severity, sc.vitals, sc.risk_level, sc.conditions, sc.recommendation, sc.consultation, sc.matched_f);
    }
    console.log(`✓ Seeded ${screenings.length} AI Screenings`);

    // ----------------------------------------------------
    // 12. EMERGENCY SERVICES
    // ----------------------------------------------------
    const emergencyServices = [
      { f_id: 1, ambulance: 1, contact: '02135-224411', amb_phone: '108 / 9822011111', resp_min: 15, trauma: 'Basic Stabilization' },
      { f_id: 2, ambulance: 1, contact: '02133-223344', amb_phone: '108 / 9822022222', resp_min: 12, trauma: 'Level 2 Trauma Care' },
      { f_id: 3, ambulance: 1, contact: '02113-222100', amb_phone: '108 / 9822033333', resp_min: 8, trauma: 'Comprehensive Level 1 Trauma & ICU' },
      { f_id: 4, ambulance: 0, contact: '02135-298711', amb_phone: '108 (Central Dispatch)', resp_min: 35, trauma: 'First Aid Only' },
      { f_id: 5, ambulance: 1, contact: '02130-221233', amb_phone: '108 / 9822055555', resp_min: 22, trauma: 'Basic Emergency & Snakebite Unit' },
      { f_id: 6, ambulance: 1, contact: '02115-222555', amb_phone: '108 / 9822066666', resp_min: 14, trauma: 'Level 2 Emergency Care' }
    ];

    const emStmt = db.db.prepare(`
      INSERT INTO emergency_services (facility_id, ambulance_available, emergency_contact, ambulance_phone, response_time_minutes, trauma_care_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const em of emergencyServices) {
      emStmt.run(em.f_id, em.ambulance, em.contact, em.amb_phone, em.resp_min, em.trauma);
    }
    console.log(`✓ Seeded ${emergencyServices.length} Emergency Service Profiles`);

    // ----------------------------------------------------
    // 13. FEEDBACK & RATINGS
    // ----------------------------------------------------
    const feedbacks = [
      { patient_id: 1, facility_id: 1, rating: 4, text: 'Dr. Deshmukh was very polite and explained my blood pressure management clearly. Clean OPD premises.' },
      { patient_id: 2, facility_id: 2, rating: 5, text: 'Excellent maternity care by Dr. Ananya Sen. Ultrasound scan done without delay and nursing staff was attentive.' },
      { patient_id: 3, facility_id: 1, rating: 3, text: 'Doctor was helpful but Amlodipine medicine was out of stock so I had to purchase from a private chemist outside.' },
      { patient_id: 1, facility_id: 4, rating: 2, text: 'Sub-centre was closed during the afternoon hours when I went for dressing. Needed better staff presence.' }
    ];

    const fbStmt = db.db.prepare(`
      INSERT INTO feedback (patient_id, facility_id, rating, feedback_text)
      VALUES (?, ?, ?, ?)
    `);
    for (const fb of feedbacks) {
      fbStmt.run(fb.patient_id, fb.facility_id, fb.rating, fb.text);
    }
    console.log(`✓ Seeded ${feedbacks.length} Feedback & Ratings`);

    // ----------------------------------------------------
    // 14. COMPLAINTS & GRIEVANCES
    // ----------------------------------------------------
    const complaints = [
      {
        patient_id: 1,
        facility_id: 1,
        type: 'Medicine Unavailable',
        desc: 'Essential blood pressure tablet Amlodipine 5mg has been completely out of stock for over 10 days at Khed PHC.',
        status: 'Submitted',
        admin_resp: null
      },
      {
        patient_id: 3,
        facility_id: 4,
        type: 'Facility Closed',
        desc: 'Shivapur Sub-Centre was locked at 11:30 AM on Tuesday when diabetic screening camp was scheduled.',
        status: 'In Progress',
        admin_resp: 'Enquiry initiated with Block Medical Officer. Staff attendance log is being audited.'
      },
      {
        patient_id: 2,
        facility_id: 1,
        type: 'Long Waiting Time',
        desc: 'Pregnant mothers had to wait over 3 hours standing due to lack of seating and single doctor handling general OPD.',
        status: 'Resolved',
        admin_resp: 'Additional seating installed in waiting shed and an extra auxiliary nurse deployed on high-volume clinic days.'
      }
    ];

    const compStmt = db.db.prepare(`
      INSERT INTO complaints (patient_id, facility_id, complaint_type, description, status, admin_response)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const c of complaints) {
      compStmt.run(c.patient_id, c.facility_id, c.type, c.desc, c.status, c.admin_resp);
    }
    console.log(`✓ Seeded ${complaints.length} Complaints`);

    // ----------------------------------------------------
    // 15. HEALTH CAMPS & REGISTRATIONS
    // ----------------------------------------------------
    const camps = [
      {
        id: 1,
        facility_id: 1,
        village_id: 1,
        name: 'Maternal Nutrition & High-Risk Pregnancy Screening Camp',
        location: 'Shivapur Primary School Hall',
        date: '2026-09-20',
        start: '09:30 AM',
        end: '03:30 PM',
        services: 'Free Blood Tests, Hb Analysis, Ultrasound Registration, Iron Supplements',
        target: 'Expectant & Lactating Mothers, Adolescent Girls',
        status: 'Upcoming'
      },
      {
        id: 2,
        facility_id: 2,
        village_id: 4,
        name: 'Comprehensive Eye & Cataract Checkup Camp',
        location: 'Velhe Gram Panchayat Hall',
        date: '2026-09-25',
        start: '10:00 AM',
        end: '04:00 PM',
        services: 'Vision Testing, Free Prescription Glasses, Cataract Surgery Screening',
        target: 'Senior Citizens (50+ years)',
        status: 'Upcoming'
      },
      {
        id: 3,
        facility_id: 3,
        village_id: 8,
        name: 'Tribal Area General Health & NCD Screening Drive',
        location: 'Ghoti Khurd Community Hall',
        date: '2026-10-02',
        start: '09:00 AM',
        end: '02:00 PM',
        services: 'Diabetes, BP, Hemoglobin, Child Stunting Check, Free Essential Medicines',
        target: 'All Villagers',
        status: 'Upcoming'
      }
    ];

    const campStmt = db.db.prepare(`
      INSERT INTO health_camps (camp_id, facility_id, village_id, camp_name, location, camp_date, start_time, end_time, services_offered, target_audience, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cp of camps) {
      campStmt.run(cp.id, cp.facility_id, cp.village_id, cp.name, cp.location, cp.date, cp.start, cp.end, cp.services, cp.target, cp.status);
    }

    const regStmt = db.db.prepare(`
      INSERT INTO camp_registrations (camp_id, patient_id)
      VALUES (?, ?)
    `);
    regStmt.run(1, 2); // Kavita registered for Maternal camp
    regStmt.run(2, 1); // Ramesh registered for Eye camp
    console.log(`✓ Seeded ${camps.length} Health Camps & Registrations`);

    // ----------------------------------------------------
    // 16. NOTIFICATIONS
    // ----------------------------------------------------
    const notifications = [
      { user_id: 1, title: 'Upcoming Appointment Reminder', msg: 'Your appointment with Dr. Rajesh Deshmukh is scheduled for today at 10:30 AM at Khed PHC.', type: 'appointment' },
      { user_id: 1, title: 'Referral Generated', msg: 'Dr. Deshmukh has referred you to Manchar CHC for Echo & Doppler evaluation. Priority: Urgent.', type: 'referral' },
      { user_id: 2, title: 'Health Camp Registration Confirmed', msg: 'You are registered for Maternal Nutrition Camp at Shivapur on 20 Sep 2026.', type: 'camp' },
      { user_id: 4, title: 'High-Risk AI Screening Alert', msg: 'Patient Suresh Jadhav reported severe chest pain with critical risk flagged. Immediate action needed.', type: 'screening' },
      { user_id: 6, title: 'New Appointment Scheduled', msg: 'Patient Ramesh Patil booked an OPD appointment for 10:30 AM today.', type: 'appointment' },
      { user_id: 10, title: 'New Citizen Grievance Logged', msg: 'Grievance filed regarding medicine shortage at Khed PHC requiring administrative review.', type: 'complaint' }
    ];

    const notifStmt = db.db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);
    for (const n of notifications) {
      notifStmt.run(n.user_id, n.title, n.msg, n.type);
    }
    console.log(`✓ Seeded ${notifications.length} User Notifications`);
  });

  console.log('✅ RuralCare database seeding completed successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
