const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/medicines
 * Search medicines across government healthcare facilities
 */
router.get('/', (req, res) => {
  try {
    const { search, facility_id, stock_status, category } = req.query;

    let query = `
      SELECT m.*, f.facility_name, f.facility_type, f.contact as facility_contact,
             v.village_name, v.district
      FROM medicine_stock m
      JOIN facilities f ON m.facility_id = f.facility_id
      LEFT JOIN villages v ON f.village_id = v.village_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (m.medicine_name LIKE ? OR m.category LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (facility_id) {
      query += ` AND m.facility_id = ?`;
      params.push(parseInt(facility_id));
    }

    if (stock_status) {
      query += ` AND m.stock_status = ?`;
      params.push(stock_status);
    }

    if (category) {
      query += ` AND m.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY m.medicine_name ASC, f.facility_type DESC`;

    const medicines = db.all(query, params);

    // Grouping by unique medicine name to show cross-facility summary for citizens
    const groupedByName = {};
    for (const item of medicines) {
      if (!groupedByName[item.medicine_name]) {
        groupedByName[item.medicine_name] = {
          medicine_name: item.medicine_name,
          category: item.category,
          unit: item.unit,
          facilities: []
        };
      }
      groupedByName[item.medicine_name].facilities.push({
        medicine_id: item.medicine_id,
        facility_id: item.facility_id,
        facility_name: item.facility_name,
        facility_type: item.facility_type,
        village_name: item.village_name,
        quantity: item.quantity,
        stock_status: item.stock_status,
        last_updated: item.last_updated
      });
    }

    return res.json({
      medicines,
      groupedByMedicine: Object.values(groupedByName)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/medicines/generic-alternatives
 * Search Jan Aushadhi & Generic Medicine alternatives by brand name or generic formula
 */
router.get('/generic-alternatives', (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `SELECT * FROM generic_medicines WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (brand_name LIKE ? OR generic_name LIKE ? OR description LIKE ? OR common_uses LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY savings_percentage DESC, brand_name ASC`;
    const alternatives = db.all(query, params);

    const totalAlternatives = alternatives.length;
    const avgSavings = totalAlternatives > 0
      ? Math.round(alternatives.reduce((acc, curr) => acc + curr.savings_percentage, 0) / totalAlternatives)
      : 0;

    return res.json({
      success: true,
      count: totalAlternatives,
      averageSavingsPercentage: avgSavings,
      alternatives
    });
  } catch (err) {
    console.error('Error fetching generic medicines:', err);
    return res.status(500).json({ error: 'Failed to fetch generic medicine alternatives' });
  }
});

/**
 * PUT /api/medicines/:id
 * Update medicine stock quantity and status (Staff/Doctor/ASHA or Admin)
 */
router.put('/:id', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const medicineId = parseInt(req.params.id);
    const { quantity, stock_status } = req.body;

    const med = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [medicineId]);
    if (!med) {
      return res.status(404).json({ error: 'Medicine stock item not found' });
    }

    // Role check: If doctor or asha, ensure facility or village connection
    if (req.user.role === 'doctor') {
      const doc = db.get('SELECT facility_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
      if (!doc || doc.facility_id !== med.facility_id) {
        return res.status(403).json({ error: 'Unauthorized to update inventory for this facility.' });
      }
    }

    const newQty = quantity !== undefined ? parseInt(quantity) : med.quantity;
    let newStatus = stock_status || med.stock_status;

    // Automatic status inference if not provided
    if (!stock_status) {
      if (newQty === 0) newStatus = 'Out of Stock';
      else if (newQty < 20) newStatus = 'Low Stock';
      else newStatus = 'In Stock';
    }

    db.run(`
      UPDATE medicine_stock
      SET quantity = ?, stock_status = ?, last_updated = CURRENT_TIMESTAMP
      WHERE medicine_id = ?
    `, [newQty, newStatus, medicineId]);

    const updated = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [medicineId]);

    // If out of stock, generate admin / asha alert notification
    if (newStatus === 'Out of Stock') {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        SELECT u.user_id, 'Critical Medicine Shortage Alert', ?, 'general'
        FROM users u WHERE u.role IN ('admin', 'asha') LIMIT 3
      `, [`Critical shortage: ${med.medicine_name} is now Out of Stock at facility ID ${med.facility_id}`]);
    }

    return res.json({
      message: 'Medicine inventory updated successfully',
      medicine: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/medicines
 * Add a new medicine item to a facility's inventory
 */
router.post('/', authenticateToken, requireRoles('doctor', 'asha', 'admin'), (req, res) => {
  try {
    const { facility_id, medicine_name, category = 'Essential', quantity = 50, unit = 'strips', stock_status = 'In Stock' } = req.body;

    if (!facility_id || !medicine_name) {
      return res.status(400).json({ error: 'facility_id and medicine_name are required' });
    }

    const insert = db.run(`
      INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [parseInt(facility_id), medicine_name, category, parseInt(quantity), unit, stock_status]);

    const newMed = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [Number(insert.lastInsertRowid)]);

    return res.status(201).json({
      message: 'Medicine added to inventory',
      medicine: newMed
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/medicines/requests
 * Health Worker / Staff: Submit a medicine replenishment request to Admin
 * (Specification Section 15)
 */
router.post('/requests', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { facility_id, medicine_name, category = 'Essential', requested_quantity, unit = 'strips', urgency = 'Routine' } = req.body;

    if (!facility_id || !medicine_name || !requested_quantity) {
      return res.status(400).json({ error: 'facility_id, medicine_name, and requested_quantity are required' });
    }

    const ins = db.run(`
      INSERT INTO medicine_requests (facility_id, worker_id, medicine_name, category, requested_quantity, unit, urgency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [parseInt(facility_id), req.user.user_id, medicine_name, category, parseInt(requested_quantity), unit, urgency]);

    const reqId = Number(ins.lastInsertRowid);

    // Notify administrators
    db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT u.user_id, 'New Medicine Replenishment Request', ?, 'general'
      FROM users u WHERE u.role = 'admin' LIMIT 2
    `, [`Request #${reqId}: ${req.user.name || 'Health Worker'} requested ${requested_quantity} ${unit} of ${medicine_name} (${urgency} priority).`]);

    const created = db.get('SELECT mr.*, f.facility_name, u.name as worker_name FROM medicine_requests mr JOIN facilities f ON mr.facility_id = f.facility_id JOIN users u ON mr.worker_id = u.user_id WHERE mr.request_id = ?', [reqId]);
    return res.status(201).json({
      message: 'Medicine replenishment request dispatched to Directorate Admin',
      request: created
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/medicines/requests
 * Worker & Admin: View medicine replenishment requests
 */
router.get('/requests', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { facility_id, status } = req.query;
    let query = `
      SELECT mr.*, f.facility_name, u.name as worker_name, admin.name as admin_name
      FROM medicine_requests mr
      JOIN facilities f ON mr.facility_id = f.facility_id
      JOIN users u ON mr.worker_id = u.user_id
      LEFT JOIN users admin ON mr.admin_id = admin.user_id
      WHERE 1=1
    `;
    const params = [];

    if (facility_id) {
      query += ` AND mr.facility_id = ?`;
      params.push(parseInt(facility_id));
    }
    if (status) {
      query += ` AND mr.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY CASE mr.urgency WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, mr.created_at DESC`;
    const requests = db.all(query, params);
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/medicines/requests/:id/status
 * Admin: Approve, Reject, or Fulfill a replenishment request
 * Fulfilling automatically records an inventory_transaction and increments stock (Section 15)
 */
router.put('/requests/:id/status', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, admin_notes } = req.body;

    if (!['Pending', 'Approved', 'Rejected', 'Fulfilled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required (Pending, Approved, Rejected, Fulfilled)' });
    }

    const reqItem = db.get('SELECT * FROM medicine_requests WHERE request_id = ?', [requestId]);
    if (!reqItem) return res.status(404).json({ error: 'Replenishment request not found' });

    db.transaction(() => {
      db.run(`
        UPDATE medicine_requests
        SET status = ?, admin_id = ?, admin_notes = ?, resolved_at = CURRENT_TIMESTAMP
        WHERE request_id = ?
      `, [status, req.user.user_id, admin_notes || null, requestId]);

      // If fulfilled, automatically update stock through an audited transaction (Section 15, Step 73-74)
      if (status === 'Fulfilled') {
        let existingMed = db.get('SELECT * FROM medicine_stock WHERE facility_id = ? AND LOWER(medicine_name) = LOWER(?)', [reqItem.facility_id, reqItem.medicine_name]);
        let newBalance = reqItem.requested_quantity;
        let medId = null;

        if (existingMed) {
          medId = existingMed.medicine_id;
          newBalance = existingMed.quantity + reqItem.requested_quantity;
          db.run(`
            UPDATE medicine_stock
            SET quantity = ?, stock_status = 'In Stock', last_updated = CURRENT_TIMESTAMP
            WHERE medicine_id = ?
          `, [newBalance, medId]);
        } else {
          const ins = db.run(`
            INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
            VALUES (?, ?, ?, ?, ?, 'In Stock')
          `, [reqItem.facility_id, reqItem.medicine_name, reqItem.category, reqItem.requested_quantity, reqItem.unit]);
          medId = Number(ins.lastInsertRowid);
        }

        db.run(`
          INSERT INTO inventory_transactions (facility_id, medicine_id, medicine_name, transaction_type, quantity, balance_after, actor_id, notes)
          VALUES (?, ?, ?, 'Replenishment Fulfilled', ?, ?, ?, ?)
        `, [
          reqItem.facility_id,
          medId,
          reqItem.medicine_name,
          reqItem.requested_quantity,
          newBalance,
          req.user.user_id,
          `Fulfilled from Admin request #${requestId}`
        ]);
      }

      // Notify health worker
      db.run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Medicine Request Status Update', ?, 'general')
      `, [reqItem.worker_id, `Your replenishment request for ${reqItem.medicine_name} is now: ${status}. Admin notes: ${admin_notes || 'None'}`]);
    });

    const updated = db.get('SELECT * FROM medicine_requests WHERE request_id = ?', [requestId]);
    return res.json({ message: `Request marked as ${status}`, request: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/medicines/transactions
 * View inventory audit transactions
 */
router.get('/transactions', authenticateToken, requireRoles('admin', 'doctor', 'asha'), (req, res) => {
  try {
    const { facility_id } = req.query;
    let query = `
      SELECT it.*, f.facility_name, u.name as actor_name
      FROM inventory_transactions it
      JOIN facilities f ON it.facility_id = f.facility_id
      JOIN users u ON it.actor_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    if (facility_id) {
      query += ` AND it.facility_id = ?`;
      params.push(parseInt(facility_id));
    }
    query += ` ORDER BY it.created_at DESC LIMIT 50`;
    const transactions = db.all(query, params);
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

