const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Starting RuralCare massive database seeding...');

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Clean existing data in reverse dependency order
  const tables = [
    'notifications', 'camp_registrations', 'health_camps', 'complaints',
    'feedback', 'emergency_services', 'screenings', 'referrals',
    'appointments', 'health_records', 'maternal_child_health', 'disease_surveillance',
    'generic_medicines', 'patients', 'medicine_stock', 'services',
    'doctors', 'facilities', 'users', 'villages'
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
    // 1. VILLAGES (16 authentic rural locations in Maharashtra)
    // ----------------------------------------------------
    const villages = [
      { id: 1, name: 'Shivapur', district: 'Pune', state: 'Maharashtra', population: 3450, lat: 18.2851, lng: 73.8824, accessibility: 42.5 },
      { id: 2, name: 'Khed', district: 'Pune', state: 'Maharashtra', population: 8900, lat: 18.3204, lng: 73.9102, accessibility: 79.5 },
      { id: 3, name: 'Manchar', district: 'Pune', state: 'Maharashtra', population: 14800, lat: 18.3550, lng: 73.9450, accessibility: 88.0 },
      { id: 4, name: 'Velhe', district: 'Pune', state: 'Maharashtra', population: 2150, lat: 18.2201, lng: 73.7905, accessibility: 28.5 },
      { id: 5, name: 'Bhor', district: 'Pune', state: 'Maharashtra', population: 19200, lat: 18.1502, lng: 73.8504, accessibility: 91.5 },
      { id: 6, name: 'Saswad', district: 'Pune', state: 'Maharashtra', population: 12500, lat: 18.3450, lng: 74.0300, accessibility: 71.0 },
      { id: 7, name: 'Jejuri', district: 'Pune', state: 'Maharashtra', population: 10200, lat: 18.2750, lng: 74.1550, accessibility: 66.5 },
      { id: 8, name: 'Ghoti Khurd', district: 'Pune', state: 'Maharashtra', population: 1480, lat: 18.2050, lng: 73.7300, accessibility: 22.0 },
      { id: 9, name: 'Narayangaon', district: 'Pune', state: 'Maharashtra', population: 16500, lat: 19.1200, lng: 73.9800, accessibility: 82.5 },
      { id: 10, name: 'Junnar', district: 'Pune', state: 'Maharashtra', population: 24500, lat: 19.2080, lng: 73.8760, accessibility: 85.0 },
      { id: 11, name: 'Rajgurunagar', district: 'Pune', state: 'Maharashtra', population: 21000, lat: 18.8550, lng: 73.8820, accessibility: 86.5 },
      { id: 12, name: 'Alandi Rural', district: 'Pune', state: 'Maharashtra', population: 9800, lat: 18.6750, lng: 73.8980, accessibility: 74.0 },
      { id: 13, name: 'Shirur', district: 'Pune', state: 'Maharashtra', population: 28000, lat: 18.8250, lng: 74.3750, accessibility: 89.0 },
      { id: 14, name: 'Baramati Rural', district: 'Pune', state: 'Maharashtra', population: 32000, lat: 18.1550, lng: 74.5800, accessibility: 93.0 },
      { id: 15, name: 'Daund Rural', district: 'Pune', state: 'Maharashtra', population: 18500, lat: 18.4650, lng: 74.5850, accessibility: 76.5 },
      { id: 16, name: 'Purandar Gram', district: 'Pune', state: 'Maharashtra', population: 3800, lat: 18.2800, lng: 73.9800, accessibility: 49.0 }
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
    // 2. USERS (Demo accounts & Medical Staff & Citizens)
    // ----------------------------------------------------
    const users = [
      // Demo accounts
      { id: 1, name: 'Ramesh Patil', age: 48, gender: 'Male', phone: '9876543210', email: 'ramesh@ruralcare.in', vid: 1, role: 'citizen' },
      { id: 2, name: 'Sunita Jadhav', age: 27, gender: 'Female', phone: '9876543211', email: 'sunita@ruralcare.in', vid: 1, role: 'citizen' },
      { id: 3, name: 'Mangal Bhosale', age: 31, gender: 'Female', phone: '9876543212', email: 'mangal@ruralcare.in', vid: 4, role: 'citizen' },
      { id: 4, name: 'Sunita Bai', age: 36, gender: 'Female', phone: '9876543220', email: 'sunita.asha@ruralcare.in', vid: 1, role: 'asha' },
      { id: 5, name: 'Kavita Shinde', age: 34, gender: 'Female', phone: '9876543221', email: 'kavita.asha@ruralcare.in', vid: 4, role: 'asha' },
      { id: 6, name: 'Dr. Rajesh Deshmukh', age: 45, gender: 'Male', phone: '9876543230', email: 'dr.rajesh@ruralcare.in', vid: 2, role: 'doctor' },
      { id: 7, name: 'Dr. Ananya Deshmukh', age: 39, gender: 'Female', phone: '9876543231', email: 'ananya@ruralcare.in', vid: 2, role: 'doctor' },
      { id: 8, name: 'Dr. Priya Shinde', age: 38, gender: 'Female', phone: '9876543232', email: 'priya@ruralcare.in', vid: 3, role: 'doctor' },
      { id: 9, name: 'Dr. Vikram Patil', age: 49, gender: 'Male', phone: '9876543233', email: 'vikram@ruralcare.in', vid: 3, role: 'doctor' },
      { id: 10, name: 'District Officer Sharma', age: 52, gender: 'Male', phone: '9876543240', email: 'admin@ruralcare.in', vid: 2, role: 'admin' },
      { id: 11, name: 'Dr. Sanjay More', age: 44, gender: 'Male', phone: '9876543234', email: 'sanjay.more@ruralcare.in', vid: 5, role: 'doctor' },
      { id: 12, name: 'Dr. Sunil Gaikwad', age: 53, gender: 'Male', phone: '9876543235', email: 'sunil.gaikwad@ruralcare.in', vid: 2, role: 'doctor' },
      { id: 13, name: 'Dr. Smita Kamble', age: 32, gender: 'Female', phone: '9876543236', email: 'smita.cho@ruralcare.in', vid: 1, role: 'doctor' },
      { id: 14, name: 'Dr. Meenakshi Pawar', age: 41, gender: 'Female', phone: '9876543237', email: 'meenakshi@ruralcare.in', vid: 6, role: 'doctor' },
      { id: 15, name: 'Dr. Prakash Bhosale', age: 47, gender: 'Male', phone: '9876543238', email: 'prakash.bhosale@ruralcare.in', vid: 14, role: 'doctor' },
      { id: 16, name: 'Dr. Swati Kadam', age: 37, gender: 'Female', phone: '9876543239', email: 'swati.kadam@ruralcare.in', vid: 10, role: 'doctor' }
    ];

    const userStmt = db.db.prepare(`
      INSERT INTO users (user_id, name, age, gender, phone, email, village_id, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of users) {
      userStmt.run(u.id, u.name, u.age, u.gender, u.phone, u.email, u.vid, u.role, demoPasswordHash);
    }
    console.log(`✓ Seeded ${users.length} Users`);

    // ----------------------------------------------------
    // 3. HEALTHCARE FACILITIES (12 Facilities across all 5 Tiers)
    // ----------------------------------------------------
    const facilities = [
      { id: 1, name: 'Shivapur Health Sub-Centre', type: 'Sub-Centre', address: 'Near Gram Panchayat, Shivapur', vid: 1, lat: 18.2860, lng: 73.8830, contact: '020-2438901', hours: '08:00 AM - 04:00 PM', status: 'Open', emer: 0, tot: 4, avail: 3 },
      { id: 2, name: 'Velhe Health Sub-Centre', type: 'Sub-Centre', address: 'Bajar Peth, Velhe Tehsil', vid: 4, lat: 18.2210, lng: 73.7915, contact: '02130-22109', hours: '08:00 AM - 04:00 PM', status: 'Open', emer: 0, tot: 3, avail: 1 },
      { id: 3, name: 'Ghoti Tribal Sub-Centre', type: 'Sub-Centre', address: 'Ghoti Khurd Foothills', vid: 8, lat: 18.2060, lng: 73.7310, contact: '02130-22580', hours: '09:00 AM - 03:00 PM', status: 'Open', emer: 0, tot: 2, avail: 2 },
      { id: 4, name: 'Khed Primary Health Centre', type: 'PHC', address: 'Station Road, Khed Gram', vid: 2, lat: 18.3215, lng: 73.9115, contact: '02135-222340', hours: '24 Hours', status: 'Open', emer: 1, tot: 15, avail: 8 },
      { id: 5, name: 'Saswad Primary Health Centre', type: 'PHC', address: 'Near Municipal Ground, Saswad', vid: 6, lat: 18.3465, lng: 74.0315, contact: '02115-222115', hours: '24 Hours', status: 'Open', emer: 1, tot: 16, avail: 7 },
      { id: 6, name: 'Narayangaon Primary Health Centre', type: 'PHC', address: 'NH-60 Bypass, Narayangaon', vid: 9, lat: 19.1215, lng: 73.9815, contact: '02132-242010', hours: '24 Hours', status: 'Open', emer: 1, tot: 14, avail: 6 },
      { id: 7, name: 'Manchar Community Health Centre', type: 'CHC', address: 'Pune-Nashik Highway, Manchar', vid: 3, lat: 18.3565, lng: 73.9465, contact: '02133-223450', hours: '24 Hours', status: 'Open', emer: 1, tot: 35, avail: 19 },
      { id: 8, name: 'Bhor Community Health Centre', type: 'CHC', address: 'Raja Raghunathrao Marg, Bhor', vid: 5, lat: 18.1520, lng: 73.8520, contact: '02113-222501', hours: '24 Hours', status: 'Open', emer: 1, tot: 30, avail: 14 },
      { id: 9, name: 'Shirur Community Health Centre', type: 'CHC', address: 'Ghodnadi Road, Shirur', vid: 13, lat: 18.8270, lng: 74.3770, contact: '02137-252110', hours: '24 Hours', status: 'Open', emer: 1, tot: 40, avail: 22 },
      { id: 10, name: 'Junnar Sub-District Hospital', type: 'Sub-District Hospital', address: 'Shivaji Chowk, Junnar', vid: 10, lat: 19.2095, lng: 73.8775, contact: '02132-222045', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 28 },
      { id: 11, name: 'Baramati Sub-District Hospital', type: 'Sub-District Hospital', address: 'MIDC Road, Baramati Rural', vid: 14, lat: 18.1570, lng: 74.5820, contact: '02112-243500', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 34 },
      { id: 12, name: 'Pune District Hospital (Aundh)', type: 'Government Hospital', address: 'Chest Hospital Campus, Aundh, Pune', vid: 2, lat: 18.3280, lng: 73.9180, contact: '020-27280450', hours: '24 Hours', status: 'Open', emer: 1, tot: 150, avail: 42 }
    ];

    const facStmt = db.db.prepare(`
      INSERT INTO facilities (facility_id, facility_name, facility_type, address, village_id, latitude, longitude, contact, opening_hours, current_status, emergency_available, total_beds, available_beds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of facilities) {
      facStmt.run(f.id, f.name, f.type, f.address, f.vid, f.lat, f.lng, f.contact, f.hours, f.status, f.emer, f.tot, f.avail);
    }
    console.log(`✓ Seeded ${facilities.length} Healthcare Facilities`);

    // ----------------------------------------------------
    // 4. DOCTORS & MEDICAL OFFICERS (12 Specialized Staff)
    // ----------------------------------------------------
    const doctors = [
      { id: 1, uid: 6, fid: 4, name: 'Dr. Rajesh Kulkarni', spec: 'General Medicine & Diabetology', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 02:00 PM' },
      { id: 2, uid: 7, fid: 4, name: 'Dr. Ananya Deshmukh', spec: 'Obstetrics & Gynecology (Maternal Care)', status: 'Available', days: 'Mon-Fri', hours: '10:00 AM - 04:00 PM' },
      { id: 3, uid: 8, fid: 7, name: 'Dr. Priya Shinde', spec: 'Pediatrics & Neonatal Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 01:00 PM' },
      { id: 4, uid: 9, fid: 7, name: 'Dr. Vikram Patil', spec: 'General Surgery & Trauma', status: 'Available', days: 'Tue, Thu, Sat', hours: '10:00 AM - 03:00 PM' },
      { id: 5, uid: 11, fid: 8, name: 'Dr. Sanjay More', spec: 'Orthopedics & Joint Care', status: 'Available', days: 'Mon-Fri', hours: '09:30 AM - 02:30 PM' },
      { id: 6, uid: 12, fid: 12, name: 'Dr. Sunil Gaikwad', spec: 'Cardiology & Intensive Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 05:00 PM' },
      { id: 7, uid: 13, fid: 1, name: 'Dr. Smita Kamble', spec: 'Community Health Officer (CHO)', status: 'Available', days: 'Mon-Sat', hours: '08:30 AM - 03:30 PM' },
      { id: 8, uid: 14, fid: 5, name: 'Dr. Meenakshi Pawar', spec: 'General Medicine & Family Health', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 02:00 PM' },
      { id: 9, uid: 15, fid: 11, name: 'Dr. Prakash Bhosale', spec: 'Orthopedic Trauma Surgeon', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 04:00 PM' },
      { id: 10, uid: 16, fid: 10, name: 'Dr. Swati Kadam', spec: 'Obstetrician & High-Risk Pregnancy', status: 'Available', days: 'Mon-Fri', hours: '09:30 AM - 03:30 PM' }
    ];

    const docStmt = db.db.prepare(`
      INSERT INTO doctors (staff_id, user_id, facility_id, name, specialization, availability_status, working_days, working_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of doctors) {
      docStmt.run(d.id, d.uid, d.fid, d.name, d.spec, d.status, d.days, d.hours);
    }
    console.log(`✓ Seeded ${doctors.length} Doctors & Medical Officers`);

    // ----------------------------------------------------
    // 5. ESSENTIAL CLINICAL SERVICES
    // ----------------------------------------------------
    const services = [
      { fid: 1, name: 'Primary ANC Screening & Immunization', status: 'Available', times: '09:00 AM - 01:00 PM' },
      { fid: 1, name: 'Basic First Aid & Blood Sugar Test', status: 'Available', times: '08:00 AM - 04:00 PM' },
      { fid: 4, name: '24x7 Emergency Resuscitation', status: 'Available', times: '24 Hours' },
      { fid: 4, name: 'Normal Delivery / Labor Room', status: 'Available', times: '24 Hours' },
      { fid: 4, name: 'Pathology & Diagnostic Lab (CBC, Urine, Malaria)', status: 'Available', times: '08:00 AM - 04:00 PM' },
      { fid: 7, name: 'Emergency Surgical OT & C-Section', status: 'Available', times: '24 Hours' },
      { fid: 7, name: 'Digital X-Ray & Ultrasonography', status: 'Available', times: '09:00 AM - 05:00 PM' },
      { fid: 7, name: 'Neonatal Stabilization Unit (NBSU)', status: 'Available', times: '24 Hours' },
      { fid: 8, name: '24x7 Trauma & Accident Stabilization', status: 'Available', times: '24 Hours' },
      { fid: 8, name: 'Dental & Eye OPD Clinic', status: 'Available', times: '10:00 AM - 02:00 PM' },
      { fid: 11, name: 'Intensive Care Unit (ICU - 12 Beds)', status: 'Available', times: '24 Hours' },
      { fid: 12, name: 'Tertiary Dialysis & Cardiac Care', status: 'Available', times: '24 Hours' }
    ];

    const srvStmt = db.db.prepare(`
      INSERT INTO services (facility_id, service_name, availability_status, timings)
      VALUES (?, ?, ?, ?)
    `);
    for (const s of services) {
      srvStmt.run(s.fid, s.name, s.status, s.times);
    }
    console.log(`✓ Seeded ${services.length} Essential Clinical Services`);

    // ----------------------------------------------------
    // 6. MEDICINE STOCK INVENTORY (National Essential Medicines List)
    // ----------------------------------------------------
    const medicines = [
      // Khed PHC (fid: 4)
      { fid: 4, name: 'Paracetamol 650mg Tablets', cat: 'Analgesic / Antipyretic', qty: 2400, unit: 'Tablets', stat: 'In Stock' },
      { fid: 4, name: 'Amoxicillin + Clavulanate 625mg', cat: 'Antibiotic', qty: 120, unit: 'Tablets', stat: 'Low Stock' },
      { fid: 4, name: 'Amlodipine 5mg Tablets', cat: 'Antihypertensive', qty: 1800, unit: 'Tablets', stat: 'In Stock' },
      { fid: 4, name: 'Metformin 500mg Tablets', cat: 'Antidiabetic', qty: 1500, unit: 'Tablets', stat: 'In Stock' },
      { fid: 4, name: 'WHO Oral Rehydration Salts (ORS)', cat: 'Electrolyte', qty: 450, unit: 'Sachets', stat: 'In Stock' },
      { fid: 4, name: 'Polyvalent Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 18, unit: 'Vials', stat: 'In Stock' },
      { fid: 4, name: 'Rabies Vaccine (ARV) 0.5ml', cat: 'Vaccine', qty: 25, unit: 'Vials', stat: 'In Stock' },
      { fid: 4, name: 'Iron & Folic Acid (IFA) Tablets', cat: 'Maternal Nutrition', qty: 3200, unit: 'Tablets', stat: 'In Stock' },
      { fid: 4, name: 'Salbutamol Inhaler 100mcg', cat: 'Respiratory', qty: 4, unit: 'Canisters', stat: 'Low Stock' },

      // Manchar CHC (fid: 7)
      { fid: 7, name: 'Paracetamol 650mg Tablets', cat: 'Analgesic / Antipyretic', qty: 4800, unit: 'Tablets', stat: 'In Stock' },
      { fid: 7, name: 'Amoxicillin + Clavulanate 625mg', cat: 'Antibiotic', qty: 950, unit: 'Tablets', stat: 'In Stock' },
      { fid: 7, name: 'Azithromycin 500mg Tablets', cat: 'Antibiotic', qty: 620, unit: 'Tablets', stat: 'In Stock' },
      { fid: 7, name: 'Polyvalent Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 45, unit: 'Vials', stat: 'In Stock' },
      { fid: 7, name: 'Rabies Vaccine (ARV) 0.5ml', cat: 'Vaccine', qty: 60, unit: 'Vials', stat: 'In Stock' },
      { fid: 7, name: 'Oxytocin Injection 10 IU', cat: 'Labor & Delivery', qty: 85, unit: 'Ampoules', stat: 'In Stock' },
      { fid: 7, name: 'Normal Saline (0.9% NaCl) 500ml IV', cat: 'IV Fluids', qty: 380, unit: 'Bottles', stat: 'In Stock' },

      // Shivapur Sub-Centre (fid: 1)
      { fid: 1, name: 'Paracetamol 500mg Tablets', cat: 'Analgesic / Antipyretic', qty: 600, unit: 'Tablets', stat: 'In Stock' },
      { fid: 1, name: 'WHO Oral Rehydration Salts (ORS)', cat: 'Electrolyte', qty: 150, unit: 'Sachets', stat: 'In Stock' },
      { fid: 1, name: 'Zinc Sulfate 20mg Tablets', cat: 'Pediatric Supplement', qty: 400, unit: 'Tablets', stat: 'In Stock' },
      { fid: 1, name: 'Iron & Folic Acid (IFA) Tablets', cat: 'Maternal Nutrition', qty: 1200, unit: 'Tablets', stat: 'In Stock' },
      { fid: 1, name: 'Amoxicillin 250mg Capsules', cat: 'Antibiotic', qty: 0, unit: 'Capsules', stat: 'Out of Stock' },

      // Bhor CHC (fid: 8)
      { fid: 8, name: 'Polyvalent Anti-Snake Venom (ASV)', cat: 'Critical Antidote', qty: 30, unit: 'Vials', stat: 'In Stock' },
      { fid: 8, name: 'Diclofenac Sodium 75mg Inj', cat: 'Analgesic', qty: 140, unit: 'Ampoules', stat: 'In Stock' },
      { fid: 8, name: 'Ciprofloxacin 500mg Tablets', cat: 'Antibiotic', qty: 500, unit: 'Tablets', stat: 'In Stock' },
      { fid: 8, name: 'Atorvastatin 10mg Tablets', cat: 'Cardiovascular', qty: 800, unit: 'Tablets', stat: 'In Stock' },

      // Baramati SDH (fid: 11)
      { fid: 11, name: 'Human Insulin Regular (100 IU/ml)', cat: 'Endocrinology', qty: 45, unit: 'Vials', stat: 'In Stock' },
      { fid: 11, name: 'Ceftriaxone 1g Injection', cat: 'Antibiotic', qty: 320, unit: 'Vials', stat: 'In Stock' },
      { fid: 11, name: 'Enoxaparin 40mg/0.4ml Inj', cat: 'Anticoagulant', qty: 65, unit: 'Syringes', stat: 'In Stock' }
    ];

    const medStmt = db.db.prepare(`
      INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const m of medicines) {
      medStmt.run(m.fid, m.name, m.cat, m.qty, m.unit, m.stat);
    }
    console.log(`✓ Seeded ${medicines.length} Medicine Stock Records`);

    // ----------------------------------------------------
    // 7. JAN AUSHADHI & GENERIC MEDICINE ALTERNATIVES (15 mappings)
    // ----------------------------------------------------
    const generics = [
      {
        brand: 'Augmentin 625 Duo',
        generic: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
        form: 'Tablet',
        cat: 'Antibiotic',
        mrp: 210.0,
        govPrice: 45.0,
        savings: 78,
        desc: 'Broad-spectrum antibiotic for bacterial respiratory, skin, and urinary tract infections.',
        uses: 'Chest infections, sinusitis, dental abscess, post-op wound care'
      },
      {
        brand: 'Pan-D Capsule',
        generic: 'Pantoprazole (40mg) + Domperidone (30mg SR)',
        form: 'Capsule',
        cat: 'Gastrointestinal',
        mrp: 165.0,
        govPrice: 25.0,
        savings: 85,
        desc: 'Proton pump inhibitor with prokinetic agent for acid reflux, GERD, and nausea.',
        uses: 'Acidity, heartburn, peptic ulcers, morning sickness'
      },
      {
        brand: 'Glycomet-GP 1',
        generic: 'Metformin (500mg) + Glimepiride (1mg)',
        form: 'Tablet',
        cat: 'Antidiabetic',
        mrp: 125.0,
        govPrice: 20.0,
        savings: 84,
        desc: 'Combination anti-hyperglycemic agent for Type 2 Diabetes Mellitus glycemic control.',
        uses: 'Type 2 Diabetes, fasting blood sugar management'
      },
      {
        brand: 'Telma-40',
        generic: 'Telmisartan (40mg)',
        form: 'Tablet',
        cat: 'Cardiovascular',
        mrp: 140.0,
        govPrice: 18.0,
        savings: 87,
        desc: 'Angiotensin II receptor antagonist (ARB) for long-term hypertension management.',
        uses: 'High blood pressure, stroke risk reduction, kidney protection in diabetes'
      },
      {
        brand: 'Amlokind-5',
        generic: 'Amlodipine (5mg)',
        form: 'Tablet',
        cat: 'Cardiovascular',
        mrp: 45.0,
        govPrice: 6.0,
        savings: 86,
        desc: 'Calcium channel blocker for lowering blood pressure and chronic stable angina.',
        uses: 'Hypertension, chest pain prevention'
      },
      {
        brand: 'Azithral-500',
        generic: 'Azithromycin (500mg)',
        form: 'Tablet',
        cat: 'Antibiotic',
        mrp: 135.0,
        govPrice: 32.0,
        savings: 76,
        desc: 'Macrolide antibiotic with convenient 3-day or 5-day once-daily dosing course.',
        uses: 'Throat infections, tonsillitis, bronchitis, community pneumonia'
      },
      {
        brand: 'Dolo-650',
        generic: 'Paracetamol (650mg)',
        form: 'Tablet',
        cat: 'Analgesic / Antipyretic',
        mrp: 35.0,
        govPrice: 8.0,
        savings: 77,
        desc: 'High-potency antipyretic and analgesic for pain and acute fever control.',
        uses: 'Viral fever, body ache, headache, osteoarthritis pain'
      },
      {
        brand: 'Montair-LC',
        generic: 'Montelukast (10mg) + Levocetirizine (5mg)',
        form: 'Tablet',
        cat: 'Respiratory / Allergy',
        mrp: 180.0,
        govPrice: 28.0,
        savings: 84,
        desc: 'Leukotriene receptor blocker + antihistamine for seasonal allergic rhinitis & asthma.',
        uses: 'Allergic cough, runny nose, dust allergy, chronic asthma prevention'
      },
      {
        brand: 'Shelcal-500',
        generic: 'Calcium Carbonate (500mg elemental) + Vitamin D3 (250 IU)',
        form: 'Tablet',
        cat: 'Mineral / Vitamin',
        mrp: 130.0,
        govPrice: 24.0,
        savings: 81,
        desc: 'Essential calcium & vitamin D3 supplement for bone mineral density and pregnant mothers.',
        uses: 'Osteoporosis, calcium deficiency, pregnancy bone support'
      },
      {
        brand: 'Cifran-500',
        generic: 'Ciprofloxacin (500mg)',
        form: 'Tablet',
        cat: 'Antibiotic',
        mrp: 95.0,
        govPrice: 18.0,
        savings: 81,
        desc: 'Fluoroquinolone antibiotic for bacterial gastroenteritis, enteric fever, and UTI.',
        uses: 'Typhoid fever, bacterial diarrhea, urinary infections'
      },
      {
        brand: 'Combiflam',
        generic: 'Ibuprofen (400mg) + Paracetamol (325mg)',
        form: 'Tablet',
        cat: 'Pain & Inflammation',
        mrp: 50.0,
        govPrice: 10.0,
        savings: 80,
        desc: 'Dual-action NSAID combination for dental pain, joint inflammation, and sprains.',
        uses: 'Dental toothache, back pain, muscular injuries'
      },
      {
        brand: 'Asthalin Inhaler',
        generic: 'Salbutamol Inhalation Aerosol (100mcg/puff, 200 MDI)',
        form: 'Inhaler',
        cat: 'Respiratory',
        mrp: 160.0,
        govPrice: 65.0,
        savings: 59,
        desc: 'Fast-acting bronchodilator for sudden asthma attack relief and COPD wheezing.',
        uses: 'Acute asthma attack, bronchospasm, breathing difficulty'
      },
      {
        brand: 'Electral Powder',
        generic: 'WHO Formula Oral Rehydration Salts (ORS 21.8g Sachet)',
        form: 'Powder Sachet',
        cat: 'Electrolyte Solutions',
        mrp: 24.0,
        govPrice: 5.0,
        savings: 79,
        desc: 'Life-saving oral rehydration formulation approved by WHO & UNICEF for dehydration.',
        uses: 'Acute diarrhea, heat exhaustion, dehydration, vomiting'
      },
      {
        brand: 'Orofer-XT',
        generic: 'Ferrous Ascorbate + Folic Acid Tablets',
        form: 'Tablet',
        cat: 'Hematology / Maternal',
        mrp: 175.0,
        govPrice: 30.0,
        savings: 83,
        desc: 'High absorption elemental iron supplement for treating microcytic hypochromic anemia.',
        uses: 'Maternal anemia, post-pregnancy recovery, hemoglobin boost'
      },
      {
        brand: 'Betadine 5% Ointment',
        generic: 'Povidone Iodine 5% w/w Microbicidal Ointment (20g tube)',
        form: 'Ointment',
        cat: 'Antiseptic / Wound Care',
        mrp: 95.0,
        govPrice: 22.0,
        savings: 77,
        desc: 'Broad spectrum microbicidal antiseptic for cuts, burns, scrapes, and post-op wound dressings.',
        uses: 'Farm cuts, skin abrasions, infected wounds, burns'
      }
    ];

    const genStmt = db.db.prepare(`
      INSERT INTO generic_medicines (brand_name, generic_name, dosage_form, category, market_price, jan_aushadhi_price, savings_percentage, description, common_uses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const g of generics) {
      genStmt.run(g.brand, g.generic, g.form, g.cat, g.mrp, g.govPrice, g.savings, g.desc, g.uses);
    }
    console.log(`✓ Seeded ${generics.length} Jan Aushadhi & Generic Medicine Alternatives`);

    // ----------------------------------------------------
    // 8. PATIENTS (Registered rural citizens)
    // ----------------------------------------------------
    const patients = [
      { id: 1, uid: 1, bg: 'B+', h: 168, w: 72, alg: 'Penicillin', cond: 'Hypertension (Mild)', emName: 'Kavita Patil', emPhone: '9876543219' },
      { id: 2, uid: 2, bg: 'O+', h: 154, w: 58, alg: 'None', cond: 'Gestational Diabetes (24 Weeks Pregnant)', emName: 'Suresh Jadhav', emPhone: '9876543213' },
      { id: 3, uid: 3, bg: 'A+', h: 150, w: 46, alg: 'Sulfa Drugs', cond: 'Severe Maternal Anemia (Hb 8.2 g/dL)', emName: 'Dattatray Bhosale', emPhone: '9876543214' }
    ];

    const patStmt = db.db.prepare(`
      INSERT INTO patients (patient_id, user_id, blood_group, height_cm, weight_kg, allergies, existing_conditions, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of patients) {
      patStmt.run(p.id, p.uid, p.bg, p.h, p.w, p.alg, p.cond, p.emName, p.emPhone);
    }
    console.log(`✓ Seeded ${patients.length} Patient Medical Profiles`);

    // ----------------------------------------------------
    // 9. MATERNAL & CHILD HEALTH (MCH / RCH Cohorts)
    // ----------------------------------------------------
    const mchRecords = [
      {
        pid: 2,
        cat: 'Pregnant Mother',
        gWeeks: 24,
        edd: '2026-12-28',
        cDob: null,
        hrf: 1,
        hrReason: 'Gestational Diabetes Mellitus (Fasting Sugar: 138 mg/dL)',
        ancDone: 2,
        lastAnc: '2026-08-28',
        nextDue: '2026-09-25',
        immJson: JSON.stringify([
          { name: 'Tetanus Toxoid 1 (TT-1)', date: '2026-06-15', status: 'Completed' },
          { name: 'Tetanus Toxoid 2 (TT-2)', date: '2026-07-20', status: 'Completed' },
          { name: 'Iron Folic Acid (180 Tabs)', date: '2026-08-01', status: 'Issued' }
        ]),
        ashaId: 4,
        notes: 'Under regular dietary counseling by ASHA Surekha Tai. Advised glucose monitoring twice weekly.'
      },
      {
        pid: 3,
        cat: 'Pregnant Mother',
        gWeeks: 32,
        edd: '2026-11-04',
        cDob: null,
        hrf: 1,
        hrReason: 'Severe Iron Deficiency Anemia (Hb 8.2 g/dL) at 32 weeks',
        ancDone: 3,
        lastAnc: '2026-09-02',
        nextDue: '2026-09-18',
        immJson: JSON.stringify([
          { name: 'Tetanus Toxoid Booster', date: '2026-05-10', status: 'Completed' },
          { name: 'IV Iron Sucrose (Dose 1 & 2)', date: '2026-09-02', status: 'Completed' },
          { name: 'Calcium + D3 Supplementation', date: '2026-07-15', status: 'Active' }
        ]),
        ashaId: 5,
        notes: 'High-risk case. Referred to Manchar CHC for repeat Hemoglobin testing and sonography.'
      },
      {
        pid: 2,
        cat: 'Infant/Child',
        gWeeks: null,
        edd: null,
        cDob: '2025-11-15',
        hrf: 0,
        hrReason: null,
        ancDone: 4,
        lastAnc: '2026-08-15',
        nextDue: '2026-11-15',
        immJson: JSON.stringify([
          { name: 'BCG + OPV-0 + Hep-B 0', age: 'At Birth', status: 'Completed' },
          { name: 'Pentavalent-1 + OPV-1 + Rota-1', age: '6 Weeks', status: 'Completed' },
          { name: 'Pentavalent-2 + OPV-2 + Rota-2', age: '10 Weeks', status: 'Completed' },
          { name: 'Pentavalent-3 + OPV-3 + Rota-3', age: '14 Weeks', status: 'Completed' },
          { name: 'Measles-Rubella-1 (MR-1) + Vit A', age: '9 Months', status: 'Completed' },
          { name: 'MR-2 + DPT Booster', age: '16-24 Months', status: 'Upcoming' }
        ]),
        ashaId: 4,
        notes: 'Child growth percentile normal (weight 8.9 kg at 9 months). Immunization up to date.'
      }
    ];

    const mchStmt = db.db.prepare(`
      INSERT INTO maternal_child_health (patient_id, category, gestational_weeks, expected_delivery_date, child_dob, high_risk_flag, high_risk_reason, anc_visits_completed, last_anc_date, next_due_date, immunizations_json, asha_worker_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of mchRecords) {
      mchStmt.run(m.pid, m.cat, m.gWeeks, m.edd, m.cDob, m.hrf, m.hrReason, m.ancDone, m.lastAnc, m.nextDue, m.immJson, m.ashaId, m.notes);
    }
    console.log(`✓ Seeded ${mchRecords.length} Maternal & Child Health Cohort Records`);

    // ----------------------------------------------------
    // 10. EPIDEMIOLOGICAL DISEASE SURVEILLANCE & OUTBREAK RADAR
    // ----------------------------------------------------
    const surveillanceData = [
      {
        vid: 1,
        disease: 'Dengue & Vector-Borne Fever Cluster',
        cat: 'Vector-Borne',
        cases: 14,
        severity: 'Severe/Outbreak',
        status: 'Active',
        reportedBy: 'ASHA Surekha Tai (Shivapur)',
        action: 'Immediate thermal fogging deployed; Abate larvicide applied in 82 open water storage containers.'
      },
      {
        vid: 4,
        disease: 'Acute Diarrheal Disease (ADD)',
        cat: 'Water-Borne',
        cases: 22,
        severity: 'Moderate',
        status: 'Monitoring',
        reportedBy: 'ASHA Kavita Shinde (Velhe)',
        action: 'Bleaching powder super-chlorination of village head tank; distributed 300 ORS and Zinc packets to households.'
      },
      {
        vid: 8,
        disease: 'Severe Maternal Anemia & Nutritional Deficiency',
        cat: 'Nutritional/Chronic',
        cases: 9,
        severity: 'Moderate',
        status: 'Active',
        reportedBy: 'Medical Officer Paud PHC',
        action: 'Weekly Iron-Folic Acid supplementation camp organized; Poshan Abhiyaan nutritional kit distribution initiated.'
      },
      {
        vid: 2,
        disease: 'Influenza-Like Illness (Seasonal Viral ARI)',
        cat: 'Respiratory',
        cases: 35,
        severity: 'Moderate',
        status: 'Monitoring',
        reportedBy: 'Dr. Rajesh Kulkarni (Khed PHC)',
        action: 'Special fever triage OPD established; symptomatic Paracetamol and warm hydration awareness broadcasted.'
      },
      {
        vid: 10,
        disease: 'Scrub Typhus / Fever of Unknown Origin',
        cat: 'Vector-Borne',
        cases: 6,
        severity: 'Severe/Outbreak',
        status: 'Active',
        reportedBy: 'Junnar SDH Epidemiology Team',
        action: 'Rapid diagnostic ELISA testing mobilized; Doxycycline prophylaxis dispensed to agricultural field workers.'
      },
      {
        vid: 6,
        disease: 'Enteric Gastrointestinal Illness (Mild)',
        cat: 'Water-Borne',
        cases: 11,
        severity: 'Mild',
        status: 'Contained',
        reportedBy: 'Saswad PHC Health Inspector',
        action: 'Contaminated pipeline repaired; OT testing confirms residual chlorine at 0.5 ppm at tail-end taps.'
      }
    ];

    const survStmt = db.db.prepare(`
      INSERT INTO disease_surveillance (village_id, disease_name, category, cases_reported, severity, containment_status, reported_by, action_taken)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of surveillanceData) {
      survStmt.run(s.vid, s.disease, s.cat, s.cases, s.severity, s.status, s.reportedBy, s.action);
    }
    console.log(`✓ Seeded ${surveillanceData.length} Disease Surveillance & Outbreak Radar Alerts`);

    // ----------------------------------------------------
    // 11. HEALTH RECORDS (Clinical encounters)
    // ----------------------------------------------------
    const records = [
      {
        pid: 1, did: 1, fid: 4, date: '2026-08-14',
        sym: 'Recurrent headaches, mild dizziness upon standing, fatigue for 2 weeks.',
        diag: 'Essential Hypertension (Stage 1) - BP 148/94 mmHg.',
        rx: 'Tab. Amlodipine 5mg once daily morning after breakfast for 30 days. Advised low salt diet (<5g/day) and daily 30-min walking.',
        vitals: JSON.stringify({ bp: '148/94', pulse: 78, temp: 98.4, spo2: 98, weight: 72 })
      },
      {
        pid: 2, did: 2, fid: 4, date: '2026-08-28',
        sym: 'Polyuria, mild gestational weight gain, postprandial fatigue at 24 weeks.',
        diag: 'Gestational Diabetes Mellitus (GDM) - 75g OGTT: 162 mg/dL at 2 hrs.',
        rx: 'Medical Nutrition Therapy (MNT). High-fiber, split meals. Cap. Calcium 500mg daily. Tab. IFA 1 tab daily.',
        vitals: JSON.stringify({ bp: '118/76', pulse: 82, temp: 98.6, spo2: 99, weight: 58 })
      }
    ];

    const recStmt = db.db.prepare(`
      INSERT INTO health_records (patient_id, doctor_id, facility_id, visit_date, symptoms, diagnosis_notes, prescription, vitals_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of records) {
      recStmt.run(r.pid, r.did, r.fid, r.date, r.sym, r.diag, r.rx, r.vitals);
    }
    console.log(`✓ Seeded ${records.length} Health Records`);

    // ----------------------------------------------------
    // 12. APPOINTMENTS (OPD queue for today & future)
    // ----------------------------------------------------
    const today = new Date().toISOString().split('T')[0];
    const appointments = [
      { pid: 1, fid: 4, did: 1, date: today, time: '10:00 AM', stat: 'Completed', reason: 'Monthly Blood Pressure checkup and medication refill.', notes: 'BP controlled at 128/82. Refilled Amlodipine 5mg.' },
      { pid: 2, fid: 4, did: 2, date: today, time: '11:30 AM', stat: 'Scheduled', reason: 'Routine Antenatal ANC checkup & GDM blood sugar review.', notes: null },
      { pid: 3, fid: 4, did: 1, date: today, time: '02:00 PM', stat: 'Scheduled', reason: 'Severe weakness and post-exertional dyspnea.', notes: null }
    ];

    const apptStmt = db.db.prepare(`
      INSERT INTO appointments (patient_id, facility_id, doctor_id, appointment_date, appointment_time, status, reason, doctor_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of appointments) {
      apptStmt.run(a.pid, a.fid, a.did, a.date, a.time, a.stat, a.reason, a.notes);
    }
    console.log(`✓ Seeded ${appointments.length} Appointments`);

    // ----------------------------------------------------
    // 13. REFERRALS (Inter-tier referral workflow)
    // ----------------------------------------------------
    const referrals = [
      {
        pid: 3, rFid: 4, tFid: 7, did: 1,
        reason: 'Severe Anemia (Hb 8.2 g/dL) in 3rd trimester pregnancy needing IV Iron Sucrose therapy & obstetric sonography.',
        prio: 'Urgent', stat: 'Pending',
        summary: '31yo pregnant female at 32 weeks presenting with marked pallor, fatigue, Hb 8.2 g/dL. PHC lacks advanced obstetric ultrasound. Referred to Manchar CHC for parenteral iron therapy.'
      },
      {
        pid: 1, rFid: 4, tFid: 12, did: 1,
        reason: 'Suspected Angina / Ischemic ECG changes needing 2D Echo.',
        prio: 'Routine', stat: 'Accepted',
        summary: 'Patient had episodic retrosternal chest heaviness during uphill walking. ECG showed non-specific T-wave flattening in V4-V6. Referred to Pune District Hospital for TMT/Echo.'
      }
    ];

    const refStmt = db.db.prepare(`
      INSERT INTO referrals (patient_id, referring_facility_id, referred_facility_id, doctor_id, reason, priority, status, clinical_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ref of referrals) {
      refStmt.run(ref.pid, ref.rFid, ref.tFid, ref.did, ref.reason, ref.prio, ref.stat, ref.summary);
    }
    console.log(`✓ Seeded ${referrals.length} Inter-Tier Referrals`);

    // ----------------------------------------------------
    // 14. EMERGENCY SERVICES
    // ----------------------------------------------------
    const emergServices = [
      { fid: 4, amb: 1, contact: '108 / 02135-222340', ambPhone: '9822010801', respTime: 18, trauma: 'Level 3 (PHC Stabilization)' },
      { fid: 7, amb: 1, contact: '108 / 02133-223450', ambPhone: '9822010802', respTime: 12, trauma: 'Level 2 (CHC Trauma Care)' },
      { fid: 8, amb: 1, contact: '108 / 02113-222501', ambPhone: '9822010803', respTime: 15, trauma: 'Level 2 (CHC Trauma Care)' },
      { fid: 11, amb: 1, contact: '108 / 02112-243500', ambPhone: '9822010804', respTime: 10, trauma: 'Level 1 (Sub-District Trauma & ICU)' },
      { fid: 12, amb: 1, contact: '108 / 020-27280450', ambPhone: '9822010805', respTime: 8, trauma: 'Level 1 (Tertiary District Hospital)' }
    ];

    const emStmt = db.db.prepare(`
      INSERT INTO emergency_services (facility_id, ambulance_available, emergency_contact, ambulance_phone, response_time_minutes, trauma_care_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const em of emergServices) {
      emStmt.run(em.fid, em.amb, em.contact, em.ambPhone, em.respTime, em.trauma);
    }
    console.log(`✓ Seeded ${emergServices.length} Emergency 108 Services`);

    // ----------------------------------------------------
    // 15. FEEDBACK & GRIEVANCE COMPLAINTS
    // ----------------------------------------------------
    const feedbackList = [
      { pid: 1, fid: 4, rating: 5, text: 'Dr. Rajesh explained blood pressure care with utmost kindness. Quick service at pharmacy counter.' },
      { pid: 2, fid: 4, rating: 4, text: 'ASHA worker Surekha Tai accompanied me for ANC test. Lab technician took blood sample gently.' }
    ];

    const fbStmt = db.db.prepare(`
      INSERT INTO feedback (patient_id, facility_id, rating, feedback_text)
      VALUES (?, ?, ?, ?)
    `);
    for (const f of feedbackList) {
      fbStmt.run(f.pid, f.fid, f.rating, f.text);
    }

    const complaints = [
      {
        pid: 1, fid: 4, type: 'Medicine Unavailable',
        desc: 'Amoxicillin syrup for pediatric cough was out of stock on Thursday afternoon at Khed PHC.',
        stat: 'Resolved',
        res: 'District warehouse dispatched fresh batch of 200 pediatric suspensions on Friday morning. Stock replenished.'
      },
      {
        pid: 3, fid: 2, type: 'Facility Closed',
        desc: 'Sub-Centre Velhe main gate was locked until 10:30 AM on Tuesday when immunization was scheduled.',
        stat: 'In Progress',
        res: 'Notice issued to Auxiliary Nurse Midwife (ANM); compensatory immunization session conducted on Thursday.'
      }
    ];

    const compStmt = db.db.prepare(`
      INSERT INTO complaints (patient_id, facility_id, complaint_type, description, status, admin_response)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const c of complaints) {
      compStmt.run(c.pid, c.fid, c.type, c.desc, c.stat, c.res);
    }
    console.log(`✓ Seeded Feedback & Citizen Grievance Records`);

    // ----------------------------------------------------
    // 16. RURAL HEALTH CAMPS
    // ----------------------------------------------------
    const camps = [
      {
        fid: 4, vid: 1, name: 'Mega Rural Eye & Diabetes Screening Camp',
        loc: 'Zilla Parishad Primary School, Shivapur',
        date: '2026-09-28', start: '09:00 AM', end: '04:00 PM',
        services: 'Ophthalmology, Cataract Screening, Blood Sugar & HbA1c, Free Reading Glasses',
        target: 'Villagers 45+ & Diabetics', stat: 'Upcoming'
      },
      {
        fid: 7, vid: 4, name: 'Maternal & Child Poshan Abhiyaan Health Mela',
        loc: 'Gram Panchayat Hall, Velhe',
        date: '2026-10-05', start: '10:00 AM', end: '03:00 PM',
        services: 'Obstetrics Consultation, Pediatric Growth Monitoring, Catch-up Immunization, Nutrition Kits',
        target: 'Pregnant Women & Mothers with Infants', stat: 'Upcoming'
      },
      {
        fid: 8, vid: 8, name: 'Tribal Area General Health & Blood Pressure Camp',
        loc: 'Ashram Shala Ground, Ghoti Khurd',
        date: '2026-10-12', start: '09:30 AM', end: '03:30 PM',
        services: 'General Checkup, 12-Lead ECG, Free Chronic Drugs, Sickle Cell / Anemia Screening',
        target: 'Tribal Families & Agricultural Workers', stat: 'Upcoming'
      }
    ];

    const campStmt = db.db.prepare(`
      INSERT INTO health_camps (facility_id, village_id, camp_name, location, camp_date, start_time, end_time, services_offered, target_audience, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cp of camps) {
      campStmt.run(cp.fid, cp.vid, cp.name, cp.loc, cp.date, cp.start, cp.end, cp.services, cp.target, cp.stat);
    }
    console.log(`✓ Seeded ${camps.length} Scheduled Rural Health Camps`);

    // ----------------------------------------------------
    // 17. NOTIFICATIONS
    // ----------------------------------------------------
    const notifications = [
      { uid: 1, title: 'Appointment Confirmed', msg: 'Your consultation with Dr. Rajesh Kulkarni at Khed PHC is confirmed for today at 10:00 AM.', type: 'appointment' },
      { uid: 2, title: 'ANC Checkup Reminder', msg: 'Your 24-week Antenatal Care checkup with Dr. Ananya Deshmukh is scheduled for 11:30 AM today.', type: 'appointment' },
      { uid: 4, title: 'High-Risk AI Screening Alert', msg: 'Patient Suresh Jadhav reported severe chest pain with critical risk flagged. Immediate 108 action advised.', type: 'screening' },
      { uid: 4, title: 'Outbreak Alert: Dengue in Shivapur', msg: '14 active cases detected in Shivapur. Door-to-door larval check initiated.', type: 'general' },
      { uid: 6, title: 'New Referral Received', msg: 'Urgent referral for Patient Mangal Bhosale (Severe Anemia) pending clinical review.', type: 'referral' },
      { uid: 10, title: 'Citizen Grievance Update', msg: 'Grievance ticket #1 regarding pediatric syrup resolved; stock replenishment confirmed.', type: 'complaint' }
    ];

    const notifStmt = db.db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);
    for (const n of notifications) {
      notifStmt.run(n.uid, n.title, n.msg, n.type);
    }
    console.log(`✓ Seeded ${notifications.length} User Notifications`);
  });

  console.log('✅ RuralCare massive database seeding completed successfully!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
