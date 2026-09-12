const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/notifications
 * Get notifications for current logged in user
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = db.all(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.user_id]);

    const unreadCount = db.get(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read_status = 0
    `, [req.user.user_id]);

    return res.json({
      notifications,
      unread_count: unreadCount ? unreadCount.count : 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const notifId = parseInt(req.params.id);

    db.run(`
      UPDATE notifications
      SET read_status = 1
      WHERE notification_id = ? AND user_id = ?
    `, [notifId, req.user.user_id]);

    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.put('/read-all', authenticateToken, (req, res) => {
  try {
    db.run(`
      UPDATE notifications
      SET read_status = 1
      WHERE user_id = ?
    `, [req.user.user_id]);

    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
