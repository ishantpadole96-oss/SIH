const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditLogger');

const router = express.Router();

/**
 * GET /api/consent/my
 * Citizen: View all consent requests and active permissions
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const patient = db.get('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const consents = db.all(`
      SELECT c.*, u.name as requester_name, u.role as requester_role
      FROM consents c
      JOIN users u ON c.requester_id = u.user_id
      WHERE c.patient_id = ?
      ORDER BY c.created_at DESC
    `, [patient.patient_id]);

    return res.json({ consents });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/consent/request
 * Doctor: Request patient consent to access expanded clinical history
 * (Specification Section 11.2 & Section 25)
 */
router.post('/request', authenticateToken, requireRoles('doctor'), (req, res) => {
  try {
    const { patient_id, purpose = 'OPD Clinical Consultation & Treatment Planning', scope = 'full_history', duration_hours = 24 } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }

    const patient = db.get('SELECT p.patient_id, p.user_id, u.name FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = ?', [parseInt(patient_id)]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if pending or active consent already exists
    const existing = db.get(`
      SELECT * FROM consents
      WHERE patient_id = ? AND requester_id = ? AND status IN ('Pending', 'Granted')
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC LIMIT 1
    `, [parseInt(patient_id), req.user.user_id]);

    if (existing && existing.status === 'Granted') {
      return res.json({ message: 'Consent already active', consent: existing });
    }

    const expiresAt = new Date(Date.now() + duration_hours * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const insert = db.run(`
      INSERT INTO consents (patient_id, requester_id, purpose, scope, status, expires_at)
      VALUES (?, ?, ?, ?, 'Pending', ?)
    `, [parseInt(patient_id), req.user.user_id, purpose, scope, expiresAt]);

    const consentId = Number(insert.lastInsertRowid);

    // Notify citizen
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Clinical Record Consent Request', ?, 'general')
    `, [
      patient.user_id,
      `${req.user.name || 'Your Doctor'} has requested permission to access your past medical records for: "${purpose}". Click to review and approve.`
    ]);

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSENT_REQUESTED',
      resource_type: 'consent',
      resource_id: consentId,
      details: { patient_id, purpose, scope }
    });

    const newConsent = db.get('SELECT * FROM consents WHERE consent_id = ?', [consentId]);
    return res.status(201).json({
      message: 'Consent request dispatched to patient',
      consent: newConsent
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/consent/:id/grant
 * Citizen: Grant consent for health records sharing
 */
router.post('/:id/grant', authenticateToken, (req, res) => {
  try {
    const consentId = parseInt(req.params.id);
    const consent = db.get('SELECT c.*, p.user_id FROM consents c JOIN patients p ON c.patient_id = p.patient_id WHERE c.consent_id = ?', [consentId]);

    if (!consent) return res.status(404).json({ error: 'Consent request not found' });
    if (req.user.role === 'citizen' && consent.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Unauthorized to grant consent for this record.' });
    }

    db.run(`
      UPDATE consents
      SET status = 'Granted', granted_at = CURRENT_TIMESTAMP
      WHERE consent_id = ?
    `, [consentId]);

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSENT_GRANTED',
      resource_type: 'consent',
      resource_id: consentId,
      details: { scope: consent.scope, expires_at: consent.expires_at }
    });

    // Notify requesting doctor
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Consent Granted', 'Patient has approved your request to access clinical history records.', 'general')
    `, [consent.requester_id]);

    const updated = db.get('SELECT * FROM consents WHERE consent_id = ?', [consentId]);
    return res.json({ message: 'Consent successfully granted', consent: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/consent/:id/revoke
 * Citizen: Revoke consent at any time (Section 25)
 */
router.post('/:id/revoke', authenticateToken, (req, res) => {
  try {
    const consentId = parseInt(req.params.id);
    const consent = db.get('SELECT c.*, p.user_id FROM consents c JOIN patients p ON c.patient_id = p.patient_id WHERE c.consent_id = ?', [consentId]);

    if (!consent) return res.status(404).json({ error: 'Consent record not found' });
    if (req.user.role === 'citizen' && consent.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Unauthorized to revoke consent for this record.' });
    }

    db.run(`
      UPDATE consents
      SET status = 'Revoked'
      WHERE consent_id = ?
    `, [consentId]);

    logAuditEvent({
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      action: 'CONSENT_REVOKED',
      resource_type: 'consent',
      resource_id: consentId,
      details: 'Patient revoked health record access permission'
    });

    return res.json({ message: 'Consent successfully revoked' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
