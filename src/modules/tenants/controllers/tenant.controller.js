const validation = require('../../../core/utils/validation');
const Tenant = require('../models/tenant.model');

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

exports.findAll = async (req, res) => {
  try {
    const rows = await Tenant.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load tenants',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validation.collect(
      validation.required(payload.name, 'Tenant Name'),
      validation.minLength(payload.name, 'Tenant Name', 2),
      validation.required(payload.slug, 'Slug'),
      validation.minLength(payload.slug, 'Slug', 2),
      validation.required(payload.status, 'Status')
    );
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const Model = require('../models/tenant.model');
    const existing = await Model.findOne({ where: { slug: payload.slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'slug already exists' });
    }

    const { name, slug, ownerName, ownerEmail, notes } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      return res.status(400).json({ message: 'valid slug is required' });
    }

    const exists = await Tenant.findOne({ where: { slug: finalSlug } });
    if (exists) {
      return res.status(400).json({ message: 'tenant slug already exists' });
    }

    const item = await Tenant.create({
      name,
      slug: finalSlug,
      ownerName: ownerName || null,
      ownerEmail: ownerEmail || null,
      notes: notes || null,
      status: 'active'
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create tenant',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Tenant.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const { name, slug, ownerName, ownerEmail, notes, status } = req.body || {};

    if (name !== undefined) item.name = name;
    if (slug !== undefined && slug !== '') item.slug = slugify(slug);
    if (ownerName !== undefined) item.ownerName = ownerName || null;
    if (ownerEmail !== undefined) item.ownerEmail = ownerEmail || null;
    if (notes !== undefined) item.notes = notes || null;
    if (status !== undefined) item.status = status || 'active';

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update tenant',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Tenant.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await item.destroy();
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
};
