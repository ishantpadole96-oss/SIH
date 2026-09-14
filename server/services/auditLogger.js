const db = require('../database/db');

/**
 * Log a sensitive security, clinical, or operational event
 * As specified in Master Specification Section 35
 */
function logAuditEvent({ actor_id, actor_role, action, resource_type, resource_id, details, ip_address = null }) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');
    db.run(`
      INSERT INTO audit_logs (actor_id, actor_role, action, resource_type, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      actor_id || null,
      actor_role || 'system',
      action,
      resource_type,
      resource_id ? String(resource_id) : null,
      detailsStr,
      ip_address
    ]);
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
}

module.exports = {
  logAuditEvent
};
