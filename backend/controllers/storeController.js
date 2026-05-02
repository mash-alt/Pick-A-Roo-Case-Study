const Store = require('../models/storeModel');

async function canManageStore(storeId, user) {
  return user.role === 'ADMIN' || Store.isOwnedBy(storeId, user.id);
}

async function getStores(req, res) {
  const filters = {};

  if (req.query.status) filters.Store_Status = req.query.status;
  if (req.query.city) filters.Store_City = req.query.city;

  const stores = await Store.findAll({ filters, orderBy: 'Store_ID' });
  res.json(stores);
}

async function getStore(req, res) {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  res.json(store);
}

async function getMyStores(req, res) {
  const stores = await Store.findByOwner(req.user.id);
  res.json(stores);
}

async function createStore(req, res) {
  const ownerId = req.user.role === 'ADMIN' ? req.body.Store_OwnerID || req.user.id : req.user.id;
  const store = await Store.create({
    ...req.body,
    Store_OwnerID: ownerId,
    Store_Status: req.body.Store_Status || 'OPEN'
  });

  res.status(201).json(store);
}

async function updateStore(req, res) {
  if (!(await canManageStore(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You can only manage your own store' });
  }

  const data = { ...req.body };
  if (req.user.role !== 'ADMIN') delete data.Store_OwnerID;

  const store = await Store.update(req.params.id, data);

  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  res.json(store);
}

async function deleteStore(req, res) {
  if (!(await canManageStore(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You can only manage your own store' });
  }

  const deleted = await Store.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'Store not found' });
  }

  res.status(204).send();
}

module.exports = { getStores, getStore, getMyStores, createStore, updateStore, deleteStore, canManageStore };
