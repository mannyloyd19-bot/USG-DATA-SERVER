const AuthProvider = require('../models/auth-provider.model');

exports.list = async (req, res) => {
  try {
    const rows = await AuthProvider.findAll({ order: [['providerKey', 'ASC']] });
    return res.json({ success: true, providers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const {
      providerKey,
      displayName,
      enabled,
      clientId,
      clientSecret,
      callbackUrl,
      scopes
    } = req.body || {};

    if (!providerKey || !displayName) {
      return res.status(400).json({ success: false, message: 'providerKey and displayName are required' });
    }

    let row = await AuthProvider.findOne({ where: { providerKey } });
    if (!row) {
      row = await AuthProvider.create({
        providerKey,
        displayName,
        enabled: Boolean(enabled),
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        callbackUrl: callbackUrl || null,
        scopes: scopes || null
      });
    } else {
      row.displayName = displayName;
      row.enabled = Boolean(enabled);
      row.clientId = clientId || null;
      row.clientSecret = clientSecret || null;
      row.callbackUrl = callbackUrl || null;
      row.scopes = scopes || null;
      await row.save();
    }

    return res.json({ success: true, provider: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedDefaults = async (req, res) => {
  try {
    const defaults = [
      { providerKey: 'google', displayName: 'Google' },
      { providerKey: 'facebook', displayName: 'Facebook' },
      { providerKey: 'github', displayName: 'GitHub' },
      { providerKey: 'microsoft', displayName: 'Microsoft' }
    ];

    for (const item of defaults) {
      const existing = await AuthProvider.findOne({ where: { providerKey: item.providerKey } });
      if (!existing) {
        await AuthProvider.create({ ...item, enabled: false });
      }
    }

    const rows = await AuthProvider.findAll({ order: [['providerKey', 'ASC']] });
    return res.json({ success: true, providers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
