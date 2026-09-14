const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const seedDbPath = path.join(__dirname, 'ruralcare.db');
let DB_PATH = process.env.DB_PATH;

if (!DB_PATH) {
  if (isVercel) {
    DB_PATH = path.join('/tmp', 'ruralcare.db');
    // If seed database exists in repo, copy to writable /tmp on cold start
    if (fs.existsSync(seedDbPath) && !fs.existsSync(DB_PATH)) {
      try {
        fs.copyFileSync(seedDbPath, DB_PATH);
      } catch (e) {
        console.warn('Could not copy seed db to /tmp, will initialize fresh:', e.message);
      }
    }
  } else {
    DB_PATH = path.join(__dirname, 'ruralcare.db');
  }
}

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite database connection
const db = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {
  db.exec('PRAGMA journal_mode = DELETE;');
}

// Initialize database schema
function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }
}

// Safely execute ALTER TABLE migrations if columns are missing
function runMigrations() {
  const migrations = [
    // Patients Health Journey ID
    "ALTER TABLE patients ADD COLUMN health_journey_id TEXT;",
    
    // Referrals Smart Fields & 6-Stage Tracking
    "ALTER TABLE referrals ADD COLUMN specialist_required TEXT DEFAULT 'General Medicine';",
    "ALTER TABLE referrals ADD COLUMN required_tests TEXT DEFAULT 'None';",
    "ALTER TABLE referrals ADD COLUMN queue_token TEXT;",
    "ALTER TABLE referrals ADD COLUMN current_stage TEXT DEFAULT 'Created';",
    "ALTER TABLE referrals ADD COLUMN bottleneck_reason TEXT;",
    "ALTER TABLE referrals ADD COLUMN reached_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN consultation_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN test_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN treatment_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN completed_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN last_followup_alert_at DATETIME;",
    "ALTER TABLE referrals ADD COLUMN asha_followup_status TEXT DEFAULT 'None';",
    "ALTER TABLE referrals ADD COLUMN asha_followup_notes TEXT;",

    // Screenings Triage Decision Support
    "ALTER TABLE screenings ADD COLUMN triage_category TEXT DEFAULT 'Normal';",
    "ALTER TABLE screenings ADD COLUMN smart_actions_json TEXT DEFAULT '[]';",

    // Facility Data Contract (Section 32)
    "ALTER TABLE facilities ADD COLUMN source_name TEXT DEFAULT 'Govt of Maharashtra Public Health Department / NHM';",
    "ALTER TABLE facilities ADD COLUMN source_type TEXT DEFAULT 'government';",
    "ALTER TABLE facilities ADD COLUMN verification_status TEXT DEFAULT 'verified';",
    "ALTER TABLE facilities ADD COLUMN last_verified_at DATETIME DEFAULT '2026-09-14 00:00:00';",
    "ALTER TABLE facilities ADD COLUMN is_demo_data INTEGER DEFAULT 0;",

    // Consents (Section 25)
    `CREATE TABLE IF NOT EXISTS consents (
        consent_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        requester_id INTEGER NOT NULL,
        purpose TEXT NOT NULL,
        scope TEXT NOT NULL CHECK(scope IN ('full_history', 'diagnostic_reports', 'prescriptions')),
        status TEXT NOT NULL CHECK(status IN ('Pending', 'Granted', 'Revoked', 'Expired')) DEFAULT 'Pending',
        granted_at DATETIME,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
        FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`,

    // FCFS Consultation Requests & Doctor Queue (Section 10)
    `CREATE TABLE IF NOT EXISTS consultation_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        health_center_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        chief_complaint TEXT NOT NULL,
        symptoms_text TEXT NOT NULL,
        duration TEXT,
        vitals_json TEXT,
        urgency TEXT NOT NULL CHECK(urgency IN ('Routine', 'Urgent', 'Emergency')) DEFAULT 'Routine',
        assigned_doctor_id INTEGER,
        status TEXT NOT NULL CHECK(status IN ('Queued', 'Assigned', 'In Consultation', 'Completed', 'Cancelled')) DEFAULT 'Queued',
        doctor_notes TEXT,
        queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_at DATETIME,
        completed_at DATETIME,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
        FOREIGN KEY (health_center_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
        FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE RESTRICT,
        FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(staff_id) ON DELETE SET NULL
    );`,

    // Digital Prescriptions - Versioned & Immutable (Section 14)
    `CREATE TABLE IF NOT EXISTS prescriptions (
        prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultation_id INTEGER,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL CHECK(status IN ('Issued', 'Amended', 'Dispensed', 'Cancelled')) DEFAULT 'Issued',
        diagnosis TEXT,
        diet_lifestyle TEXT,
        instructions TEXT,
        follow_up TEXT,
        previous_version_id INTEGER,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT
    );`,

    `CREATE TABLE IF NOT EXISTS prescription_items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        strength TEXT,
        dose TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration TEXT NOT NULL,
        route TEXT DEFAULT 'Oral',
        instructions TEXT,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
    );`,

    // Medicine Requests (Section 15)
    `CREATE TABLE IF NOT EXISTS medicine_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        facility_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        category TEXT DEFAULT 'Essential',
        requested_quantity INTEGER NOT NULL,
        unit TEXT DEFAULT 'strips',
        urgency TEXT NOT NULL CHECK(urgency IN ('Routine', 'Urgent', 'Emergency')) DEFAULT 'Routine',
        status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Fulfilled')) DEFAULT 'Pending',
        admin_id INTEGER,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
        FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE RESTRICT,
        FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL
    );`,

    // Inventory Transactions (Section 15)
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        facility_id INTEGER NOT NULL,
        medicine_id INTEGER,
        medicine_name TEXT NOT NULL,
        transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Restock', 'Dispensed', 'Adjustment', 'Replenishment Fulfilled')),
        quantity INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        actor_id INTEGER NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
        FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE RESTRICT
    );`,

    // Security & Operations Audit Logs (Section 35)
    `CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id INTEGER,
        actor_role TEXT,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // Doctor & Staff Village Assignments (District Management)
    "ALTER TABLE doctors ADD COLUMN assigned_villages TEXT;",
    "ALTER TABLE users ADD COLUMN assigned_villages TEXT;"
  ];

  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch (e) {
      // Column already exists or table not ready, safely ignore
    }
  }

  // Seed default village assignments for doctors and ASHA workers
  try {
    db.exec(`
      UPDATE doctors 
      SET assigned_villages = CASE 
            WHEN staff_id = 1 THEN 'Shivapur, Khedgaon, Saswad'
            WHEN staff_id = 2 THEN 'Bhor, Shirwal, Shirur'
            WHEN staff_id = 3 THEN 'Velhe, Nasrapur'
            ELSE 'Shivapur, Khedgaon'
          END
      WHERE assigned_villages IS NULL OR assigned_villages = '';

      UPDATE users
      SET assigned_villages = CASE
            WHEN role = 'asha' AND user_id = 2 THEN 'Shivapur, Khedgaon Sub-Centre'
            WHEN role = 'asha' THEN 'Shivapur Village Jurisdiction'
            ELSE assigned_villages
          END
      WHERE role IN ('asha', 'worker') AND (assigned_villages IS NULL OR assigned_villages = '');
    `);
  } catch (e) {
    console.warn('Migration warning (assigned_villages):', e.message);
  }

  // Populate default health_journey_id for existing patients
  try {
    db.exec(`
      UPDATE patients 
      SET health_journey_id = 'MH-RURAL-2026-' || substr('0000' || patient_id, -4, 4)
      WHERE health_journey_id IS NULL OR health_journey_id = '';
    `);
  } catch (e) {
    console.warn('Migration warning (health_journey_id):', e.message);
  }

  // Populate realistic sample stages and details on existing referrals
  try {
    db.exec(`
      UPDATE referrals
      SET specialist_required = CASE 
            WHEN reason LIKE '%pregnancy%' OR reason LIKE '%antenatal%' THEN 'Gynecology & Obstetrics'
            WHEN reason LIKE '%chest%' OR reason LIKE '%cardiac%' THEN 'Cardiology'
            WHEN reason LIKE '%child%' OR reason LIKE '%pediatric%' THEN 'Pediatrics'
            ELSE 'General Medicine & Specialist'
          END
      WHERE specialist_required IS NULL OR specialist_required = 'General Medicine';

      UPDATE referrals
      SET required_tests = CASE 
            WHEN reason LIKE '%pregnancy%' THEN 'CBC, USG Pelvis, Urine Albumin'
            WHEN reason LIKE '%chest%' THEN 'ECG, Trop-I, Lipid Panel'
            WHEN reason LIKE '%fever%' THEN 'CBC, Blood Smear for MP, Dengue NS1'
            ELSE 'Routine Hemogram, Blood Pressure Monitoring'
          END
      WHERE required_tests IS NULL OR required_tests = 'None';

      UPDATE referrals
      SET queue_token = 'Q-DH-' || substr('000' || referral_id, -3, 3)
      WHERE queue_token IS NULL;

      -- Seed sample referral stages for tracking and bottleneck demo
      UPDATE referrals
      SET current_stage = CASE 
            WHEN referral_id % 4 = 1 THEN 'Patient Reached'
            WHEN referral_id % 4 = 2 THEN 'Consultation'
            WHEN referral_id % 4 = 3 THEN 'Stuck - Follow-up Required'
            ELSE 'Created'
          END
      WHERE current_stage IS NULL OR current_stage = 'Created';

      UPDATE referrals
      SET bottleneck_reason = CASE
            WHEN current_stage = 'Stuck - Follow-up Required' AND referral_id % 2 = 0 THEN 'Patient did not reach hospital – transport unavailable'
            WHEN current_stage = 'Stuck - Follow-up Required' THEN 'Diagnostic USG unavailable – equipment under maintenance'
            ELSE NULL
          END
      WHERE current_stage = 'Stuck - Follow-up Required' AND bottleneck_reason IS NULL;

      UPDATE referrals
      SET reached_at = datetime('now', '-2 days')
      WHERE current_stage IN ('Patient Reached', 'Consultation', 'Test', 'Treatment', 'Follow-up') AND reached_at IS NULL;

      UPDATE referrals
      SET consultation_at = datetime('now', '-1 day')
      WHERE current_stage IN ('Consultation', 'Test', 'Treatment', 'Follow-up') AND consultation_at IS NULL;
    `);
  } catch (e) {
    console.warn('Migration warning (referral seeds):', e.message);
  }
}

initSchema();
runMigrations();


/**
 * Helper wrappers around DatabaseSync prepared statements
 */
const dbHelper = {
  db,
  
  /**
   * Run a query that returns multiple rows
   * @param {string} sql 
   * @param {Array} params 
   * @returns {Array<Object>}
   */
  all(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * Run a query that returns a single row
   * @param {string} sql 
   * @param {Array} params 
   * @returns {Object|undefined}
   */
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   * @param {string} sql 
   * @param {Array} params 
   * @returns {{ changes: number, lastInsertRowid: number|bigint }}
   */
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },

  /**
   * Execute raw SQL (e.g. multiple statements)
   * @param {string} sql 
   */
  exec(sql) {
    return db.exec(sql);
  },

  /**
   * Run multiple database operations in a transaction
   * @param {Function} callback 
   */
  transaction(callback) {
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = callback();
      db.exec('COMMIT;');
      return result;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
};

module.exports = dbHelper;
