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
    // 1. VILLAGES (325 locations covering all 36 districts)
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
    // 2. HEALTHCARE FACILITIES (361 facilities across all 36 districts)
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
    // 3. USERS & EXTENSIVE DOCTOR / MEDICAL STAFF ROSTER
    // ----------------------------------------------------
    const baseUsers = [
      // Core Demo accounts
      { id: 1, name: 'Ramesh Patil', age: 48, gender: 'Male', phone: '9876543210', email: 'ramesh@ruralcare.in', vid: 1, role: 'citizen' },
      { id: 2, name: 'Sunita Jadhav', age: 27, gender: 'Female', phone: '9876543211', email: 'sunita@ruralcare.in', vid: 1, role: 'citizen' },
      { id: 3, name: 'Mangal Bhosale', age: 31, gender: 'Female', phone: '9876543212', email: 'mangal@ruralcare.in', vid: 4, role: 'citizen' },
      { id: 4, name: 'Sunita Bai', age: 36, gender: 'Female', phone: '9876543220', email: 'sunita.asha@ruralcare.in', vid: 1, role: 'asha' },
      { id: 5, name: 'Kavita Shinde', age: 34, gender: 'Female', phone: '9876543221', email: 'kavita.asha@ruralcare.in', vid: 4, role: 'asha' },
      { id: 6, name: 'District Officer Sharma', age: 52, gender: 'Male', phone: '9876543240', email: 'admin@ruralcare.in', vid: 2, role: 'admin' },
      { id: 7, name: 'Dr. Rajesh Deshmukh', age: 42, gender: 'Male', phone: '9876543230', email: 'dr.rajesh@ruralcare.in', vid: 1, role: 'doctor' }
    ];

    const userStmt = db.db.prepare(`
      INSERT INTO users (user_id, name, age, gender, phone, email, village_id, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of baseUsers) {
      userStmt.run(u.id, u.name, u.age, u.gender, u.phone, u.email, u.vid, u.role, demoPasswordHash);
    }

    const docStmt = db.db.prepare(`
      INSERT INTO doctors (staff_id, user_id, facility_id, name, specialization, availability_status, working_days, working_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    docStmt.run(9999, 7, 1, 'Dr. Rajesh Deshmukh', 'General Medicine & Family Health', 'Available', 'Mon-Sat', '09:00 - 17:00');

    // Dynamically staff facilities with realistic medical officers and specialists across Maharashtra
    const doctorSpecializations = [
      'General Medicine & Diabetology',
      'Obstetrics & Gynecology (Maternal Care)',
      'Pediatrics & Neonatal Care',
      'General Surgery & Emergency Trauma',
      'Orthopedics & Joint Care',
      'Cardiology & Intensive Medicine',
      'Community Health Officer (CHO)',
      'Chest & Respiratory Medicine',
      'Ophthalmology & Cataract Surgery',
      'Pathology & Diagnostic Medicine',
      'Anesthesiology & Critical Care',
      'Dermatology & Leprosy Care'
    ];

    const doctorFirstNames = [
      'Rajesh', 'Ananya', 'Priya', 'Vikram', 'Sanjay', 'Sunil', 'Smita', 'Meenakshi',
      'Prakash', 'Swati', 'Nitin', 'Vandana', 'Mohan', 'Farooq', 'Ashwini', 'Tanaji',
      'Pratibha', 'Devendra', 'Surekha', 'Hemant', 'Jayashree', 'Santosh', 'Sachin',
      'Amit', 'Pooja', 'Rohan', 'Snehal', 'Kishor', 'Ganesh', 'Deepa', 'Mahesh'
    ];

    const doctorLastNames = [
      'Deshmukh', 'Kulkarni', 'Patil', 'Shinde', 'Bhosale', 'Gaikwad', 'Kamble', 'Pawar',
      'More', 'Kadam', 'Rathod', 'Meshram', 'Qureshi', 'Sonawane', 'Salunkhe', 'Dongre',
      'Madavi', 'Valvi', 'Bagul', 'Tare', 'Mane', 'Jadhav', 'Chavan', 'Wagh', 'Sawant'
    ];

    let currentUserId = 100;
    let currentStaffId = 1;
    let doctorsSeeded = 0;

    for (const f of maharashtraFacilities) {
      // Determine how many doctors based on facility tier
      let docCount = 0;
      if (f.type === 'Government Hospital') docCount = 3;
      else if (f.type === 'Sub-District Hospital') docCount = 2;
      else if (f.type === 'CHC') docCount = 1;
      else if (f.type === 'PHC' && f.id % 2 === 0) docCount = 1;

      for (let i = 0; i < docCount; i++) {
        const uId = currentUserId++;
        const sId = currentStaffId++;
        const fn = doctorFirstNames[(sId + i) % doctorFirstNames.length];
        const ln = doctorLastNames[(sId * 3 + i) % doctorLastNames.length];
        const docName = `Dr. ${fn} ${ln}`;
        const spec = doctorSpecializations[(sId + i * 2) % doctorSpecializations.length];
        const phone = `98${Math.floor(10000000 + Math.random() * 89999999)}`;
        const email = `dr.${fn.toLowerCase()}.${ln.toLowerCase()}${sId}@ruralcare.in`;

        userStmt.run(uId, docName, 32 + (sId % 28), sId % 2 === 0 ? 'Female' : 'Male', phone, email, f.vid, 'doctor', demoPasswordHash);
        docStmt.run(sId, uId, f.id, docName, spec, 'Available', 'Mon-Sat', '09:00 AM - 04:00 PM');
        doctorsSeeded++;
      }
    }
    console.log(`✓ Seeded ${doctorsSeeded} Doctors & Specialized Medical Staff across facilities`);

    // ----------------------------------------------------
    // 4. ESSENTIAL CLINICAL SERVICES (All 361 facilities)
    // ----------------------------------------------------
    const srvStmt = db.db.prepare(`
      INSERT INTO services (facility_id, service_name, availability_status, timings)
      VALUES (?, ?, ?, ?)
    `);

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
    console.log(`✓ Seeded ${serviceCount} Essential Clinical Services across all facilities`);

    // ----------------------------------------------------
    // 5. MEDICINE STOCK INVENTORY (All 361 facilities)
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
      { name: 'Iron & Folic Acid (IFA) Tablets', cat: 'Maternal Nutrition', baseQty: 4000, unit: 'Tablets' },
      { name: 'Human Insulin Regular (100 IU/ml)', cat: 'Endocrinology', baseQty: 50, unit: 'Vials' },
      { name: 'Ceftriaxone 1g Injection', cat: 'Antibiotic', baseQty: 300, unit: 'Vials' }
    ];

    for (const f of maharashtraFacilities) {
      const beds = f.tot || 10;
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
    // 6. EXPANDED JAN AUSHADHI & GENERIC MEDICINE CATALOGUE (40+ medications)
    // ----------------------------------------------------
    const generics = [
      { brand: 'Augmentin 625 Duo', generic: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', form: 'Tablet', cat: 'Antibiotic', mrp: 210.0, govPrice: 45.0, savings: 78, desc: 'Broad-spectrum antibiotic for respiratory, skin, and dental infections.', uses: 'Chest infections, sinusitis, post-op wound care' },
      { brand: 'Pan-D Capsule', generic: 'Pantoprazole (40mg) + Domperidone (30mg SR)', form: 'Capsule', cat: 'Gastrointestinal', mrp: 165.0, govPrice: 25.0, savings: 85, desc: 'Proton pump inhibitor with prokinetic agent for acid reflux and GERD.', uses: 'Acidity, heartburn, peptic ulcers, nausea' },
      { brand: 'Glycomet-GP 1', generic: 'Metformin (500mg) + Glimepiride (1mg)', form: 'Tablet', cat: 'Antidiabetic', mrp: 125.0, govPrice: 20.0, savings: 84, desc: 'Combination anti-hyperglycemic agent for Type 2 Diabetes.', uses: 'Type 2 Diabetes, fasting blood sugar management' },
      { brand: 'Telma-40', generic: 'Telmisartan (40mg)', form: 'Tablet', cat: 'Cardiovascular', mrp: 140.0, govPrice: 18.0, savings: 87, desc: 'Angiotensin II receptor antagonist (ARB) for long-term hypertension.', uses: 'High blood pressure, cardiovascular risk reduction' },
      { brand: 'Amlokind-5', generic: 'Amlodipine (5mg)', form: 'Tablet', cat: 'Cardiovascular', mrp: 45.0, govPrice: 6.0, savings: 86, desc: 'Calcium channel blocker for lowering blood pressure and angina.', uses: 'Hypertension, angina prevention' },
      { brand: 'Azithral-500', generic: 'Azithromycin (500mg)', form: 'Tablet', cat: 'Antibiotic', mrp: 135.0, govPrice: 32.0, savings: 76, desc: 'Macrolide antibiotic with convenient once-daily dosing course.', uses: 'Throat infections, tonsillitis, community pneumonia' },
      { brand: 'Dolo-650', generic: 'Paracetamol (650mg)', form: 'Tablet', cat: 'Analgesic / Antipyretic', mrp: 35.0, govPrice: 8.0, savings: 77, desc: 'Antipyretic and analgesic for pain and acute fever control.', uses: 'Viral fever, body ache, headache' },
      { brand: 'Montair-LC', generic: 'Montelukast (10mg) + Levocetirizine (5mg)', form: 'Tablet', cat: 'Respiratory / Allergy', mrp: 180.0, govPrice: 28.0, savings: 84, desc: 'Leukotriene blocker + antihistamine for allergic rhinitis and asthma.', uses: 'Allergic cough, runny nose, dust allergy' },
      { brand: 'Shelcal-500', generic: 'Calcium Carbonate (500mg) + Vitamin D3 (250 IU)', form: 'Tablet', cat: 'Mineral / Vitamin', mrp: 130.0, govPrice: 24.0, savings: 81, desc: 'Essential calcium & vitamin D3 supplement for bone density.', uses: 'Osteoporosis, calcium deficiency, maternal bone support' },
      { brand: 'Cifran-500', generic: 'Ciprofloxacin (500mg)', form: 'Tablet', cat: 'Antibiotic', mrp: 95.0, govPrice: 18.0, savings: 81, desc: 'Fluoroquinolone antibiotic for bacterial gastroenteritis & UTI.', uses: 'Typhoid fever, bacterial diarrhea, UTI' },
      { brand: 'Combiflam', generic: 'Ibuprofen (400mg) + Paracetamol (325mg)', form: 'Tablet', cat: 'Pain & Inflammation', mrp: 50.0, govPrice: 10.0, savings: 80, desc: 'Dual-action NSAID for joint inflammation and muscular sprains.', uses: 'Dental toothache, back pain, muscular injuries' },
      { brand: 'Asthalin Inhaler', generic: 'Salbutamol Inhalation Aerosol (100mcg/puff)', form: 'Inhaler', cat: 'Respiratory', mrp: 160.0, govPrice: 65.0, savings: 59, desc: 'Fast-acting bronchodilator for acute asthma attack relief.', uses: 'Acute asthma attack, wheezing difficulty' },
      { brand: 'Electral Powder', generic: 'WHO Formula Oral Rehydration Salts (ORS 21.8g)', form: 'Powder Sachet', cat: 'Electrolyte Solutions', mrp: 24.0, govPrice: 5.0, savings: 79, desc: 'Life-saving rehydration formulation approved by WHO.', uses: 'Acute diarrhea, heat exhaustion, dehydration' },
      { brand: 'Orofer-XT', generic: 'Ferrous Ascorbate + Folic Acid Tablets', form: 'Tablet', cat: 'Hematology / Maternal', mrp: 175.0, govPrice: 30.0, savings: 83, desc: 'High absorption iron supplement for treating microcytic anemia.', uses: 'Maternal anemia, hemoglobin deficiency' },
      { brand: 'Betadine 5% Ointment', generic: 'Povidone Iodine 5% Microbicidal Ointment (20g)', form: 'Ointment', cat: 'Antiseptic / Wound Care', mrp: 95.0, govPrice: 22.0, savings: 77, desc: 'Broad spectrum microbicidal antiseptic for cuts, burns, and wounds.', uses: 'Farm cuts, skin abrasions, infected wounds' },
      { brand: 'Atorva-10', generic: 'Atorvastatin (10mg)', form: 'Tablet', cat: 'Cardiovascular', mrp: 110.0, govPrice: 15.0, savings: 86, desc: 'HMG-CoA reductase inhibitor for reducing LDL cholesterol.', uses: 'Hyperlipidemia, heart attack prevention' },
      { brand: 'Ecosprin-75', generic: 'Aspirin Gastro-resistant (75mg)', form: 'Tablet', cat: 'Cardiovascular', mrp: 18.0, govPrice: 4.0, savings: 78, desc: 'Antiplatelet medication preventing arterial thrombus formation.', uses: 'Secondary stroke & heart attack prevention' },
      { brand: 'Metpure-XL 25', generic: 'Metoprolol Succinate Prolonged Release (25mg)', form: 'Tablet', cat: 'Cardiovascular', mrp: 135.0, govPrice: 22.0, savings: 84, desc: 'Selective beta-1 blocker for hypertension and post-MI angina.', uses: 'Hypertension, tachycardia, angina pectoris' },
      { brand: 'Omez-20', generic: 'Omeprazole (20mg)', form: 'Capsule', cat: 'Gastrointestinal', mrp: 65.0, govPrice: 12.0, savings: 81, desc: 'Proton pump inhibitor reducing stomach acid secretion.', uses: 'Gastric ulcers, hyperacidity, duodenal ulcer' },
      { brand: 'Zifi-200', generic: 'Cefixime (200mg)', form: 'Tablet', cat: 'Antibiotic', mrp: 170.0, govPrice: 42.0, savings: 75, desc: 'Third-generation cephalosporin for respiratory and typhoid fever.', uses: 'Typhoid fever, bronchitis, severe UTI' },
      { brand: 'Norflox-TZ', generic: 'Norfloxacin (400mg) + Tinidazole (600mg)', form: 'Tablet', cat: 'Gastrointestinal', mrp: 115.0, govPrice: 24.0, savings: 79, desc: 'Dual antibiotic and antiprotozoal for acute amoebic dysentery.', uses: 'Food poisoning, amoebiasis, traveler diarrhea' },
      { brand: 'Ciplox Eye Drops', generic: 'Ciprofloxacin Ophthalmic Solution 0.3%', form: 'Eye Drops', cat: 'Ophthalmic', mrp: 32.0, govPrice: 8.0, savings: 75, desc: 'Antibacterial eye drops for conjunctivitis and corneal abrasions.', uses: 'Bacterial conjunctivitis, eye infections' },
      { brand: 'Levolin Inhaler', generic: 'Levosalbutamol Inhaler (50mcg)', form: 'Inhaler', cat: 'Respiratory', mrp: 195.0, govPrice: 75.0, savings: 61, desc: 'Pure R-isomer bronchodilator with minimal cardiac tremors.', uses: 'Bronchospasm, chronic bronchitis' },
      { brand: 'Budecort 200', generic: 'Budesonide Inhalation Suspension (200mcg)', form: 'Rotacaps', cat: 'Respiratory', mrp: 210.0, govPrice: 55.0, savings: 74, desc: 'Inhaled corticosteroid for daily prevention of asthma exacerbation.', uses: 'Chronic persistent asthma, COPD' },
      { brand: 'Becosules Z', generic: 'B-Complex with Vitamin C & Zinc', form: 'Capsule', cat: 'Mineral / Vitamin', mrp: 55.0, govPrice: 14.0, savings: 75, desc: 'Therapeutic nutritional supplement for convalescence and mouth ulcers.', uses: 'Mouth ulcers, general weakness, immunity' }
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
    // 7. PATIENTS & MCH COHORTS
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

    const mchRecords = [
      {
        pid: 2, cat: 'Pregnant Mother', gWeeks: 24, edd: '2026-12-28', cDob: null, hrf: 1,
        hrReason: 'Gestational Diabetes Mellitus (Fasting Sugar: 138 mg/dL)',
        ancDone: 2, lastAnc: '2026-08-28', nextDue: '2026-09-25',
        immJson: JSON.stringify([
          { name: 'Tetanus Toxoid 1 (TT-1)', date: '2026-06-15', status: 'Completed' },
          { name: 'Tetanus Toxoid 2 (TT-2)', date: '2026-07-20', status: 'Completed' },
          { name: 'Iron Folic Acid (180 Tabs)', date: '2026-08-01', status: 'Issued' }
        ]),
        ashaId: 4, notes: 'Under regular dietary counseling by ASHA Surekha Tai. Advised glucose monitoring twice weekly.'
      },
      {
        pid: 3, cat: 'Pregnant Mother', gWeeks: 32, edd: '2026-11-04', cDob: null, hrf: 1,
        hrReason: 'Severe Iron Deficiency Anemia (Hb 8.2 g/dL) at 32 weeks',
        ancDone: 3, lastAnc: '2026-09-02', nextDue: '2026-09-18',
        immJson: JSON.stringify([
          { name: 'Tetanus Toxoid Booster', date: '2026-05-10', status: 'Completed' },
          { name: 'IV Iron Sucrose (Dose 1 & 2)', date: '2026-09-02', status: 'Completed' },
          { name: 'Calcium + D3 Supplementation', date: '2026-07-15', status: 'Active' }
        ]),
        ashaId: 5, notes: 'High-risk case. Referred to Manchar CHC for repeat Hemoglobin testing and sonography.'
      },
      {
        pid: 2, cat: 'Infant/Child', gWeeks: null, edd: null, cDob: '2025-11-15', hrf: 0,
        hrReason: null, ancDone: 4, lastAnc: '2026-08-15', nextDue: '2026-11-15',
        immJson: JSON.stringify([
          { name: 'BCG + OPV-0 + Hep-B 0', age: 'At Birth', status: 'Completed' },
          { name: 'Pentavalent-1 + OPV-1 + Rota-1', age: '6 Weeks', status: 'Completed' },
          { name: 'Pentavalent-2 + OPV-2 + Rota-2', age: '10 Weeks', status: 'Completed' },
          { name: 'Pentavalent-3 + OPV-3 + Rota-3', age: '14 Weeks', status: 'Completed' },
          { name: 'Measles-Rubella-1 (MR-1) + Vit A', age: '9 Months', status: 'Completed' },
          { name: 'MR-2 + DPT Booster', age: '16-24 Months', status: 'Upcoming' }
        ]),
        ashaId: 4, notes: 'Child growth percentile normal (weight 8.9 kg at 9 months). Immunization up to date.'
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
    // 8. EPIDEMIOLOGICAL DISEASE SURVEILLANCE & OUTBREAK RADAR (All Divisions)
    // ----------------------------------------------------
    const surveillanceData = [
      { vid: 1, disease: 'Dengue & Vector-Borne Fever Cluster', cat: 'Vector-Borne', cases: 14, severity: 'Severe/Outbreak', status: 'Active', reportedBy: 'ASHA Surekha Tai (Shivapur, Pune)', action: 'Thermal fogging deployed; Abate larvicide applied in 82 open water storage tanks.' },
      { vid: 20, disease: 'Severe Acute Malnutrition (SAM) & Diarrheal Illness', cat: 'Nutritional/Chronic', cases: 28, severity: 'Severe/Outbreak', status: 'Active', reportedBy: 'Medical Officer Dharni SDH (Melghat, Amravati)', action: 'Emergency Nutrition Rehabilitation Centre (NRC) beds activated; therapeutic food dispatched.' },
      { vid: 46, disease: 'Falciparum Malaria Outbreak Cluster', cat: 'Vector-Borne', cases: 38, severity: 'Severe/Outbreak', status: 'Active', reportedBy: 'Epidemiology Officer (Aheri, Gadchiroli)', action: 'Mass blood survey (MBS) conducted; ACT combination therapy dispensed; indoor residual spray executed.' },
      { vid: 81, disease: 'Sickle Cell Anemia Crises & Pneumonia', cat: 'Nutritional/Chronic', cases: 19, severity: 'Moderate', status: 'Active', reportedBy: 'Dhadgaon Tribal Health Mission (Nandurbar)', action: 'HPLC electrophoresis screening team deployed; Hydroxyurea therapy initiated for carriers.' },
      { vid: 93, disease: 'Monsoon Leptospirosis & Snakebite Surge', cat: 'Other', cases: 12, severity: 'Moderate', status: 'Monitoring', reportedBy: 'Jawhar Cottage Hospital Team (Palghar)', action: 'Doxycycline chemoprophylaxis distributed; 100 vials of ASV positioned at PHCs.' },
      { vid: 121, disease: 'Enteric Typhoid Fever & Water Contamination', cat: 'Water-Borne', cases: 15, severity: 'Moderate', status: 'Monitoring', reportedBy: 'Pandharpur Health Inspector (Solapur)', action: 'Water purification plant flushed; chlorination maintained at 2.0 ppm.' },
      { vid: 10, disease: 'Scrub Typhus / Fever of Unknown Origin', cat: 'Vector-Borne', cases: 6, severity: 'Moderate', status: 'Active', reportedBy: 'Junnar SDH Epidemiology Team (Pune)', action: 'ELISA testing mobilized; Doxycycline prophylaxis dispensed to field workers.' },
      { vid: 13, disease: 'Viral Hepatitis A Water Contamination Cluster', cat: 'Water-Borne', cases: 18, severity: 'Moderate', status: 'Active', reportedBy: 'Rahuri PHC Health Inspector (Ahmednagar)', action: 'Contaminated well sealed; mobile water tanker distribution initiated.' },
      { vid: 64, disease: 'Leptospirosis Post-Flood Surge', cat: 'Other', cases: 9, severity: 'Moderate', status: 'Monitoring', reportedBy: 'Radhanagari PHC (Kolhapur)', action: 'Doxycycline 200mg capsules distributed to agricultural laborers.' },
      { vid: 74, disease: 'Chikungunya Joint Pain Fever Cluster', cat: 'Vector-Borne', cases: 22, severity: 'Moderate', status: 'Active', reportedBy: 'Ramtek SDH Team (Nagpur)', action: 'Source reduction drive; symptomatic Paracetamol and NSAID kits issued.' },
      { vid: 105, disease: 'Acute Gastroenteritis (AGE) Outbreak', cat: 'Water-Borne', cases: 31, severity: 'Severe/Outbreak', status: 'Active', reportedBy: 'Chiplun Sub-District Hospital (Ratnagiri)', action: 'Super-chlorination of municipal pipeline; 800 ORS sachets distributed.' },
      { vid: 111, disease: 'Heatstroke & Dehydration Cases', cat: 'Nutritional/Chronic', cases: 14, severity: 'Moderate', status: 'Monitoring', reportedBy: 'Jath Rural Hospital (Sangli)', action: 'Cooling centers opened; electrolyte oral rehydration corners setup at bus stands.' },
      { vid: 134, disease: 'Agrarian Chemical Dermatitis & Eye Irritation', cat: 'Other', cases: 16, severity: 'Mild', status: 'Monitoring', reportedBy: 'Pusad SDH Medical Team (Yavatmal)', action: 'Protective gear advisory broadcasted; topical hydrocortisone issued.' }
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
    // 9. HEALTH RECORDS, APPOINTMENTS, REFERRALS
    // ----------------------------------------------------
    const recStmt = db.db.prepare(`
      INSERT INTO health_records (patient_id, doctor_id, facility_id, visit_date, symptoms, diagnosis_notes, prescription, vitals_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    recStmt.run(1, 1, 4, '2026-08-14', 'Headaches and fatigue for 2 weeks.', 'Essential Hypertension (Stage 1) - BP 148/94.', 'Tab. Amlodipine 5mg once daily morning.', JSON.stringify({ bp: '148/94', pulse: 78, temp: 98.4, spo2: 98 }));
    recStmt.run(2, 2, 4, '2026-08-28', 'Gestational fatigue at 24 weeks.', 'Gestational Diabetes Mellitus (GDM) - 75g OGTT 162.', 'Medical Nutrition Therapy. Tab. IFA 1 tab daily.', JSON.stringify({ bp: '118/76', pulse: 82, temp: 98.6, spo2: 99 }));

    const today = new Date().toISOString().split('T')[0];
    const apptStmt = db.db.prepare(`
      INSERT INTO appointments (patient_id, facility_id, doctor_id, appointment_date, appointment_time, status, reason, doctor_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    apptStmt.run(1, 4, 1, today, '10:00 AM', 'Completed', 'Monthly Blood Pressure checkup and refill.', 'BP controlled at 128/82. Refilled Amlodipine 5mg.');
    apptStmt.run(2, 4, 2, today, '11:30 AM', 'Scheduled', 'Routine Antenatal ANC checkup.', null);
    apptStmt.run(3, 4, 1, today, '02:00 PM', 'Scheduled', 'Severe weakness and dyspnea.', null);

    const refStmt = db.db.prepare(`
      INSERT INTO referrals (patient_id, referring_facility_id, referred_facility_id, doctor_id, reason, priority, status, clinical_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    refStmt.run(3, 4, 7, 1, 'Severe Anemia (Hb 8.2) in 3rd trimester pregnancy.', 'Urgent', 'Pending', '31yo pregnant female at 32 weeks needing IV Iron Sucrose therapy & sonography.');
    refStmt.run(1, 4, 12, 1, 'Suspected Angina / Ischemic ECG changes.', 'Routine', 'Accepted', 'Patient had episodic retrosternal chest heaviness. Referred for TMT/Echo.');

    // ----------------------------------------------------
    // 10. EMERGENCY 108 SERVICES (Covering all emergency facilities across Maharashtra)
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
    // 11. FEEDBACK & GRIEVANCE COMPLAINTS
    // ----------------------------------------------------
    const feedbackList = [
      { pid: 1, fid: 4, rating: 5, text: 'Dr. Rajesh explained blood pressure care with utmost kindness. Quick service at pharmacy counter.' },
      { pid: 2, fid: 4, rating: 4, text: 'ASHA worker Surekha Tai accompanied me for ANC test. Lab technician took blood sample gently.' },
      { pid: 3, fid: 21, rating: 5, text: 'The doctors at Dharni Sub-District Hospital provided free nutrition kits and medicines promptly.' },
      { pid: 1, fid: 56, rating: 5, text: 'GMC Nagpur emergency ward was very responsive during our emergency transfer.' },
      { pid: 2, fid: 13, rating: 5, text: 'Clean maternity ward and 24x7 doctor availability at Ahmednagar District Civil Hospital.' },
      { pid: 3, fid: 37, rating: 4, text: 'Malaria testing done in 15 minutes at Gadchiroli General Hospital.' }
    ];

    const fbStmt = db.db.prepare(`
      INSERT INTO feedback (patient_id, facility_id, rating, feedback_text)
      VALUES (?, ?, ?, ?)
    `);
    for (const f of feedbackList) {
      fbStmt.run(f.pid, f.fid, f.rating, f.text);
    }

    const complaints = [
      { pid: 1, fid: 4, type: 'Medicine Unavailable', desc: 'Amoxicillin syrup for pediatric cough was out of stock on Thursday afternoon at Khed PHC.', stat: 'Resolved', res: 'District warehouse dispatched fresh batch of 200 pediatric suspensions on Friday morning. Stock replenished.' },
      { pid: 3, fid: 2, type: 'Facility Closed', desc: 'Sub-Centre Velhe main gate was locked until 10:30 AM on Tuesday when immunization was scheduled.', stat: 'In Progress', res: 'Notice issued to ANM; compensatory immunization session conducted on Thursday.' },
      { pid: 2, fid: 14, type: 'Long Waiting Time', desc: 'Sonography queue at Sangamner Sub-District Hospital took over 3 hours.', stat: 'Resolved', res: 'Additional sonologist roaster scheduled on Mondays and Thursdays to halve wait times.' }
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
    // 12. SCHEDULED RURAL HEALTH CAMPS (All 6 administrative divisions)
    // ----------------------------------------------------
    const camps = [
      { fid: 4, vid: 1, name: 'Pune Rural Eye & Diabetes Screening Camp', loc: 'Zilla Parishad Primary School, Shivapur', date: '2026-09-28', start: '09:00 AM', end: '04:00 PM', services: 'Ophthalmology, Cataract Screening, Blood Sugar & HbA1c, Free Reading Glasses', target: 'Villagers 45+ & Diabetics', stat: 'Upcoming' },
      { fid: 21, vid: 20, name: 'Melghat Tribal Maternal & Child Poshan Mela', loc: 'Ashram Shala Ground, Dharni Tehsil, Amravati', date: '2026-10-04', start: '09:00 AM', end: '03:30 PM', services: 'Pediatric SAM Screening, Obstetric Sonography, Iron Infusion, Nutrition Kit Distribution', target: 'Tribal Mothers & Under-5 Children', stat: 'Upcoming' },
      { fid: 38, vid: 46, name: 'Gadchiroli Forest Malaria & Sickle Cell Camp', loc: 'Gram Panchayat Bhavan, Aheri', date: '2026-10-10', start: '08:30 AM', end: '03:00 PM', services: 'Rapid Diagnostic Malaria Tests, Sickle Cell Electrophoresis, Mosquito Net Distribution', target: 'Forest Dwellers & Agricultural Families', stat: 'Upcoming' },
      { fid: 62, vid: 81, name: 'Satpura Hilly Belt General Medical Camp', loc: 'Dhadgaon Tribal School Ground, Nandurbar', date: '2026-10-15', start: '09:30 AM', end: '04:00 PM', services: 'General Health OPD, Pediatric Checkup, Free Antibiotics, Antenatal Examination', target: 'Hill-top Village Communities', stat: 'Upcoming' },
      { fid: 70, vid: 93, name: 'Palghar Tribal Malnutrition & Orthopedic Camp', loc: 'Jawhar Cottage Hospital Community Hall', date: '2026-10-22', start: '09:00 AM', end: '03:00 PM', services: 'Joint Pain Assessment, Bone Density Scanning, Child Growth Monitoring', target: 'Tribal Elders & Children', stat: 'Upcoming' },
      { fid: 86, vid: 121, name: 'Solapur Pandharpur Pilgrim & Rural Health Checkup', loc: 'Zilla Parishad High School, Pandharpur', date: '2026-10-28', start: '08:00 AM', end: '02:00 PM', services: 'Cardiac Screening, ECG, Diabetes Blood Test, Geriatric Medicine', target: 'Rural Pilgrims & Senior Citizens', stat: 'Upcoming' },
      { fid: 13, vid: 14, name: 'Shirdi Sai Rural Mega Cancer & Mammography Camp', loc: 'Shirdi Municipal Ground, Ahmednagar', date: '2026-11-02', start: '09:00 AM', end: '05:00 PM', services: 'Oral Cancer Screening, Mammography, Pap Smear, Oncology Consultation', target: 'Women 30+ & Tobacco Users', stat: 'Upcoming' },
      { fid: 56, vid: 74, name: 'Nagpur Rural Cardiac & Hypertension Screening Mela', loc: 'Ramtek Zilla Parishad Hall', date: '2026-11-08', start: '08:30 AM', end: '03:30 PM', services: '2D Echocardiography, Lipid Profile, Blood Pressure Profiling', target: 'Adults 40+ & High-Risk Cardiac Cases', stat: 'Upcoming' },
      { fid: 77, vid: 105, name: 'Konkan Coast Monsoon Health & Dental Camp', loc: 'Chiplun Municipal Ground, Ratnagiri', date: '2026-11-14', start: '09:00 AM', end: '04:00 PM', services: 'Dental Extraction & Scaling, Dermatology, Waterborne Disease Check', target: 'Fisherfolk & Coastal Families', stat: 'Upcoming' },
      { fid: 49, vid: 64, name: 'Kolhapur Western Ghats Joint & Spine Camp', loc: 'Radhanagari Tehsil Hall, Kolhapur', date: '2026-11-20', start: '09:30 AM', end: '03:30 PM', services: 'Orthopedic Consultation, Physiotherapy Demonstration, Free Pain Medications', target: 'Farmers & Heavy Laborers', stat: 'Upcoming' },
      { fid: 23, vid: 24, name: 'Marathwada Paithan Maternal & Adolescent Mela', loc: 'Sant Eknath Rang Mandir Ground, Paithan', date: '2026-11-26', start: '09:00 AM', end: '03:00 PM', services: 'Adolescent Anemia Check, Menstrual Hygiene Kit Distribution, Pediatric Dental', target: 'School Girls & Mothers', stat: 'Upcoming' },
      { fid: 35, vid: 43, name: 'Khandesh Shirpur Sickle Cell & Genetic Counseling', loc: 'Shirpur Ashram Shala, Dhule', date: '2026-12-02', start: '09:00 AM', end: '04:00 PM', services: 'Genetic Trait Counseling, Solubility Testing, Iron Chelation Consultation', target: 'Tribal Youth & Newlyweds', stat: 'Upcoming' }
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
    // 13. NOTIFICATIONS
    // ----------------------------------------------------
    const notifications = [
      { uid: 1, title: 'Appointment Confirmed', msg: 'Your consultation with Dr. Rajesh Kulkarni at Khed PHC is confirmed for today at 10:00 AM.', type: 'appointment' },
      { uid: 2, title: 'ANC Checkup Reminder', msg: 'Your 24-week Antenatal Care checkup with Dr. Ananya Deshmukh is scheduled for 11:30 AM today.', type: 'appointment' },
      { uid: 4, title: 'High-Risk AI Screening Alert', msg: 'Patient Suresh Jadhav reported severe chest pain with critical risk flagged. Immediate 108 action advised.', type: 'screening' },
      { uid: 4, title: 'Outbreak Alert: Dengue in Shivapur', msg: '14 active cases detected in Shivapur. Door-to-door larval check initiated.', type: 'general' },
      { uid: 6, title: 'Citizen Grievance Update', msg: 'Grievance ticket #1 regarding pediatric syrup resolved; stock replenishment confirmed.', type: 'complaint' },
      { uid: 6, title: 'Statewide Resource Telemetry Live', msg: '325 villages and 361 verified public healthcare facilities now live across all 36 districts of Maharashtra.', type: 'general' }
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
