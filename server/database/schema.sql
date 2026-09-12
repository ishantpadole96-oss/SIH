-- RuralCare Relational Database Schema (SQLite)
-- Enforce foreign keys
PRAGMA foreign_keys = ON;

-- 1. Villages / Rural Locations
CREATE TABLE IF NOT EXISTS villages (
    village_id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    population INTEGER NOT NULL DEFAULT 1000,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accessibility_score REAL DEFAULT 50.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Authentication & Base Profile)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other', 'Undisclosed')),
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    village_id INTEGER,
    role TEXT NOT NULL CHECK(role IN ('citizen', 'asha', 'doctor', 'admin')),
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(village_id) ON DELETE SET NULL
);

-- 3. Healthcare Facilities
CREATE TABLE IF NOT EXISTS facilities (
    facility_id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_name TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK(facility_type IN ('Sub-Centre', 'PHC', 'CHC', 'Sub-District Hospital', 'Government Hospital')),
    address TEXT NOT NULL,
    village_id INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    contact TEXT NOT NULL,
    opening_hours TEXT NOT NULL DEFAULT '08:00 AM - 08:00 PM',
    current_status TEXT NOT NULL CHECK(current_status IN ('Open', 'Closed', 'Emergency Only')) DEFAULT 'Open',
    emergency_available INTEGER NOT NULL DEFAULT 0 CHECK(emergency_available IN (0, 1)),
    total_beds INTEGER NOT NULL DEFAULT 10,
    available_beds INTEGER NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(village_id) ON DELETE RESTRICT
);

-- 4. Doctors & Healthcare Staff
CREATE TABLE IF NOT EXISTS doctors (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    facility_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    availability_status TEXT NOT NULL CHECK(availability_status IN ('Available', 'On Leave', 'In Consultation', 'Off Duty')) DEFAULT 'Available',
    working_days TEXT NOT NULL DEFAULT 'Mon-Sat',
    working_hours TEXT NOT NULL DEFAULT '09:00 AM - 05:00 PM',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT
);

-- 5. Services Provided by Facilities
CREATE TABLE IF NOT EXISTS services (
    service_id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    availability_status TEXT NOT NULL CHECK(availability_status IN ('Available', 'Unavailable', 'Limited')) DEFAULT 'Available',
    timings TEXT NOT NULL DEFAULT '24x7',
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE
);

-- 6. Medicine Stock Inventory
CREATE TABLE IF NOT EXISTS medicine_stock (
    medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    category TEXT DEFAULT 'Essential',
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'strips',
    stock_status TEXT NOT NULL CHECK(stock_status IN ('In Stock', 'Low Stock', 'Out of Stock')) DEFAULT 'In Stock',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE
);

-- 7. Patient Profiles & Health Records Base
CREATE TABLE IF NOT EXISTS patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    blood_group TEXT,
    height_cm REAL,
    weight_kg REAL,
    allergies TEXT DEFAULT 'None',
    existing_conditions TEXT DEFAULT 'None',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 8. Clinical Health Records / Visits
CREATE TABLE IF NOT EXISTS health_records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    facility_id INTEGER NOT NULL,
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    diagnosis_notes TEXT NOT NULL,
    prescription TEXT,
    vitals_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT
);

-- 9. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')) DEFAULT 'Scheduled',
    reason TEXT NOT NULL,
    doctor_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT
);

-- 10. Referrals (Between Primary, Secondary, and Tertiary facilities)
CREATE TABLE IF NOT EXISTS referrals (
    referral_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    referring_facility_id INTEGER NOT NULL,
    referred_facility_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('Routine', 'Urgent', 'Emergency')) DEFAULT 'Routine',
    status TEXT NOT NULL CHECK(status IN ('Pending', 'Accepted', 'Completed', 'Declined')) DEFAULT 'Pending',
    clinical_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (referring_facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
    FOREIGN KEY (referred_facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT
);

-- 11. Symptoms & AI Health Screenings (Decision Support)
CREATE TABLE IF NOT EXISTS screenings (
    screening_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    symptoms_json TEXT NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 1,
    severity TEXT NOT NULL DEFAULT 'Moderate',
    vitals_json TEXT NOT NULL,
    ai_risk_level TEXT NOT NULL CHECK(ai_risk_level IN ('Low', 'Moderate', 'High', 'Emergency')),
    possible_conditions_json TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    consultation_recommended INTEGER NOT NULL DEFAULT 1 CHECK(consultation_recommended IN (0, 1)),
    matched_facility_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (matched_facility_id) REFERENCES facilities(facility_id) ON DELETE SET NULL
);

-- 12. Emergency Services Linked to Facilities
CREATE TABLE IF NOT EXISTS emergency_services (
    emergency_id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL UNIQUE,
    ambulance_available INTEGER NOT NULL DEFAULT 0 CHECK(ambulance_available IN (0, 1)),
    emergency_contact TEXT NOT NULL,
    ambulance_phone TEXT,
    response_time_minutes INTEGER DEFAULT 20,
    trauma_care_level TEXT DEFAULT 'Basic',
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE
);

-- 13. Feedback & Facility Ratings
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE
);

