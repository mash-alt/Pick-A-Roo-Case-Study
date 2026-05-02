const storeModel = require('../models/storeModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const pool = require('../config/db');

async function getStores(req, res) {
  const { page = 1, limit = 20, status } = req.query;
  const result = await storeModel.findAll({ 
    page: Number(page) || 1, 
    limit: Math.min(Number(limit) || 20, 100),
    filters: status ? { Store_Status: status } : {}
  });
  res.json(result);
}

async function getStore(req, res) {
  const store = await storeModel.findById(req.params.id);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }
  res.json(store);
}

async function createStore(req, res) {
  const { Store_Name, Store_City, Store_Loc, Store_ContactNum, Store_OwnerID, Store_Status } = req.body;
  
  const store = await storeModel.create({
    Store_Name,
    Store_City,
    Store_Loc,
    Store_ContactNum,
    Store_OwnerID,
    Store_Status: Store_Status || 'ACTIVE'
  });
  
  res.status(201).json(store);
}

async function updateStore(req, res) {
  const { id } = req.params;
  const { Store_Name, Store_City, Store_Loc, Store_ContactNum, Store_OwnerID, Store_Status } = req.body;
  
  const existing = await storeModel.findById(id);
  if (!existing) {
    return res.status(404).json({ message: 'Store not found' });
  }
  
  const store = await storeModel.update(id, {
    Store_Name,
    Store_City,
    Store_Loc,
    Store_ContactNum,
    Store_OwnerID,
    Store_Status
  });
  
  res.json(store);
}

async function deleteStore(req, res) {
  const { id } = req.params;
  
  const existing = await storeModel.findById(id);
  if (!existing) {
    return res.status(404).json({ message: 'Store not found' });
  }
  
  // Check for associated orders
  const [orders] = await pool.query('SELECT COUNT(*) as count FROM `ORDER` WHERE `Ord_StoreID` = ?', [id]);
  if (orders[0].count > 0) {
    return res.status(400).json({ message: 'Cannot delete store with existing orders' });
  }
  
  // Delete associated products first
  await productModel.deleteByField('Prod_StoreID', id);
  await storeModel.delete(id);
  
  res.json({ message: 'Store deleted successfully' });
}

async function getStoreStats(req, res) {
  const { id } = req.params;
  
  // Get store info
  const store = await storeModel.findById(id);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }
  
  // Get product count
  const [products] = await pool.query('SELECT COUNT(*) as count FROM `PRODUCT` WHERE `Prod_StoreID` = ?', [id]);
  
  // Get order count
  const [orders] = await pool.query('SELECT COUNT(*) as count FROM `ORDER` WHERE `Ord_StoreID` = ?', [id]);
  
  // Get total revenue
  const [revenue] = await pool.query(
    'SELECT COALESCE(SUM(`Ord_TotalPrice`), 0) as total FROM `ORDER` WHERE `Ord_StoreID` = ? AND `Ord_Status` != ?',
    [id, 'CANCELLED']
  );
  
  res.json({
    store,
    stats: {
      productCount: products[0].count,
      orderCount: orders[0].count,
      totalRevenue: revenue[0].total
    }
  });
}

module.exports = {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  getStoreStats
};