# RuralCare — Smart India Hackathon Full-Stack Healthcare Platform

> **Problem Statement**: *“Accessibility and quality of public healthcare services, particularly in rural and underserved areas.”*

RuralCare is a **fully functional, responsive, end-to-end full-stack web application** designed to bridge the healthcare divide in rural and underserved communities. It seamlessly connects **Rural Citizens**, **ASHA/ANM Community Healthcare Workers**, **Medical Officers/Doctors**, and **Government Health Administrators** into a unified, data-driven ecosystem.

---

## 🌟 Key Capabilities

1. **Find Healthcare & Interactive GIS Map**: Discover nearby Sub-Centres, PHCs, CHCs, and District Hospitals on an interactive OpenStreetMap/Leaflet map with real-time distance calculations, doctor counts, and bed ratios.
2. **Real-Time Hospital Availability Board**: Live census of vacant/occupied beds with visual progress bars, on-duty doctors, 24x7 emergency readiness, and active pharmacy stocks.
3. **AI Health Screening & Clinical Decision Support**: Step-by-step triage wizard analyzing vitals (SpO₂, BP, temperature, blood sugar) and symptom onset, returning a risk level (Low, Moderate, High, Emergency), clinical guidance, non-diagnostic disclaimer, and automatic facility matching.
4. **108 Emergency Response**: 1-click nearest emergency hospital locator with real-time distance in kilometers, ambulance readiness, trauma care level, and GPS directions.
5. **Cross-Facility Medicine Inventory**: Real-time stock status across rural dispensaries (In Stock, Low Stock, Out of Stock) for essential drugs.
6. **Appointment & Consultation Workflow**: Book OPD appointments with doctors, conduct clinical consultations, add diagnoses and prescriptions directly to patient health records.
7. **Inter-Tier Referral Lifecycle**: Seamless referrals from Primary Health Centres (PHC) to Community Health Centres (CHC) or District Hospitals with priority levels (Routine, Urgent, Emergency) and visual status tracking (`Pending` ➔ `Accepted` ➔ `Completed`).
8. **Citizen Grievance Resolution Desk**: Lodge complaints regarding doctor absenteeism, medicine stockouts, or facility closures, with status tracking (`Submitted` ➔ `In Progress` ➔ `Resolved`) and official administrative responses.
9. **Rural Health Camps**: Scheduled medical camps in rural villages with 1-click citizen registration.
10. **Government Admin Command Console**: District-wide KPIs, village accessibility scoring (🟢 Good > 70, 🟡 Moderate 45-70, 🔴 Underserved < 45), healthcare quality charts, and resource allocation insights.
11. **Trilingual Support**: Instant language switching between **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.
12. **1-Click Demo Switcher**: Instant switching between Citizen, ASHA Worker, Doctor, and Admin personas in the header for effortless hackathon judging.

---

## 🏗️ Architecture & Technology Stack

