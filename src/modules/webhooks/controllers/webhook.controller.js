const Webhook = require('../models/webhook.model');

exports.create = async (req, res) => {
  try {
    const { name, url, event } = req.body;

    if (!name || !url || !event) {
      return res.status(400).json({ message: 'name, url, event required' });
    }

    const item = await Webhook.create({ name, url, event });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await Webhook.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Webhook.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    await item.destroy();
    return res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
