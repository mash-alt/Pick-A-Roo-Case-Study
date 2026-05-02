const Product = require('../models/productModel');

async function canManageProduct(productId, user) {
  return user.role === 'ADMIN' || Product.isManagedByOwner(productId, user.id);
}

async function canUseStore(storeId, user) {
  return user.role === 'ADMIN' || Product.storeBelongsToOwner(storeId, user.id);
}

async function getProducts(req, res) {
  const products = await Product.list({
    storeId: req.query.storeId || req.query.Prod_StoreID,
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(products);
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}

async function createProduct(req, res) {
  if (!(await canUseStore(req.body.Prod_StoreID, req.user))) {
    return res.status(403).json({ message: 'You can only add products to your own store' });
  }

  const product = await Product.create(req.body);
  res.status(201).json(product);
}

async function updateProduct(req, res) {
  if (!(await canManageProduct(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You can only manage products from your own store' });
  }

  if (req.body.Prod_StoreID && !(await canUseStore(req.body.Prod_StoreID, req.user))) {
    return res.status(403).json({ message: 'You can only move products to your own store' });
  }

  const product = await Product.update(req.params.id, req.body);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}

async function deleteProduct(req, res) {
  if (!(await canManageProduct(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You can only manage products from your own store' });
  }

  const deleted = await Product.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(204).send();
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