-- 14. Complaints & Grievances
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    complaint_type TEXT NOT NULL CHECK(complaint_type IN (
        'Doctor Unavailable', 
        'Medicine Unavailable', 
        'Facility Closed', 
        'Long Waiting Time', 
        'Service Unavailable', 
        'Poor Service', 
        'Equipment Unavailable', 
        'Other'
    )),
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Submitted', 'In Progress', 'Resolved')) DEFAULT 'Submitted',
    admin_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE
);

-- 15. Health Camps Organized
CREATE TABLE IF NOT EXISTS health_camps (
    camp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    village_id INTEGER NOT NULL,
    camp_name TEXT NOT NULL,
    location TEXT NOT NULL,
    camp_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    services_offered TEXT NOT NULL,
    target_audience TEXT DEFAULT 'All Villagers',
    status TEXT NOT NULL CHECK(status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')) DEFAULT 'Upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE RESTRICT,
    FOREIGN KEY (village_id) REFERENCES villages(village_id) ON DELETE RESTRICT
);

-- 16. Health Camp Registrations
CREATE TABLE IF NOT EXISTS camp_registrations (
    registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    attended INTEGER NOT NULL DEFAULT 0 CHECK(attended IN (0, 1)),
    UNIQUE(camp_id, patient_id),
    FOREIGN KEY (camp_id) REFERENCES health_camps(camp_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- 17. User Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('appointment', 'referral', 'screening', 'complaint', 'camp', 'emergency', 'general')) DEFAULT 'general',
    read_status INTEGER NOT NULL DEFAULT 0 CHECK(read_status IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 18. Jan Aushadhi & Generic Medicine Alternatives
CREATE TABLE IF NOT EXISTS generic_medicines (
    generic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    dosage_form TEXT NOT NULL DEFAULT 'Tablet',
    category TEXT NOT NULL,
    market_price REAL NOT NULL,
    jan_aushadhi_price REAL NOT NULL,
    savings_percentage INTEGER NOT NULL,
    description TEXT,
    common_uses TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Maternal & Child Health (MCH / RCH Tracking)
CREATE TABLE IF NOT EXISTS maternal_child_health (
    mch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Pregnant Mother', 'Infant/Child')),
    gestational_weeks INTEGER,
    expected_delivery_date DATE,
    child_dob DATE,
    high_risk_flag INTEGER NOT NULL DEFAULT 0 CHECK(high_risk_flag IN (0, 1)),
    high_risk_reason TEXT,
    anc_visits_completed INTEGER DEFAULT 0,
    last_anc_date DATE,
    next_due_date DATE,
    immunizations_json TEXT DEFAULT '[]',
    asha_worker_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (asha_worker_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 20. Epidemiological Disease Surveillance & Outbreak Radar
CREATE TABLE IF NOT EXISTS disease_surveillance (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL,
    disease_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Vector-Borne', 'Water-Borne', 'Respiratory', 'Nutritional/Chronic', 'Other')),
    cases_reported INTEGER NOT NULL DEFAULT 1,
    severity TEXT NOT NULL CHECK(severity IN ('Mild', 'Moderate', 'Severe/Outbreak')) DEFAULT 'Moderate',
    containment_status TEXT NOT NULL CHECK(containment_status IN ('Active', 'Monitoring', 'Contained')) DEFAULT 'Active',
    reported_by TEXT NOT NULL DEFAULT 'ASHA Worker',
    reported_date DATE DEFAULT (DATE('now')),
    action_taken TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(village_id) ON DELETE CASCADE
);

-- Indexes for optimal lookup and geospatial searching
CREATE INDEX IF NOT EXISTS idx_facilities_village ON facilities(village_id);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_doctors_facility ON doctors(facility_id);
CREATE INDEX IF NOT EXISTS idx_medicines_facility ON medicine_stock(facility_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicine_stock(medicine_name);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_complaints_patient ON complaints(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_generic_brand ON generic_medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_generic_name ON generic_medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_mch_patient ON maternal_child_health(patient_id);
CREATE INDEX IF NOT EXISTS idx_surveillance_village ON disease_surveillance(village_id);

