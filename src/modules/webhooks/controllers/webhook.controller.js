const Webhook = require('../models/webhook.model');
const { ok, fail } = require('../../../core/response');

exports.create = async (req, res) => {
  try {
    const { name, url, event } = req.body;

    if (!name || !url || !event) {
      return fail(res, 'name, url, event required', 400);
    }

    const item = await Webhook.create({ name, url, event });
    return ok(res, item, 'Webhook created');
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await Webhook.findAll({ order: [['createdAt', 'DESC']] });
    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Webhook.findByPk(req.params.id);

    if (!item) {
      return fail(res, 'Webhook not found', 404);
    }

    await item.destroy();
    return ok(res, null, 'Webhook deleted successfully');
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
