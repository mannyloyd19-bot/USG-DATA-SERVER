const Func = require('../models/function.model');

exports.create = async (req, res) => {
  try {
    const { name, event, code } = req.body;

    if (!name || !event || !code) {
      return res.status(400).json({ message: 'name, event, code required' });
    }

    const item = await Func.create({ name, event, code });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  const items = await Func.findAll();
  res.json(items);
};
