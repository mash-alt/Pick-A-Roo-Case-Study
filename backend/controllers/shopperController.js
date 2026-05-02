const Shopper = require('../models/shopperModel');

async function getShoppers(req, res) {
  const filters = {};
  if (req.query.status) filters.Shopr_Status = req.query.status;

  const shoppers = await Shopper.findAll({ filters, orderBy: 'Shopr_ID' });
  res.json(shoppers);
}

async function getShopper(req, res) {
  const shopper = await Shopper.findById(req.params.id);

  if (!shopper) {
    return res.status(404).json({ message: 'Shopper not found' });
  }

  res.json(shopper);
}

async function createShopper(req, res) {
  const shopper = await Shopper.create({
    ...req.body,
    Shopr_Status: req.body.Shopr_Status || 'ACTIVE'
  });

  res.status(201).json(shopper);
}

async function updateShopper(req, res) {
  const shopper = await Shopper.update(req.params.id, req.body);

  if (!shopper) {
    return res.status(404).json({ message: 'Shopper not found' });
  }

  res.json(shopper);
}

async function deleteShopper(req, res) {
  const deleted = await Shopper.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'Shopper not found' });
  }

  res.status(204).send();
}

module.exports = { getShoppers, getShopper, createShopper, updateShopper, deleteShopper };
