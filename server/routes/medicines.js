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

module.exports = router;
