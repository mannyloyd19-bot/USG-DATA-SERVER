exports.summary = async (req, res) => {
  try {
    return res.json({
      success: true,
      realtime: {
        channels: [
          { name: 'collections', status: 'active', events: 24 },
          { name: 'audit', status: 'active', events: 11 },
          { name: 'tenants', status: 'idle', events: 2 }
        ],
        connectedClients: 0,
        totalEvents: 37
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
