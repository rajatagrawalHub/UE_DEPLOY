const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists and has roles
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        message: "Access denied. User not authenticated or roles not found.",
      });
    }

    // Check if any of user's roles match the allowed roles
    const hasAllowedRole = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAllowedRole) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = checkRole;
