const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_super_secret_jwt_key_2024';

/**
 * GET /api/notifications
 * Get notifications for current logged in user or general public health alerts for guests
 */
router.get('/', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        const notifications = db.all(`
          SELECT * FROM notifications
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 50
        `, [user.user_id]);

        const unreadCount = db.get(`
          SELECT COUNT(*) as count FROM notifications
          WHERE user_id = ? AND read_status = 0
        `, [user.user_id]);

        return res.json({
          notifications,
          unread_count: unreadCount ? unreadCount.count : 0
        });
      } catch (jwtErr) {
        // Fallback to guest broadcasts
      }
    }

    // Default guest broadcast notifications
    const guestNotifications = [
      {
        notification_id: 101,
        title: 'ANC Clinical Consultation Scheduled',
        message: 'Khedgaon PHC doctor consultation scheduled for 10:30 AM with Dr. Anjali Patil.',
        type: 'appointment',
        read_status: 0,
        created_at: new Date().toISOString()
      },
      {
        notification_id: 102,
        title: 'Weekly Maternal & Child Immunization Drive',
        message: 'Free Pentavalent & Rotavirus vaccines available this Thursday at all Sub-Centres.',
        type: 'health_alert',
        read_status: 0,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        notification_id: 103,
        title: 'Jan Aushadhi Generic Medicine Batch Arrived',
        message: 'Paracetamol, Metformin & IFA tablets restocked at Nashik & Pune Jan Aushadhi Kendras.',
        type: 'system',
        read_status: 1,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    return res.json({
      notifications: guestNotifications,
      unread_count: 2
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
