const crypto = require('crypto');
const Session = require('../models/session.model');

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function buildDeviceLabel(userAgent = '') {
  const ua = String(userAgent || '').toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown Device';
}

async function createSession({ userId, token, ipAddress, userAgent, expiresAt }) {
  return Session.create({
    userId: String(userId),
    tokenHash: hashToken(token),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    deviceLabel: buildDeviceLabel(userAgent),
    status: 'active',
    expiresAt: expiresAt || null,
    lastSeenAt: new Date()
  });
}

async function touchSession(token) {
  const tokenHash = hashToken(token);
  const row = await Session.findOne({ where: { tokenHash, status: 'active' } });
  if (!row) return null;
  row.lastSeenAt = new Date();
  await row.save();
  return row;
}

async function revokeSession(token) {
  const tokenHash = hashToken(token);
  const row = await Session.findOne({ where: { tokenHash, status: 'active' } });
  if (!row) return false;
  row.status = 'revoked';
  await row.save();
  return true;
}

async function revokeAllUserSessions(userId) {
  const rows = await Session.findAll({ where: { userId: String(userId), status: 'active' } });
  for (const row of rows) {
    row.status = 'revoked';
    await row.save();
  }
  return rows.length;
}

module.exports = {
  hashToken,
  buildDeviceLabel,
  createSession,
  touchSession,
  revokeSession,
  revokeAllUserSessions
};
