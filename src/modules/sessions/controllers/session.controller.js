const Session = require('../models/session.model');
const { revokeSession, revokeAllUserSessions } = require('../services/session.service');

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

exports.listMine = async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const rows = await Session.findAll({
      where: { userId: String(userId) },
      order: [['updatedAt', 'DESC']]
    });

    return res.json({ success: true, sessions: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logoutCurrent = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(400).json({ success: false, message: 'Bearer token required' });
    }

    const ok = await revokeSession(token);
    return res.json({ success: ok, message: ok ? 'Current session revoked' : 'Session not found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const count = await revokeAllUserSessions(userId);
    return res.json({ success: true, count, message: 'All sessions revoked' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
