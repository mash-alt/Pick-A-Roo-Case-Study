const OrderItem = require('../models/orderItemModel');

async function getOrderItems(req, res) {
  const filters = {};
  if (req.query.orderId) filters.OItem_OrderID = req.query.orderId;

  const items = await OrderItem.findAll({ filters, orderBy: 'OItem_ID' });
  res.json(items);
}

async function getOrderItem(req, res) {
  const item = await OrderItem.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Order item not found' });
  }

  res.json(item);
}

async function createOrderItem(req, res) {
  const item = await OrderItem.createWithComputedSubtotal(req.body);
  res.status(201).json(item);
}

async function updateOrderItem(req, res) {
  const item = await OrderItem.updateWithComputedSubtotal(req.params.id, req.body);

  if (!item) {
    return res.status(404).json({ message: 'Order item not found' });
  }

  res.json(item);
}

async function deleteOrderItem(req, res) {
  const deleted = await OrderItem.deleteAndRecalculate(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'Order item not found' });
  }

  res.status(204).send();
}

module.exports = { getOrderItems, getOrderItem, createOrderItem, updateOrderItem, deleteOrderItem };
