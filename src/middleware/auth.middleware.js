const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const queryToken = req.query && req.query.token ? req.query.token : null;
  const token = bearerToken || queryToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
};
