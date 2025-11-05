//role.middleware.js
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
