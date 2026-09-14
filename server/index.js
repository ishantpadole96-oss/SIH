const express = require('express');
const cors = require('cors');
const path = require('path');

// Ensure database and schema are initialized
require('./database/db');

const authRoutes = require('./routes/auth');
const villageRoutes = require('./routes/villages');
const facilityRoutes = require('./routes/facilities');
const doctorRoutes = require('./routes/doctors');
const medicineRoutes = require('./routes/medicines');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const referralRoutes = require('./routes/referrals');
const screeningRoutes = require('./routes/screenings');
const complaintRoutes = require('./routes/complaints');
const feedbackRoutes = require('./routes/feedback');
const campRoutes = require('./routes/camps');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const mchRoutes = require('./routes/mch');
const surveillanceRoutes = require('./routes/surveillance');
const syncRoutes = require('./routes/sync');
const copilotRoutes = require('./routes/copilot');
const callRoutes = require('./routes/calls');
const consentRoutes = require('./routes/consent');
const consultationRoutes = require('./routes/consultations');
const prescriptionRoutes = require('./routes/prescriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`${new Date().toISOString().substring(11, 19)} [${req.method}] ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RuralCare Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount modular REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mch', mchRoutes);
app.use('/api/surveillance', surveillanceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Serve frontend static files if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback to client/dist/index.html for SPA frontend routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('RuralCare API Server running. Open frontend on http://localhost:3000');
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// Start Express server only if run directly as the main process
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 RuralCare Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health API: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