```
RuralCare/
├── server/                          # Backend Node.js + Express API
│   ├── database/
│   │   ├── schema.sql               # 17 Relational tables with foreign keys & indexes
│   │   ├── db.js                    # Native node:sqlite database connection (WAL mode)
│   │   ├── seed.js                  # Realistic rural healthcare seed script
│   │   └── ruralcare.db             # Relational SQLite database
│   ├── middleware/
│   │   └── auth.js                  # JWT token verification & role-based access control
│   ├── services/
│   │   ├── aiScreening.js           # Clinical decision support & triage rule engine
│   │   └── accessibilityScore.js    # Algorithmic village accessibility scoring engine
│   ├── routes/                      # 14 REST API Route Modules
│   │   ├── auth.js, villages.js, facilities.js, doctors.js, medicines.js,
│   │   ├── patients.js, appointments.js, referrals.js, screenings.js,
│   │   └── complaints.js, feedback.js, camps.js, notifications.js, admin.js
│   ├── scripts/
│   │   └── test-api.js              # Automated smoke test suite (16 test assertions)
│   ├── package.json
│   └── index.js                     # Express entrypoint (Port 5000)
│
├── client/                          # Frontend React 18 + Vite Web App
│   ├── src/
│   │   ├── index.css                # Custom Vanilla CSS healthcare design system
│   │   ├── i18n/translations.js     # Trilingual dictionary (EN, HI, MR)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Session & 1-click demo switcher state
│   │   │   └── LanguageContext.jsx  # i18n language provider
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global header with quick role switcher & 108 emergency
│   │   │   ├── InteractiveMap.jsx   # Leaflet GIS map with color-coded accessibility pins
│   │   │   ├── EmergencyModal.jsx   # 108 callout, nearest trauma center & directions
│   │   │   ├── NotificationDrawer.jsx # Real-time user notifications & read receipts
│   │   │   └── AuthModal.jsx        # Credentials login & citizen registration
│   │   ├── pages/
│   │   │   ├── CitizenHome.jsx      # 10 touch-friendly feature tiles & village selector
│   │   │   ├── FacilityFinder.jsx   # Search, multi-criteria filters & split GIS map
│   │   │   ├── HospitalAvailability.jsx # Live bed occupancy progress & doctor counts
│   │   │   ├── AIScreening.jsx      # Multi-step clinical triage wizard & disclaimer
│   │   │   ├── BookAppointment.jsx  # Facility + Doctor + Timeslot booking workflow
│   │   │   ├── MyRecordsAndReferrals.jsx # Clinical notes, prescriptions & referral tracker
│   │   │   ├── MedicineSearch.jsx   # Cross-facility drug inventory & stock updater
│   │   │   ├── HealthCamps.jsx      # Village camp discovery & 1-click registration
│   │   │   ├── FeedbackAndComplaints.jsx # Star ratings & grievance lifecycle desk
│   │   │   ├── AshaDashboard.jsx    # ASHA worker console, field registration & triage
│   │   │   ├── DoctorDashboard.jsx  # Doctor OPD queue, consultations & referrals
│   │   │   └── AdminDashboard.jsx   # District KPIs, GIS map, quality & grievance desk
│   │   ├── App.jsx                  # Main layout & router
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js               # Dev server (Port 3000) with proxy to backend
│   └── package.json
│
└── package.json                     # Root orchestration scripts
```

---

## 🗄️ Relational Database Schema (17 Entities)

All tables use explicit primary keys, foreign keys (`REFERENCES ... ON DELETE`), check constraints, and indexes:

1. **`villages`**: `village_id`, `village_name`, `district`, `state`, `population`, `latitude`, `longitude`, `accessibility_score`.
2. **`users`**: `user_id`, `name`, `age`, `gender`, `phone`, `email`, `role`, `village_id` (FK), `password_hash`.
3. **`facilities`**: `facility_id`, `facility_name`, `facility_type`, `address`, `village_id` (FK), `latitude`, `longitude`, `contact`, `opening_hours`, `current_status`, `emergency_available`, `total_beds`, `available_beds`.
4. **`doctors`**: `staff_id`, `user_id` (FK), `facility_id` (FK), `name`, `specialization`, `availability_status`, `working_days`, `working_hours`.
5. **`services`**: `service_id`, `facility_id` (FK), `service_name`, `availability_status`, `timings`.
6. **`medicine_stock`**: `medicine_id`, `facility_id` (FK), `medicine_name`, `category`, `quantity`, `unit`, `stock_status`, `last_updated`.
7. **`patients`**: `patient_id`, `user_id` (FK), `blood_group`, `height_cm`, `weight_kg`, `allergies`, `existing_conditions`, `emergency_contact_name`, `emergency_contact_phone`.
8. **`health_records`**: `record_id`, `patient_id` (FK), `doctor_id` (FK), `facility_id` (FK), `visit_date`, `symptoms`, `diagnosis_notes`, `prescription`, `vitals_json`.
9. **`appointments`**: `appointment_id`, `patient_id` (FK), `facility_id` (FK), `doctor_id` (FK), `appointment_date`, `appointment_time`, `status`, `reason`, `doctor_notes`.
10. **`referrals`**: `referral_id`, `patient_id` (FK), `referring_facility_id` (FK), `referred_facility_id` (FK), `doctor_id` (FK), `reason`, `priority`, `status`, `clinical_summary`.
11. **`screenings`**: `screening_id`, `patient_id` (FK), `symptoms_json`, `duration_days`, `severity`, `vitals_json`, `ai_risk_level`, `possible_conditions_json`, `recommendation`, `consultation_recommended`, `matched_facility_id` (FK).
12. **`emergency_services`**: `emergency_id`, `facility_id` (FK), `ambulance_available`, `emergency_contact`, `ambulance_phone`, `response_time_minutes`, `trauma_care_level`.
13. **`feedback`**: `feedback_id`, `patient_id` (FK), `facility_id` (FK), `rating` (1-5), `feedback_text`, `date_submitted`.
14. **`complaints`**: `complaint_id`, `patient_id` (FK), `facility_id` (FK), `complaint_type`, `description`, `status` (`Submitted` -> `In Progress` -> `Resolved`), `admin_response`.
15. **`health_camps`**: `camp_id`, `facility_id` (FK), `village_id` (FK), `camp_name`, `location`, `camp_date`, `start_time`, `end_time`, `services_offered`, `target_audience`, `status`.
16. **`camp_registrations`**: `registration_id`, `camp_id` (FK), `patient_id` (FK), `registered_at`, `attended`.
17. **`notifications`**: `notification_id`, `user_id` (FK), `title`, `message`, `type`, `read_status`, `created_at`.

