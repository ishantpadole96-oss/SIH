const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const { calculateDistance } = require('../services/accessibilityScore');

const router = express.Router();

/**
 * GET /api/medicines
 * Search medicines across government healthcare facilities with proximity & district filtering
 */
router.get('/', (req, res) => {
  try {
    const { 
      search, 
      facility_id, 
      stock_status, 
      category,
      district,
      village_id,
      user_lat,
      user_lng,
      max_distance
    } = req.query;

    let query = `
      SELECT m.*, f.facility_name, f.facility_type, f.latitude, f.longitude, f.contact as facility_contact,
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

    if (district && district !== 'All') {
      query += ` AND v.district = ?`;
      params.push(district);
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

    // Origin coordinates for distance calculation
    let originLat = user_lat ? parseFloat(user_lat) : null;
    let originLng = user_lng ? parseFloat(user_lng) : null;

    if ((!originLat || !originLng) && village_id) {
      const v = db.get('SELECT latitude, longitude FROM villages WHERE village_id = ?', [parseInt(village_id)]);
      if (v) {
        originLat = v.latitude;
        originLng = v.longitude;
      }
    }

    // Fallback default coordinates if district is Pune and no coords given (PHC Khedgaon)
    if (!originLat && (!district || district === 'Pune')) {
      originLat = 18.2851;
      originLng = 73.8824;
    }

    // Grouping by unique medicine name to show cross-facility summary for citizens
    const groupedByName = {};
    for (const item of medicines) {
      let distanceKm = null;
      if (originLat && originLng && item.latitude && item.longitude) {
        distanceKm = calculateDistance(originLat, originLng, item.latitude, item.longitude);
      }

      if (max_distance && distanceKm !== null && distanceKm > parseFloat(max_distance)) {
        continue;
      }

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
        district: item.district,
        quantity: item.quantity,
        stock_status: item.stock_status,
        last_updated: item.last_updated,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null
      });
    }

    // Sort facilities in each group nearest first
    for (const medName in groupedByName) {
      groupedByName[medName].facilities.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;
        return 0;
      });
    }

    return res.json({
      medicines,
      user_location_used: originLat && originLng ? { lat: originLat, lng: originLng } : null,
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

/**
 * POST /api/medicines/dispense
 * ASHA Worker / Doctor: Record giving medicine to a patient
 * Decreases stock automatically and logs inventory transaction
 */
router.post('/dispense', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { medicine_id, medicine_name, facility_id, quantity = 1, patient_id, patient_name, notes } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    // Find medicine stock item
    let med;
    if (medicine_id) {
      med = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [parseInt(medicine_id)]);
    } else if (facility_id && medicine_name) {
      med = db.get('SELECT * FROM medicine_stock WHERE facility_id = ? AND LOWER(medicine_name) = LOWER(?)', [parseInt(facility_id), medicine_name.trim()]);
    } else if (medicine_name) {
      med = db.get('SELECT * FROM medicine_stock WHERE LOWER(medicine_name) = LOWER(?) LIMIT 1', [medicine_name.trim()]);
    }

    if (!med) {
      return res.status(404).json({ error: 'Medicine not found in facility stock inventory.' });
    }

    if (med.quantity < qty) {
      return res.status(400).json({ error: `Insufficient stock! Only ${med.quantity} ${med.unit || 'units'} available, but ${qty} requested.` });
    }

    const newBalance = med.quantity - qty;
    let newStatus = 'In Stock';
    if (newBalance === 0) newStatus = 'Out of Stock';
    else if (newBalance < 20) newStatus = 'Low Stock';

    db.transaction(() => {
      // 1. Update medicine_stock
      db.run(`
        UPDATE medicine_stock
        SET quantity = ?, stock_status = ?, last_updated = CURRENT_TIMESTAMP
        WHERE medicine_id = ?
      `, [newBalance, newStatus, med.medicine_id]);

      // 2. Log inventory transaction
      const patientInfo = patient_name ? `to patient ${patient_name}` : patient_id ? `to patient #${patient_id}` : 'to field patient';
      db.run(`
        INSERT INTO inventory_transactions (facility_id, medicine_id, medicine_name, transaction_type, quantity, balance_after, actor_id, notes)
        VALUES (?, ?, ?, 'Dispensed', ?, ?, ?, ?)
      `, [
        med.facility_id,
        med.medicine_id,
        med.medicine_name,
        qty,
        newBalance,
        req.user.user_id,
        `Dispensed ${qty} ${med.unit || 'units'} ${patientInfo}. Notes: ${notes || 'Field distribution'}`
      ]);
    });

    const updatedMed = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [med.medicine_id]);

    return res.json({
      success: true,
      message: `Dispensed ${qty} ${med.unit || 'units'} of ${med.medicine_name}. New balance: ${newBalance} ${med.unit || 'units'}.`,
      medicine: updatedMed,
      balance_after: newBalance
    });
  } catch (err) {
    console.error('Dispense error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/medicines/adjust
 * ASHA Worker / Admin: Manually adjust/add medicine stock when new supplies are received
 */
router.post('/adjust', authenticateToken, requireRoles('asha', 'doctor', 'admin'), (req, res) => {
  try {
    const { medicine_id, medicine_name, facility_id, quantity, adjustment_type = 'add', unit, notes } = req.body;
    const qty = parseInt(quantity);
    if (isNaN(qty)) {
      return res.status(400).json({ error: 'Valid quantity number is required.' });
    }

    let med;
    if (medicine_id) {
      med = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [parseInt(medicine_id)]);
    } else if (facility_id && medicine_name) {
      med = db.get('SELECT * FROM medicine_stock WHERE facility_id = ? AND LOWER(medicine_name) = LOWER(?)', [parseInt(facility_id), medicine_name.trim()]);
    } else if (medicine_name) {
      med = db.get('SELECT * FROM medicine_stock WHERE LOWER(medicine_name) = LOWER(?) LIMIT 1', [medicine_name.trim()]);
    }

    let newBalance = 0;
    let targetFacilityId = facility_id ? parseInt(facility_id) : (med ? med.facility_id : 1);
    let targetMedName = medicine_name || (med ? med.medicine_name : 'Unknown Medicine');
    let medId = med ? med.medicine_id : null;

    db.transaction(() => {
      if (med) {
        if (adjustment_type === 'add') {
          newBalance = med.quantity + qty;
        } else {
          newBalance = Math.max(0, qty);
        }

        let newStatus = 'In Stock';
        if (newBalance === 0) newStatus = 'Out of Stock';
        else if (newBalance < 20) newStatus = 'Low Stock';

        db.run(`
          UPDATE medicine_stock
          SET quantity = ?, stock_status = ?, last_updated = CURRENT_TIMESTAMP
          WHERE medicine_id = ?
        `, [newBalance, newStatus, med.medicine_id]);
      } else {
        newBalance = Math.max(0, qty);
        let newStatus = newBalance === 0 ? 'Out of Stock' : newBalance < 20 ? 'Low Stock' : 'In Stock';
        const ins = db.run(`
          INSERT INTO medicine_stock (facility_id, medicine_name, category, quantity, unit, stock_status)
          VALUES (?, ?, 'Essential', ?, ?, ?)
        `, [targetFacilityId, targetMedName, newBalance, unit || 'tablets', newStatus]);
        medId = Number(ins.lastInsertRowid);
      }

      db.run(`
        INSERT INTO inventory_transactions (facility_id, medicine_id, medicine_name, transaction_type, quantity, balance_after, actor_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        targetFacilityId,
        medId,
        targetMedName,
        adjustment_type === 'add' ? 'Restock' : 'Adjustment',
        qty,
        newBalance,
        req.user.user_id,
        notes || (adjustment_type === 'add' ? `Stock received: +${qty} units` : `Stock manually adjusted to ${newBalance} units`)
      ]);
    });

    const updatedMed = db.get('SELECT * FROM medicine_stock WHERE medicine_id = ?', [medId]);

    return res.json({
      success: true,
      message: `Stock updated successfully. Current balance: ${newBalance} ${updatedMed.unit || 'units'}.`,
      medicine: updatedMed,
      balance_after: newBalance
    });
  } catch (err) {
    console.error('Adjust stock error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

