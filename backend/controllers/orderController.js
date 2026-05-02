const Order = require('../models/orderModel');

async function getOrders(req, res) {
  const orders = await Order.findAllForUser(req.user);
  res.json({ data: orders });
}

async function getOrder(req, res) {
  const order = await Order.findDetailed(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!(await Order.canAccess(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You cannot access this order' });
  }

  res.json(order);
}

async function createOrder(req, res) {
  const userId = req.user.role === 'ADMIN' ? req.body.Order_UserID || req.user.id : req.user.id;

  const order = await Order.createOrder({
    userId,
    storeId: req.body.Order_StoreID,
    shoprId: req.body.Order_ShoprID || null,
    deliveryAddress: req.body.Order_DeliveryAddress,
    items: req.body.items
  });

  res.status(201).json(order);
}

async function updateOrder(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!(await Order.canAccess(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You cannot update this order' });
  }

  const data = {
    Order_ShoprID: req.body.Order_ShoprID,
    Order_Status: req.body.Order_Status,
    Order_PaymentStatus: req.body.Order_PaymentStatus,
    Order_DeliveryAddress: req.body.Order_DeliveryAddress
  };

  const updated = await Order.update(req.params.id, data);
  res.json(updated);
}

async function deleteOrder(req, res) {
  const deleted = await Order.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.status(204).send();
}

async function assignShopper(req, res) {
  if (!(await Order.canAccess(req.params.id, req.user))) {
    return res.status(403).json({ message: 'You cannot assign shoppers for this order' });
  }

  const updated = await Order.assignShopper(req.params.id, req.body.Shopr_ID || req.body.Order_ShoprID);

  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(updated);
}

module.exports = { getOrders, getOrder, createOrder, updateOrder, deleteOrder, assignShopper };