---

## 🔑 Demo Accounts & Evaluator Credentials

You can log in manually or use the **⚡ 1-Click Role Switcher** strip at the top of the interface:

| Persona | Full Name | Email / Login | Password | Assigned Location / Jurisdiction |
|:---|:---|:---|:---|:---|
| **Citizen / Patient** | Ramesh Patil | `ramesh@ruralcare.in` | `Demo@123` | Shivapur (Underserved Village) |
| **ASHA Worker** | Sunita Bai | `sunita.asha@ruralcare.in` | `Demo@123` | Shivapur & Khed Sub-Centre |
| **Doctor / Medical Officer** | Dr. Rajesh Deshmukh | `dr.rajesh@ruralcare.in` | `Demo@123` | Khed Primary Health Centre (PHC) |
| **Government Admin** | District Officer Sharma | `admin@ruralcare.in` | `Demo@123` | Pune Rural Health Administration |

---

## 🚀 How to Run Locally

### 1. Requirements
- Node.js (v18+ or v22+)
- npm (v9+)

### 2. Launch the Application

```bash
# Terminal 1: Start Backend Server (runs on port 5000)
cd server
npm install
node index.js

# Terminal 2: Start Frontend Web Application (runs on port 3000)
cd client
npm install
npm run dev
```

Open your browser at **`http://localhost:3000/`**.

### 3. Run Automated API Smoke Tests

```bash
cd server
npm run test-api
```
*(All 16 assertions pass with zero failures).*

### 4. Re-seed Database

```bash
cd server
npm run seed
```

---

## 🧭 Complete End-to-End Demonstration Flow

1. **Citizen Experience**:
   - Open `http://localhost:3000/`. Notice the 10 touch-friendly feature tiles and village selector (`Shivapur`).
   - Click **108 Emergency** in the header to view the nearest emergency hospital, distance in km, ambulance standby, and navigation.
   - Switch language to **हिन्दी** or **मराठी** using the top language switcher to test trilingual localization.
   - Go to **Find Healthcare** -> filter by "24x7 Emergency Available Only" -> inspect facilities on the interactive Leaflet GIS map.
   - Go to **Hospital Availability** -> observe live bed occupancy progress bars and on-duty doctors.
   - Go to **AI Health Screening** -> enter vitals (Temp 102.4°F, SpO₂ 93%), select symptoms (Fever, Cough, Shortness of Breath) -> receive a **High Risk** triage assessment with clear non-diagnostic disclaimer -> click **Find Appropriate Healthcare Facility** to see matched CHC/Hospital.
   - Go to **Book Appointment** -> select Khed PHC, Dr. Rajesh, choose date & timeslot -> confirm booking.
   - Go to **Feedback & Complaints** -> file a complaint regarding "Medicine Unavailable".
