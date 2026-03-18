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
  const items = await Webhook.findAll();
  res.json(items);
};
