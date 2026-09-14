const jwt = require("jsonwebtoken");

// Verifies the JWT issued at FR1.2 (User Login) and attaches { id, role }
// to req.user. Implements the "Secure authentication using ... JSON Web
// Tokens (JWT)" software interface (SRS Section 3.3) and NFR1/NFR3
// (session-scoped access control).
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing or invalid Authorization header." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Implements role-based access control (NFR: Security Requirements ->
// "Role-based access control shall restrict users to authorized
// functions"). Usage: requireRole("administrator") or
// requireRole("administrator", "partner_organization").
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
