const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare-hackathon-secure-secret-key-2026';

/**
 * Generate a signed JWT for an authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      village_id: user.village_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: verify JWT token in Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware: restrict route to specific roles
 * @param  {...string} allowedRoles ('citizen', 'asha', 'doctor', 'admin')
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Authorized roles: ${allowedRoles.join(', ')}. Your role: ${req.user ? req.user.role : 'none'}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireRoles
};
