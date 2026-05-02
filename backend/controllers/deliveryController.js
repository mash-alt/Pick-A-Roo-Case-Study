const Delivery = require('../models/deliveryModel');
const Order = require('../models/orderModel');
const pool = require('../config/db');

async function getDeliveries(req, res) {
  const values = [];
  const where = [];

  if (req.query.orderId) {
    where.push('d.`Dlvery_OrderID` = ?');
    values.push(req.query.orderId);
  }

  if (req.query.status) {
    where.push('d.`Dlvery_Status` = ?');
    values.push(req.query.status);
  }

  if (req.user.role === 'CUSTOMER') {
    where.push('o.`Order_UserID` = ?');
    values.push(req.user.id);
  }

  if (req.user.role === 'STORE_OWNER') {
    where.push('s.`Store_OwnerID` = ?');
    values.push(req.user.id);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const [deliveries] = await pool.query(
    `SELECT d.*
     FROM \`DELIVERY\` d
     JOIN \`ORDER\` o ON o.\`Order_ID\` = d.\`Dlvery_OrderID\`
     JOIN \`STORE\` s ON s.\`Store_ID\` = o.\`Order_StoreID\`
     ${whereSql}
     ORDER BY d.\`Dlvery_ID\` DESC`,
    values
  );

  res.json(deliveries);
}

async function getDelivery(req, res) {
  const delivery = await Delivery.findById(req.params.id);

  if (!delivery) {
    return res.status(404).json({ message: 'Delivery not found' });
  }

  if (!(await Order.canAccess(delivery.Dlvery_OrderID, req.user))) {
    return res.status(403).json({ message: 'You cannot access this delivery' });
  }

  res.json(delivery);
}

async function createDelivery(req, res) {
  if (!(await Order.canAccess(req.body.Dlvery_OrderID, req.user))) {
    return res.status(403).json({ message: 'You cannot create a delivery for this order' });
  }

  const delivery = await Delivery.create({
    ...req.body,
    Dlvery_Status: req.body.Dlvery_Status || 'ASSIGNED'
  });

  res.status(201).json(delivery);
}

async function updateDelivery(req, res) {
  const existing = await Delivery.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: 'Delivery not found' });
  }

  if (!(await Order.canAccess(existing.Dlvery_OrderID, req.user))) {
    return res.status(403).json({ message: 'You cannot update this delivery' });
  }

  const delivery = await Delivery.update(req.params.id, req.body);
  res.json(delivery);
}

async function deleteDelivery(req, res) {
  const existing = await Delivery.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: 'Delivery not found' });
  }

  if (!(await Order.canAccess(existing.Dlvery_OrderID, req.user))) {
    return res.status(403).json({ message: 'You cannot delete this delivery' });
  }

  await Delivery.delete(req.params.id);
  res.status(204).send();
}

module.exports = { getDeliveries, getDelivery, createDelivery, updateDelivery, deleteDelivery };
