const bcrypt = require('bcryptjs');
const db = require('./db');
const { maharashtraVillages, maharashtraFacilities } = require('./maharashtraData');
const { refreshAllVillageScores } = require('../services/accessibilityScore');

async function seed() {
  console.log('🌱 Starting RuralCare massive database seeding for all 36 Districts of Maharashtra...');

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
    // 1. VILLAGES (137 authentic locations covering all 36 districts)
    // ----------------------------------------------------
    const villageStmt = db.db.prepare(`
      INSERT INTO villages (village_id, village_name, district, state, population, latitude, longitude, accessibility_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of maharashtraVillages) {
      villageStmt.run(v.id, v.name, v.district, v.state, v.population, v.lat, v.lng, v.accessibility);
    }
    console.log(`✓ Seeded ${maharashtraVillages.length} Villages across all 36 Districts of Maharashtra`);

    // ----------------------------------------------------
    // 2. USERS (Demo accounts, state medical officers & citizens)
    // ----------------------------------------------------
    const baseUsers = [
      // Core Demo accounts
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
      { id: 15, name: 'Dr. Prakash Bhosale', age: 47, gender: 'Male', phone: '9876543238', email: 'prakash.bhosale@ruralcare.in', vid: 11, role: 'doctor' },
      { id: 16, name: 'Dr. Swati Kadam', age: 37, gender: 'Female', phone: '9876543239', email: 'swati.kadam@ruralcare.in', vid: 10, role: 'doctor' },

      // Additional Regional Doctors for District Hospitals across Maharashtra
      { id: 17, name: 'Dr. Nitin Kulkarni', age: 46, gender: 'Male', phone: '9876543250', email: 'nitin.ahmednagar@ruralcare.in', vid: 13, role: 'doctor' },
      { id: 18, name: 'Dr. Vandana Rathod', age: 42, gender: 'Female', phone: '9876543251', email: 'vandana.akola@ruralcare.in', vid: 17, role: 'doctor' },
      { id: 19, name: 'Dr. Mohan Meshram', age: 50, gender: 'Male', phone: '9876543252', email: 'mohan.amravati@ruralcare.in', vid: 20, role: 'doctor' },
      { id: 20, name: 'Dr. Farooq Qureshi', age: 48, gender: 'Male', phone: '9876543253', email: 'farooq.aurangabad@ruralcare.in', vid: 24, role: 'doctor' },
      { id: 21, name: 'Dr. Ashwini Sonawane', age: 36, gender: 'Female', phone: '9876543254', email: 'ashwini.beed@ruralcare.in', vid: 29, role: 'doctor' },
      { id: 22, name: 'Dr. Tanaji Salunkhe', age: 45, gender: 'Male', phone: '9876543255', email: 'tanaji.kolhapur@ruralcare.in', vid: 65, role: 'doctor' },
      { id: 23, name: 'Dr. Pratibha Dongre', age: 43, gender: 'Female', phone: '9876543256', email: 'pratibha.nagpur@ruralcare.in', vid: 74, role: 'doctor' },
      { id: 24, name: 'Dr. Devendra Madavi', age: 40, gender: 'Male', phone: '9876543257', email: 'devendra.gadchiroli@ruralcare.in', vid: 46, role: 'doctor' },
      { id: 25, name: 'Dr. Surekha Valvi', age: 35, gender: 'Female', phone: '9876543258', email: 'surekha.nandurbar@ruralcare.in', vid: 81, role: 'doctor' },
      { id: 26, name: 'Dr. Hemant Bagul', age: 51, gender: 'Male', phone: '9876543259', email: 'hemant.nashik@ruralcare.in', vid: 85, role: 'doctor' },
      { id: 27, name: 'Dr. Jayashree Tare', age: 39, gender: 'Female', phone: '9876543260', email: 'jayashree.palghar@ruralcare.in', vid: 93, role: 'doctor' },
      { id: 28, name: 'Dr. Santosh Mane', age: 47, gender: 'Male', phone: '9876543261', email: 'santosh.solapur@ruralcare.in', vid: 121, role: 'doctor' }
    ];

    const userStmt = db.db.prepare(`
      INSERT INTO users (user_id, name, age, gender, phone, email, village_id, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of baseUsers) {
      userStmt.run(u.id, u.name, u.age, u.gender, u.phone, u.email, u.vid, u.role, demoPasswordHash);
    }
    console.log(`✓ Seeded ${baseUsers.length} Users & Medical Staff`);

    // ----------------------------------------------------
    // 3. HEALTHCARE FACILITIES (95 facilities across all 36 districts)
    // ----------------------------------------------------
    const facStmt = db.db.prepare(`
      INSERT INTO facilities (facility_id, facility_name, facility_type, address, village_id, latitude, longitude, contact, opening_hours, current_status, emergency_available, total_beds, available_beds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of maharashtraFacilities) {
      facStmt.run(f.id, f.name, f.type, f.address, f.vid, f.lat, f.lng, f.contact, f.hours, f.status, f.emer, f.tot, f.avail);
    }
    console.log(`✓ Seeded ${maharashtraFacilities.length} Healthcare Facilities across Maharashtra`);

    // ----------------------------------------------------
    // 4. DOCTORS & SPECIALISTS
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
      { id: 10, uid: 16, fid: 10, name: 'Dr. Swati Kadam', spec: 'Obstetrician & High-Risk Pregnancy', status: 'Available', days: 'Mon-Fri', hours: '09:30 AM - 03:30 PM' },

      // Regional Doctors across Maharashtra
      { id: 11, uid: 17, fid: 13, name: 'Dr. Nitin Kulkarni', spec: 'General Physician & Critical Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 04:00 PM' },
      { id: 12, uid: 18, fid: 17, name: 'Dr. Vandana Rathod', spec: 'Gynecology & Obstetric Surgery', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 03:00 PM' },
      { id: 13, uid: 19, fid: 21, name: 'Dr. Mohan Meshram', spec: 'Tribal Health & Tropical Medicine', status: 'Available', days: 'Mon-Sat', hours: '08:30 AM - 04:30 PM' },
      { id: 14, uid: 20, fid: 23, name: 'Dr. Farooq Qureshi', spec: 'General Surgery & Trauma Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 05:00 PM' },
      { id: 15, uid: 21, fid: 27, name: 'Dr. Ashwini Sonawane', spec: 'Pediatric Care & Nutrition', status: 'Available', days: 'Mon-Fri', hours: '09:00 AM - 03:00 PM' },
      { id: 16, uid: 22, fid: 49, name: 'Dr. Tanaji Salunkhe', spec: 'Orthopedics & Emergency Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 04:00 PM' },
      { id: 17, uid: 23, fid: 56, name: 'Dr. Pratibha Dongre', spec: 'Cardiology & Intensive Medicine', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 05:00 PM' },
      { id: 18, uid: 24, fid: 38, name: 'Dr. Devendra Madavi', spec: 'Epidemiology & Malaria Specialist', status: 'Available', days: 'Mon-Sat', hours: '08:30 AM - 04:00 PM' },
      { id: 19, uid: 25, fid: 62, name: 'Dr. Surekha Valvi', spec: 'Maternal Nutrition & High-Risk ANC', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 03:30 PM' },
      { id: 20, uid: 26, fid: 64, name: 'Dr. Hemant Bagul', spec: 'Chest & Respiratory Medicine', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 04:00 PM' },
      { id: 21, uid: 27, fid: 70, name: 'Dr. Jayashree Tare', spec: 'Community Health & Malnutrition Care', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 03:00 PM' },
      { id: 22, uid: 28, fid: 85, name: 'Dr. Santosh Mane', spec: 'Emergency Medicine & Nephrology', status: 'Available', days: 'Mon-Sat', hours: '09:00 AM - 05:00 PM' }
    ];

    const docStmt = db.db.prepare(`
      INSERT INTO doctors (staff_id, user_id, facility_id, name, specialization, availability_status, working_days, working_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of doctors) {
      docStmt.run(d.id, d.uid, d.fid, d.name, d.spec, d.status, d.days, d.hours);
    }
    console.log(`✓ Seeded ${doctors.length} Doctors & Specialized Medical Staff`);

    // ----------------------------------------------------
    // 5. ESSENTIAL CLINICAL SERVICES
    // ----------------------------------------------------
    const srvStmt = db.db.prepare(`
      INSERT INTO services (facility_id, service_name, availability_status, timings)
      VALUES (?, ?, ?, ?)
    `);

    // Populate tailored services for all facilities
    let serviceCount = 0;
    for (const f of maharashtraFacilities) {
      if (f.type === 'Sub-Centre') {
        srvStmt.run(f.id, 'Primary ANC Screening & Immunization', 'Available', '09:00 AM - 01:00 PM');
        srvStmt.run(f.id, 'Basic First Aid & Blood Sugar Test', 'Available', '08:00 AM - 04:00 PM');
        serviceCount += 2;
      } else if (f.type === 'PHC') {
        srvStmt.run(f.id, 'General Outpatient (OPD) & Screening', 'Available', '08:00 AM - 04:00 PM');
        srvStmt.run(f.id, 'Normal Delivery / 24x7 Labor Room', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Pathology & Diagnostic Lab (CBC, Urine, Malaria)', 'Available', '08:00 AM - 04:00 PM');
        srvStmt.run(f.id, '24x7 Emergency Resuscitation & Snakebite Care', 'Available', '24 Hours');
        serviceCount += 4;
      } else if (f.type === 'CHC') {
        srvStmt.run(f.id, '24x7 Emergency Resuscitation', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Emergency Surgical OT & C-Section', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Digital X-Ray & Ultrasonography', 'Available', '09:00 AM - 05:00 PM');
        srvStmt.run(f.id, 'Neonatal Stabilization Unit (NBSU)', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Dental & Eye OPD Clinic', 'Available', '10:00 AM - 02:00 PM');
        serviceCount += 5;
      } else {
        // Sub-District or Government Hospital
        srvStmt.run(f.id, '24x7 Level-1 Emergency & Trauma Resuscitation', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Intensive Care Unit (ICU & Critical Care)', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Advanced Multi-Specialty Surgical OT', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Blood Bank & Component Storage', 'Available', '24 Hours');
        srvStmt.run(f.id, 'Comprehensive Dialysis & Cardiology Unit', 'Available', '24 Hours');
        serviceCount += 5;
      }
    }
    console.log(`✓ Seeded ${serviceCount} Essential Clinical Services`);

    // ----------------------------------------------------
    // 6. MEDICINE STOCK INVENTORY
    // ----------------------------------------------------
    const medStmt = db.db.prepare(`
      INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let medStockCount = 0;
    const essentialMedTemplates = [
      { name: 'Paracetamol 650mg Tablets', cat: 'Analgesic / Antipyretic', baseQty: 3000, unit: 'Tablets' },
      { name: 'Amoxicillin + Clavulanate 625mg', cat: 'Antibiotic', baseQty: 800, unit: 'Tablets' },
      { name: 'Amlodipine 5mg Tablets', cat: 'Antihypertensive', baseQty: 1500, unit: 'Tablets' },
      { name: 'Metformin 500mg Tablets', cat: 'Antidiabetic', baseQty: 1800, unit: 'Tablets' },
      { name: 'WHO Oral Rehydration Salts (ORS)', cat: 'Electrolyte', baseQty: 600, unit: 'Sachets' },
      { name: 'Polyvalent Anti-Snake Venom (ASV)', cat: 'Critical Antidote', baseQty: 40, unit: 'Vials' },
      { name: 'Rabies Vaccine (ARV) 0.5ml', cat: 'Vaccine', baseQty: 50, unit: 'Vials' },
      { name: 'Iron & Folic Acid (IFA) Tablets', cat: 'Maternal Nutrition', baseQty: 4000, unit: 'Tablets' }
    ];

    // Seed essentials across all facilities with realistic variance
    for (const f of maharashtraFacilities) {
      const beds = f.tot || f.total_beds || 10;
      for (const t of essentialMedTemplates) {
        let qty = Math.floor(t.baseQty * (beds / 30) * (0.6 + Math.random() * 0.8));
        qty = Math.max(15, qty);
        let status = 'In Stock';
        if (qty < 25) status = 'Low Stock';
        medStmt.run(f.id, t.name, t.cat, qty, t.unit, status);
        medStockCount++;
      }
    }
    console.log(`✓ Seeded ${medStockCount} Medicine Stock Records across facilities`);

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
        reportedBy: 'ASHA Surekha Tai (Shivapur, Pune)',
        action: 'Immediate thermal fogging deployed; Abate larvicide applied in 82 open water storage containers.'
      },
      {
        vid: 20,
        disease: 'Severe Acute Malnutrition (SAM) & Diarrheal Illness',
        cat: 'Nutritional/Chronic',
        cases: 28,
        severity: 'Severe/Outbreak',
        status: 'Active',
        reportedBy: 'Medical Officer Dharni Sub-District Hospital (Melghat, Amravati)',
        action: 'Emergency Nutrition Rehabilitation Centre (NRC) beds activated; therapeutic food and ORS packets dispatched.'
      },
      {
        vid: 46,
        disease: 'Falciparum Malaria Outbreak Cluster',
        cat: 'Vector-Borne',
        cases: 38,
        severity: 'Severe/Outbreak',
        status: 'Active',
        reportedBy: 'Epidemiology Field Officer (Aheri, Gadchiroli)',
        action: 'Mass blood survey (MBS) conducted; ACT combination therapy dispensed; indoor residual spray (IRS) executed.'
      },
      {
        vid: 81,
        disease: 'Sickle Cell Anemia Crises & Pediatric Pneumonia',
        cat: 'Nutritional/Chronic',
        cases: 19,
        severity: 'Moderate',
        status: 'Active',
        reportedBy: 'Dhadgaon Tribal Health Mission (Nandurbar)',
        action: 'HPLC electrophoresis screening team deployed; Hydroxyurea therapy initiated for verified trait carriers.'
      },
      {
        vid: 93,
        disease: 'Monsoon Leptospirosis & Snakebite Surge',
        cat: 'Other',
        cases: 12,
        severity: 'Moderate',
        status: 'Monitoring',
        reportedBy: 'Jawhar Cottage Hospital Team (Palghar)',
        action: 'Doxycycline 200mg chemoprophylaxis distributed to paddy workers; 100 vials of ASV positioned at PHCs.'
      },
      {
        vid: 121,
        disease: 'Enteric Typhoid Fever & Water Contamination',
        cat: 'Water-Borne',
        cases: 15,
        severity: 'Moderate',
        status: 'Monitoring',
        reportedBy: 'Pandharpur Health Inspector (Solapur)',
        action: 'Zilla Parishad water purification plant flushed; chlorination levels maintained at 2.0 ppm.'
      },
      {
        vid: 10,
        disease: 'Scrub Typhus / Fever of Unknown Origin',
        cat: 'Vector-Borne',
        cases: 6,
        severity: 'Moderate',
        status: 'Active',
        reportedBy: 'Junnar SDH Epidemiology Team (Pune)',
        action: 'Rapid diagnostic ELISA testing mobilized; Doxycycline prophylaxis dispensed to agricultural field workers.'
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
    // 12. APPOINTMENTS
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
    // 14. EMERGENCY 108 SERVICES (Covering all emergency facilities across Maharashtra)
    // ----------------------------------------------------
    const emStmt = db.db.prepare(`
      INSERT INTO emergency_services (facility_id, ambulance_available, emergency_contact, ambulance_phone, response_time_minutes, trauma_care_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let emergencyCount = 0;
    for (const f of maharashtraFacilities) {
      if (f.emer === 1) {
        let traumaLevel = 'Level 2 (Secondary Stabilization & CHC Trauma)';
        let respTime = 14;
        if (f.type === 'Government Hospital') {
          traumaLevel = 'Level 1 (Tertiary District Hospital & Trauma Center)';
          respTime = 8;
        } else if (f.type === 'Sub-District Hospital') {
          traumaLevel = 'Level 1 (Sub-District Trauma & ICU)';
          respTime = 11;
        } else if (f.type === 'PHC') {
          traumaLevel = 'Level 3 (PHC Emergency Stabilization)';
          respTime = 18;
        }

        const ambPhone = `108 / ${f.contact.split(' ')[0] || '108'}`;
        emStmt.run(f.id, 1, `108 / ${f.contact}`, ambPhone, respTime, traumaLevel);
        emergencyCount++;
      }
    }
    console.log(`✓ Seeded ${emergencyCount} Emergency 108 Services across Maharashtra facilities`);

    // ----------------------------------------------------
    // 15. FEEDBACK & GRIEVANCE COMPLAINTS
    // ----------------------------------------------------
    const feedbackList = [
      { pid: 1, fid: 4, rating: 5, text: 'Dr. Rajesh explained blood pressure care with utmost kindness. Quick service at pharmacy counter.' },
      { pid: 2, fid: 4, rating: 4, text: 'ASHA worker Surekha Tai accompanied me for ANC test. Lab technician took blood sample gently.' },
      { pid: 3, fid: 21, rating: 5, text: 'The doctors at Dharni Sub-District Hospital provided free nutrition kits and medicines promptly.' },
      { pid: 1, fid: 56, rating: 5, text: 'GMC Nagpur emergency ward was very responsive during our emergency transfer.' }
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
    // 16. RURAL HEALTH CAMPS (Statewide coverage)
    // ----------------------------------------------------
    const camps = [
      {
        fid: 4, vid: 1, name: 'Pune Rural Eye & Diabetes Screening Camp',
        loc: 'Zilla Parishad Primary School, Shivapur',
        date: '2026-09-28', start: '09:00 AM', end: '04:00 PM',
        services: 'Ophthalmology, Cataract Screening, Blood Sugar & HbA1c, Free Reading Glasses',
        target: 'Villagers 45+ & Diabetics', stat: 'Upcoming'
      },
      {
        fid: 21, vid: 20, name: 'Melghat Tribal Maternal & Child Poshan Mela',
        loc: 'Ashram Shala Ground, Dharni Tehsil, Amravati',
        date: '2026-10-04', start: '09:00 AM', end: '03:30 PM',
        services: 'Pediatric SAM Screening, Obstetric Sonography, Iron Infusion, Nutrition Kit Distribution',
        target: 'Tribal Mothers & Under-5 Children', stat: 'Upcoming'
      },
      {
        fid: 38, vid: 46, name: 'Gadchiroli Forest Malaria & Sickle Cell Screening Camp',
        loc: 'Gram Panchayat Bhavan, Aheri',
        date: '2026-10-10', start: '08:30 AM', end: '03:00 PM',
        services: 'Rapid Diagnostic Malaria Tests, Sickle Cell Electrophoresis, Mosquito Net Distribution',
        target: 'Forest Dwellers & Agricultural Families', stat: 'Upcoming'
      },
      {
        fid: 62, vid: 81, name: 'Satpura Hilly Belt General Medical Camp',
        loc: 'Dhadgaon Tribal School Ground, Nandurbar',
        date: '2026-10-15', start: '09:30 AM', end: '04:00 PM',
        services: 'General Health OPD, Pediatric Checkup, Free Antibiotics, Antenatal Examination',
        target: 'Hill-top Village Communities', stat: 'Upcoming'
      },
      {
        fid: 70, vid: 93, name: 'Palghar Tribal Malnutrition & Orthopedic Camp',
        loc: 'Jawhar Cottage Hospital Community Hall',
        date: '2026-10-22', start: '09:00 AM', end: '03:00 PM',
        services: 'Joint Pain Assessment, Bone Density Scanning, Child Growth Monitoring',
        target: 'Tribal Elders & Children', stat: 'Upcoming'
      },
      {
        fid: 86, vid: 121, name: 'Solapur Pandharpur Pilgrim & Rural Health Checkup',
        loc: 'Zilla Parishad High School, Pandharpur',
        date: '2026-10-28', start: '08:00 AM', end: '02:00 PM',
        services: 'Cardiac Screening, ECG, Diabetes Blood Test, Geriatric Medicine',
        target: 'Rural Pilgrims & Senior Citizens', stat: 'Upcoming'
      }
    ];

    const campStmt = db.db.prepare(`
      INSERT INTO health_camps (facility_id, village_id, camp_name, location, camp_date, start_time, end_time, services_offered, target_audience, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cp of camps) {
      campStmt.run(cp.fid, cp.vid, cp.name, cp.loc, cp.date, cp.start, cp.end, cp.services, cp.target, cp.stat);
    }
    console.log(`✓ Seeded ${camps.length} Scheduled Rural Health Camps across Maharashtra`);

    // ----------------------------------------------------
    // 17. NOTIFICATIONS
    // ----------------------------------------------------
    const notifications = [
      { uid: 1, title: 'Appointment Confirmed', msg: 'Your consultation with Dr. Rajesh Kulkarni at Khed PHC is confirmed for today at 10:00 AM.', type: 'appointment' },
      { uid: 2, title: 'ANC Checkup Reminder', msg: 'Your 24-week Antenatal Care checkup with Dr. Ananya Deshmukh is scheduled for 11:30 AM today.', type: 'appointment' },
      { uid: 4, title: 'High-Risk AI Screening Alert', msg: 'Patient Suresh Jadhav reported severe chest pain with critical risk flagged. Immediate 108 action advised.', type: 'screening' },
      { uid: 4, title: 'Outbreak Alert: Dengue in Shivapur', msg: '14 active cases detected in Shivapur. Door-to-door larval check initiated.', type: 'general' },
      { uid: 6, title: 'New Referral Received', msg: 'Urgent referral for Patient Mangal Bhosale (Severe Anemia) pending clinical review.', type: 'referral' },
      { uid: 10, title: 'Citizen Grievance Update', msg: 'Grievance ticket #1 regarding pediatric syrup resolved; stock replenishment confirmed.', type: 'complaint' },
      { uid: 10, title: 'Maharashtra State GIS Expanded', msg: 'All 36 districts of Maharashtra now synced with verified public healthcare facilities and rural locations.', type: 'general' }
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

  // Calculate and refresh real accessibility scores for all villages based on new facility coordinates
  console.log('⚡ Computing geospatial accessibility indices for all Maharashtra villages...');
  refreshAllVillageScores();
  console.log('✅ Computed real accessibility scores for all villages based on nearest healthcare facilities!');

  console.log('🎉 Full Maharashtra Database Seeding Completed Successfully!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