2. **Doctor Experience**:
   - Click **Doctor** on the top role switcher -> open Doctor OPD Console.
   - View today's consultation queue with the booked patient.
   - Conduct consultation: enter clinical diagnosis and prescribe medication.
   - Issue an inter-facility referral to Manchar CHC for ultrasound Doppler.
3. **ASHA Worker Experience**:
   - Click **ASHA Worker** on the top role switcher -> open ASHA Community Portal.
   - Inspect the **High-Risk AI Screening Triage Queue** to review patients flagged with critical vital signs and call them.
   - Use **Register Patient in Field** to enroll a villager.
4. **Government Admin Experience**:
   - Click **Govt Admin** on the top role switcher -> open District Health Admin Console.
   - Observe executive KPIs: Bed occupancy %, medicine shortages, active grievances.
   - Inspect the **Rural Healthcare GIS Map**: notice color-coded villages (🟢 High > 70, 🟡 Moderate 45-70, 🔴 Underserved < 45).
   - Inspect the **Underserved Villages Matrix**: identify remote villages lacking emergency access.
   - Go to **Grievance Resolution Desk** -> locate the filed complaint -> update status to **Resolved** and add an administrative response ("Medicine stock replenished").
   - Switch back to Citizen -> confirm the grievance now displays **Resolved** with the government's official response.

---

---

## 🚀 Vercel Deployment Guide (Vite Customized)

RuralCare is configured out-of-the-box for seamless zero-config deployment on **Vercel** with full Vite optimization.

### Architecture on Vercel
* **Frontend**: Built via **Vite 8** into `client/dist`, bundled with vendor chunk splitting (`leaflet`, `lucide-react`, `vendor`) for sub-second cold starts.
* **Backend API**: Powered by a Vercel Serverless Function in `api/index.js` routing Express REST endpoints to `/api/*`.
* **Database**: Embedded SQLite with automatic detection of `/tmp/ruralcare.db` in serverless environments, pre-seeded with rural healthcare data.
* **SPA Routing**: Handled via rewrites in `vercel.json` so page refreshes and direct links never throw 404s.

---

### Option A: Deploy via GitHub / Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "RuralCare platform ready for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to [vercel.com](https://vercel.com/) and click **Add New... ➔ Project**.
   - Select your GitHub repository.
   - **Framework Preset**: Select **Vite** (or leave as Other / detected).
   - **Root Directory**: Leave as `./` (Root).
   - **Build Command**: `npm run build` *(auto-configured in vercel.json)*.
   - **Output Directory**: `client/dist` *(auto-configured in vercel.json)*.

3. **Click Deploy**:
   - Vercel will install dependencies, compile the Vite frontend, bundle the serverless `/api` endpoints, and deploy your live URL: `https://ruralcaremaharashtra.vercel.app`.

---

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Run Vercel Deploy from project root**:
   ```bash
   vercel
   ```
   - Follow prompts:
     - Set up and deploy `c:\SIH`? **Y**
     - Which scope? Select your personal or team account.
     - Link to existing project? **N**
     - Project name? `ruralcare`
     - In which directory is your code located? `./`
     - Auto-detected settings? Accept defaults (configured in `vercel.json`).

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

### Option C: Client-Only Static Deployment (Frontend Only)

If you wish to host only the Vite frontend on Vercel while running the backend API elsewhere:
- In Vercel Project Settings, set **Root Directory** to `client`.
- The included `client/vercel.json` ensures full SPA client-side route fallback to `index.html`.
- Set Environment Variable `VITE_API_URL` to your remote backend URL if applicable.

---

## ⚖️ Clinical Disclaimer

*RuralCare AI Health Screening is an intelligent clinical decision support system designed solely for triage guidance and informational support in rural areas. It is **NOT** a certified medical diagnosis and never replaces professional medical consultation. For severe or life-threatening symptoms, always dial 108 or report immediately to the nearest hospital emergency department.*

