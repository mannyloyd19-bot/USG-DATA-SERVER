module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }

  next();
};
