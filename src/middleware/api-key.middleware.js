const ApiKey = require('../modules/apiKeys/models/api-key.model');

module.exports = async function apiKeyMiddleware(req, res, next) {
  try {
    const key = req.headers['x-api-key'];

    if (!key) {
      return next(); // fallback to user auth
    }

    const record = await ApiKey.findOne({ where: { key, isActive: true } });

    if (!record) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // attach as "system user"
    req.user = {
      id: record.id,
      type: 'api_key',
      name: record.name,
      permissions: record.permissions || []
    };

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
