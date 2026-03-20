const Domain = require('../models/domain.model');

exports.createDomain = async (req, res) => {
  try {
    const { name, target } = req.body;

    if (!name || !target) {
      return res.status(400).json({
        success: false,
        message: 'Name and target required'
      });
    }

    const domain = await Domain.create({
      name,
      target
    });

    res.json({ success: true, domain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll();
    res.json({ success: true, domains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;
    await Domain.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
