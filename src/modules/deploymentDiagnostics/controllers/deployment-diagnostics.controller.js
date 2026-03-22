const Deployment = require('../../deployments/models/deployment.model');
const App = require('../../apps/models/app.model');

async function safeCount(model, where = {}) {
  try {
    return await model.count({ where });
  } catch {
    return 0;
  }
}

exports.summary = async (req, res) => {
  try {
    const [totalDeployments, runningApps, stoppedApps, failedDeployments] = await Promise.all([
      safeCount(Deployment),
      safeCount(App, { status: 'running' }),
      safeCount(App, { status: 'stopped' }),
      safeCount(Deployment, { status: 'failed' })
    ]);

    const latest = await Deployment.findOne({
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      summary: {
        totalDeployments,
        runningApps,
        stoppedApps,
        failedDeployments
      },
      latest
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await Deployment.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    return res.json({ success: true, deployments: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markSuccess = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    item.status = 'success';
    await item.save();

    return res.json({ success: true, deployment: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markFailed = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    item.status = 'failed';
    await item.save();

    return res.json({ success: true, deployment: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
