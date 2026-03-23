const Session = require('../../sessions/models/session.model');
const AuthProvider = require('../../authProviders/models/auth-provider.model');

async function safeCount(model, where = {}) {
  try {
    return await model.count({ where });
  } catch {
    return 0;
  }
}

function resolveUserId(req) {
  return req.user?.id || req.auth?.id || req.headers['x-user-id'] || null;
}

exports.summary = async (req, res) => {
  try {
    const userId = resolveUserId(req);

    const [totalSessions, activeSessions, providerCount] = await Promise.all([
      safeCount(Session),
      safeCount(Session, { isActive: true }),
      safeCount(AuthProvider)
    ]);

    const mySessions = userId ? await Session.findAll({
      where: { userId: String(userId) },
      order: [['createdAt', 'DESC']],
      limit: 20
    }) : [];

    return res.json({
      success: true,
      summary: {
        totalSessions,
        activeSessions,
        providerCount,
        mySessions: mySessions.length
      },
      sessions: mySessions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.providers = async (req, res) => {
  try {
    const rows = await AuthProvider.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, providers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.sessions = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const rows = await Session.findAll({
      where: { userId: String(userId) },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, sessions: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.revokeCurrent = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const currentToken =
      (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
      req.headers['x-session-token'] ||
      null;

    if (!currentToken) {
      return res.status(400).json({ success: false, message: 'Current token not found' });
    }

    const item = await Session.findOne({
      where: { userId: String(userId), token: currentToken }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Current session not found' });
    }

    item.isActive = false;
    item.revokedAt = new Date();
    await item.save();

    return res.json({ success: true, message: 'Current session revoked', session: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.revokeAll = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const rows = await Session.findAll({ where: { userId: String(userId), isActive: true } });

    for (const item of rows) {
      item.isActive = false;
      item.revokedAt = new Date();
      await item.save();
    }

    return res.json({ success: true, message: 'All sessions revoked', count: rows.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
