const jwt = require('jsonwebtoken');

// Admins use the same JWT_SECRET as customers but are distinguished by a `role` claim.
function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    req.adminId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token.' });
  }
}

module.exports = requireAdminAuth;
