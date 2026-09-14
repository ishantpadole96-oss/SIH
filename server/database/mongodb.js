/**
 * MongoDB Atlas Connection and Model Definitions for RuralCare
 * Non-blocking, resilient connection that preserves existing application uptime.
 */
const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to ensure SRV record resolution succeeds across Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server configuration notice:', err.message);
}

const DEFAULT_URI = 'mongodb+srv://ishantpadole96_db_user:aOD3kzqMBsmdzo3q@isolated-free-cluster.4ahr84c.mongodb.net/ruralcare?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;

let mongoState = {
  status: 'disconnected', // 'connecting' | 'connected' | 'error' | 'disconnected'
  lastError: null,
  connectedAt: null,
  uri: MONGODB_URI.replace(/:([^:@]+)@/, ':****@') // mask password in logs
};

/**
 * Initialize connection to MongoDB Atlas
 */
function connectMongo() {
  if (mongoState.status === 'connected' || mongoState.status === 'connecting') {
    return;
  }

  mongoState.status = 'connecting';
  console.log(`[MongoDB] Initiating connection to cluster...`);

  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 7000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }).then(() => {
    mongoState.status = 'connected';
    mongoState.lastError = null;
    mongoState.connectedAt = new Date().toISOString();
    console.log(`[MongoDB] Connected successfully to MongoDB Atlas database (ruralcare)!`);
  }).catch((err) => {
    mongoState.status = 'error';
    mongoState.lastError = err.message;
    console.warn(`[MongoDB Notice] MongoDB Atlas connection status: ${err.message}`);
    if (err.message.includes('SSL alert number 80') || err.message.includes('tlsv1 alert internal error')) {
      console.warn(`[MongoDB Tip] Atlas rejected TLS handshake. Ensure '0.0.0.0/0' (Allow access from anywhere) is added in your MongoDB Atlas Console under 'Network Access -> IP Access List'.`);
    }
  });
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  mongoState.status = 'connected';
  mongoState.lastError = null;
  mongoState.connectedAt = new Date().toISOString();
});

mongoose.connection.on('error', (err) => {
  mongoState.status = 'error';
  mongoState.lastError = err.message;
});

mongoose.connection.on('disconnected', () => {
  if (mongoState.status !== 'error') {
    mongoState.status = 'disconnected';
  }
});

// Auto-connect on require
connectMongo();

// -------------------------------------------------------------
// MongoDB Schemas & Models
// -------------------------------------------------------------
const VillageSchema = new mongoose.Schema({
  village_id: { type: Number, index: true, unique: true },
  village_name: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, default: 'Maharashtra' },
  population: { type: Number, default: 1000 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accessibility_score: { type: Number, default: 50.0 },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const UserSchema = new mongoose.Schema({
  user_id: { type: Number, index: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  village_id: { type: Number },
  role: { type: String, enum: ['citizen', 'asha', 'doctor', 'admin'], default: 'citizen' },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const FacilitySchema = new mongoose.Schema({
  facility_id: { type: Number, index: true, unique: true },
  facility_name: { type: String, required: true },
  facility_type: { type: String, required: true },
  address: { type: String, required: true },
  village_id: { type: Number, required: true },
  district: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  contact: { type: String, required: true },
  opening_hours: { type: String, default: '08:00 AM - 08:00 PM' },
  current_status: { type: String, default: 'Open' },
  emergency_available: { type: Number, default: 0 },
  total_beds: { type: Number, default: 10 },
  available_beds: { type: Number, default: 5 },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const DoctorSchema = new mongoose.Schema({
  staff_id: { type: Number, index: true, unique: true },
  user_id: { type: Number, required: true },
  facility_id: { type: Number, required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability_status: { type: String, default: 'Available' },
  working_days: { type: String, default: 'Mon-Sat' },
  working_hours: { type: String, default: '09:00 AM - 05:00 PM' },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const PatientSchema = new mongoose.Schema({
  patient_id: { type: Number, index: true, unique: true },
  user_id: { type: Number, required: true },
  health_journey_id: { type: String },
  blood_group: { type: String },
  height_cm: { type: Number },
  weight_kg: { type: Number },
  allergies: { type: String, default: 'None' },
  existing_conditions: { type: String, default: 'None' },
  emergency_contact_name: { type: String },
  emergency_contact_phone: { type: String },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const AppointmentSchema = new mongoose.Schema({
  appointment_id: { type: Number, index: true, unique: true },
  patient_id: { type: Number, required: true },
  doctor_id: { type: Number, required: true },
  facility_id: { type: Number, required: true },
  appointment_date: { type: String, required: true },
  appointment_time: { type: String, required: true },
  reason: { type: String },
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const ReferralSchema = new mongoose.Schema({
  referral_id: { type: Number, index: true, unique: true },
  patient_id: { type: Number, required: true },
  referring_facility_id: { type: Number, required: true },
  target_facility_id: { type: Number, required: true },
  referral_reason: { type: String, required: true },
  urgency: { type: String, default: 'Routine' },
  status: { type: String, default: 'Created' },
  current_stage: { type: String, default: 'Created' },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const MedicineSchema = new mongoose.Schema({
  medicine_id: { type: Number, index: true, unique: true },
  facility_id: { type: Number, required: true },
  medicine_name: { type: String, required: true },
  category: { type: String, default: 'Essential' },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'strips' },
  stock_status: { type: String, default: 'In Stock' },
  last_updated: { type: Date, default: Date.now }
}, { strict: false });

const HealthCampSchema = new mongoose.Schema({
  camp_id: { type: Number, index: true, unique: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  contact_number: { type: String },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const ComplaintSchema = new mongoose.Schema({
  complaint_id: { type: Number, index: true, unique: true },
  user_id: { type: Number, required: true },
  facility_id: { type: Number },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

const FeedbackSchema = new mongoose.Schema({
  feedback_id: { type: Number, index: true, unique: true },
  user_id: { type: Number, required: true },
  facility_id: { type: Number },
  rating: { type: Number, required: true },
  comments: { type: String },
  created_at: { type: Date, default: Date.now }
}, { strict: false });

// Helper to safely get or create model
function getModel(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

const models = {
  Village: getModel('Village', VillageSchema),
  User: getModel('User', UserSchema),
  Facility: getModel('Facility', FacilitySchema),
  Doctor: getModel('Doctor', DoctorSchema),
  Patient: getModel('Patient', PatientSchema),
  Appointment: getModel('Appointment', AppointmentSchema),
  Referral: getModel('Referral', ReferralSchema),
  Medicine: getModel('Medicine', MedicineSchema),
  HealthCamp: getModel('HealthCamp', HealthCampSchema),
  Complaint: getModel('Complaint', ComplaintSchema),
  Feedback: getModel('Feedback', FeedbackSchema),
};

module.exports = {
  mongoose,
  connectMongo,
  getMongoStatus: () => ({
    ...mongoState,
    readyState: mongoose.connection.readyState,
    readyStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  }),
  models
};
