const TenantMembership = require('../models/tenant-membership.model');

exports.findAll = async (req, res) => {
  try {
    const rows = await TenantMembership.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load tenant memberships',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { tenantId, userId, role, status } = req.body || {};

    if (!tenantId || !userId) {
      return res.status(400).json({ message: 'tenantId and userId are required' });
    }

    const exists = await TenantMembership.findOne({
      where: { tenantId, userId }
    });

    if (exists) {
      return res.status(400).json({ message: 'Membership already exists for this user and tenant' });
    }

    const item = await TenantMembership.create({
      tenantId,
      userId,
      role: role || 'member',
      status: status || 'active'
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create tenant membership',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await TenantMembership.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Tenant membership not found' });
    }

    const { role, status } = req.body || {};
    if (role !== undefined) item.role = role || 'member';
    if (status !== undefined) item.status = status || 'active';

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update tenant membership',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await TenantMembership.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Tenant membership not found' });
    }

    await item.destroy();
    res.json({ message: 'Tenant membership deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete tenant membership',
      error: error.message
    });
  }
};
