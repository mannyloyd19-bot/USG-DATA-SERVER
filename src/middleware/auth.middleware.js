const jwt = require('jsonwebtoken');
const User = require('../modules/users/models/user.model');
const ApiKey = require('../modules/apiKeys/models/api-key.model');
const ApiKeyLog = require('../modules/apiKeyLogs/models/api-key-log.model');
const { touchSession } = require('../modules/sessions/services/session.service');

function parseBearer(headerValue = '') {
  if (!headerValue) return null;
  const parts = String(headerValue).split(' ');
  if (parts.length !== 2) return null;
  return {
    scheme: parts[0],
    token: parts[1]
  };
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    ''
  );
}

function inferKeyMeta(fullKey = '') {
  const m = /^usg_(pk|sk)_(live|test)_(.+)$/i.exec(fullKey);
  if (!m) {
    return {
      keyType: 'sk',
      keyEnvironment: 'live'
    };
  }

  return {
    keyType: m[1].toLowerCase(),
    keyEnvironment: m[2].toLowerCase()
  };
}

function attachApiKeyLogger(req, item, clientIp) {
  resFinishOnce(req, async (statusCode) => {
    try {
      await ApiKeyLog.create({
        apiKeyId: item.id || null,
        apiKeyName: item.name || null,
        method: req.method,
        path: req.originalUrl || req.url || '',
        statusCode: Number(statusCode || 0),
        ipAddress: clientIp || null
      });
    } catch (error) {
      console.error('Failed to write API key log:', error.message);
    }
  });
}

function resFinishOnce(req, callback) {
  if (req._apiKeyLogBound) return;
  req._apiKeyLogBound = true;

  req.res.on('finish', () => {
    callback(req.res.statusCode);
  });
}

async function tryApiKeyAuth(req) {
  const authHeader = req.headers.authorization || '';
  const parsed = parseBearer(authHeader);
  const headerKey = req.headers['x-api-key'];
  const apiKeyValue =
    headerKey ||
    (parsed && /^apikey$/i.test(parsed.scheme) ? parsed.token : null);

  if (!apiKeyValue) return null;

  const item = await ApiKey.findOne({ where: { key: apiKeyValue } });
  if (!item) {
    return { ok: false, status: 401, message: 'Invalid API key' };
  }

  if (item.status && item.status !== 'active') {
    return { ok: false, status: 403, message: `API key is ${item.status}` };
  }

  if (item.expiresAt && new Date(item.expiresAt).getTime() < Date.now()) {
    return { ok: false, status: 403, message: 'API key has expired' };
  }

  const whitelist = safeJsonParse(item.ipWhitelist, []);
  const clientIp = getClientIp(req);

  if (Array.isArray(whitelist) && whitelist.length > 0) {
    const allowed = whitelist.includes(clientIp);
    if (!allowed) {
      return { ok: false, status: 403, message: 'IP address is not allowed for this API key' };
    }
  }

  const meta = inferKeyMeta(item.key);

  req.apiKey = item;
  req.authType = 'api_key';
  req.user = {
    id: null,
    username: item.name || 'api_key',
    role: item.role || 'admin',
    authType: 'api_key',
    apiKeyId: item.id,
    keyType: meta.keyType,
    keyEnvironment: meta.keyEnvironment
  };

  req.apiKeyMeta = meta;

  try {
    item.usageCount = Number(item.usageCount || 0) + 1;
    item.lastUsedAt = new Date();
    item.lastUsedIp = clientIp || null;
    await item.save();
  } catch (error) {
    console.error('Failed to update API key usage:', error.message);
  }

  attachApiKeyLogger(req, item, clientIp);

  return { ok: true };
}

module.exports = async (req, res, next) => {
  try {
    req.res = res;

    const apiKeyResult = await tryApiKeyAuth(req);
    if (apiKeyResult) {
      if (!apiKeyResult.ok) {
        return res.status(apiKeyResult.status).json({
          success: false,
          message: apiKeyResult.message,
          requestId: req.requestId || null
        });
      }
      return next();
    }

    const authHeader = req.headers.authorization || '';
    const parsed = parseBearer(authHeader);

    if (!parsed || !/^bearer$/i.test(parsed.scheme)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        requestId: req.requestId || null
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT configuration is missing',
        requestId: req.requestId || null
      });
    }

    let payload;
    try {
      payload = jwt.verify(parsed.token, secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        requestId: req.requestId || null
      });
    }

    const userId = payload.id || payload.userId || payload.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        requestId: req.requestId || null
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        requestId: req.requestId || null
      });
    }

    await touchSession(parsed.token);

    req.user = user;
    req.authType = 'jwt';
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
      requestId: req.requestId || null
    });
  }
};
