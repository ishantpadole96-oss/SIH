const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (default role: citizen)
 */
router.post('/register', (req, res) => {
  try {
    const { name, age, gender, phone, email, village_id, password, role = 'citizen' } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'Name, phone, email, and password are required.' });
    }

    // Check if email or phone already exists
    const existing = db.get('SELECT user_id FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email or phone number already exists.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const validRole = ['citizen', 'asha', 'doctor', 'admin'].includes(role) ? role : 'citizen';

    let result;
    db.transaction(() => {
      const insertUser = db.run(`
        INSERT INTO users (name, age, gender, phone, email, village_id, role, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, age ? parseInt(age) : null, gender || 'Other', phone, email, village_id ? parseInt(village_id) : null, validRole, password_hash]);

      const userId = Number(insertUser.lastInsertRowid);

      // If user is a citizen, automatically initialize a patient record
      if (validRole === 'citizen') {
        db.run(`
          INSERT INTO patients (user_id, blood_group, allergies, existing_conditions)
          VALUES (?, 'Unknown', 'None', 'None')
        `, [userId]);
      }

      // Welcome notification
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Welcome to RuralCare', 'Your account has been created. You can now access healthcare facilities, AI screening, and appointments.', 'general')
      `, [userId]);

      result = db.get(`
        SELECT u.user_id, u.name, u.age, u.gender, u.phone, u.email, u.village_id, u.role, v.village_name
        FROM users u
        LEFT JOIN villages v ON u.village_id = v.village_id
        WHERE u.user_id = ?
      `, [userId]);
    });

    const token = generateToken(result);
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: result
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register account: ' + err.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate with email/phone & password
 */
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    const user = db.get(`
      SELECT u.*, v.village_name, p.patient_id, d.staff_id as doctor_id, d.facility_id as doctor_facility_id
      FROM users u
      LEFT JOIN villages v ON u.village_id = v.village_id
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN doctors d ON u.user_id = d.user_id
      WHERE u.email = ? OR u.phone = ?
    `, [identifier, identifier]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    const token = generateToken(user);

    // Remove password hash from response
    delete user.password_hash;

    return res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in: ' + err.message });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.get(`
      SELECT u.user_id, u.name, u.age, u.gender, u.phone, u.email, u.village_id, u.role, u.created_at,
             v.village_name, v.district,
             p.patient_id, p.blood_group, p.allergies, p.existing_conditions,
             d.staff_id as doctor_id, d.specialization, d.facility_id as doctor_facility_id,
             f.facility_name as doctor_facility_name
      FROM users u
      LEFT JOIN villages v ON u.village_id = v.village_id
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN doctors d ON u.user_id = d.user_id
      LEFT JOIN facilities f ON d.facility_id = f.facility_id
      WHERE u.user_id = ?
    `, [req.user.user_id]);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/demo-accounts
 * List seeded demo accounts for one-click evaluator login
 */
router.get('/demo-accounts', (req, res) => {
  const accounts = [
    {
      role: 'citizen',
      roleLabel: 'Citizen / Patient',
      name: 'Ramesh Patil',
      email: 'ramesh@ruralcare.in',
      village: 'Shivapur (Underserved Village)',
      description: 'Has appointments, referrals, high blood pressure history, and complaints'
    },
    {
      role: 'asha',
      roleLabel: 'ASHA Healthcare Worker',
      name: 'Sunita Bai',
      email: 'sunita.asha@ruralcare.in',
      village: 'Shivapur & Khed Sub-Centre',
      description: 'Manages village patients, high-risk screening triage, and referrals'
    },
    {
      role: 'doctor',
      roleLabel: 'Medical Officer / Doctor',
      name: 'Dr. Rajesh Deshmukh',
      email: 'dr.rajesh@ruralcare.in',
      facility: 'Khed Primary Health Centre (PHC)',
      description: 'Conducts OPD consultations, writes prescriptions, and issues referrals'
    },
    {
      role: 'admin',
      roleLabel: 'Government / District Health Admin',
      name: 'District Officer Sharma',
      email: 'admin@ruralcare.in',
      facility: 'Pune Rural Health Administration',
      description: 'Monitors district healthcare GIS map, bed & medicine shortages, and grievance desk'
    }
  ];

  return res.json({ demoAccounts: accounts, commonPassword: 'Demo@123' });
});

module.exports = router;
