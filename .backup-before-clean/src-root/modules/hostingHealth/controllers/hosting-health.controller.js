const App = require('../../apps/models/app.model');
const Deployment = require('../../deployments/models/deployment.model');

exports.summary = async (req, res) => {
  try {
    const [apps, deployments] = await Promise.all([
      App.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []),
      Deployment.findAll({ order: [['createdAt', 'DESC']] }).catch(() => [])
    ]);

    return res.json({
      success: true,
      hosting: {
        apps: apps.map(a => a.toJSON ? a.toJSON() : a),
        deployments: deployments.map(d => d.toJSON ? d.toJSON() : d)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
