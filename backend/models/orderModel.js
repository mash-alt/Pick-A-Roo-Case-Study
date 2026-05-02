const BaseModel = require('./baseModel');
const pool = require('../config/db');

const orderFields = [
  'Order_UserID',
  'Order_StoreID',
  'Order_ShoprID',
  'Order_OrderDate',
  'Order_Total',
  'Order_Status',
  'Order_PaymentStatus',
  'Order_DeliveryAddress'
];

class OrderModel extends BaseModel {
  constructor() {
    super('ORDER', 'Order_ID', orderFields);
  }

  normalizeItems(items) {
    const grouped = new Map();

    items.forEach((item) => {
      const productId = Number(item.OItem_ProdID || item.Prod_ID || item.productId);
      const quantity = Number(item.OItem_Quantity || item.quantity);

      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error('Each order item requires a valid product id and positive quantity');
        error.statusCode = 400;
        throw error;
      }

      grouped.set(productId, (grouped.get(productId) || 0) + quantity);
    });

    return Array.from(grouped.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }

  async createOrder({ userId, storeId, shoprId = null, deliveryAddress, items }) {
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('Order must include at least one item');
      error.statusCode = 400;
      throw error;
    }

    const normalizedItems = this.normalizeItems(items);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const productIds = normalizedItems.map((item) => item.productId);
      const placeholders = productIds.map(() => '?').join(', ');
      const [products] = await connection.query(
        `SELECT \`Prod_ID\`, \`Prod_StoreID\`, \`Prod_Price\`, \`Prod_Stock\`
         FROM \`PRODUCT\`
         WHERE \`Prod_ID\` IN (${placeholders})
         FOR UPDATE`,
        productIds
      );

      if (products.length !== productIds.length) {
        const error = new Error('One or more products were not found');
        error.statusCode = 404;
        throw error;
      }

      const productMap = new Map(products.map((product) => [Number(product.Prod_ID), product]));
      let total = 0;
      const orderItems = normalizedItems.map((item) => {
        const product = productMap.get(item.productId);

        if (Number(product.Prod_StoreID) !== Number(storeId)) {
          const error = new Error('All products must belong to the selected store');
          error.statusCode = 400;
          throw error;
        }

        if (Number(product.Prod_Stock) < item.quantity) {
          const error = new Error(`Insufficient stock for product ${item.productId}`);
          error.statusCode = 400;
          throw error;
        }

        const subTotal = Number(product.Prod_Price) * item.quantity;
        total += subTotal;
        return { productId: item.productId, quantity: item.quantity, subTotal };
      });

      const [orderResult] = await connection.query(
        `INSERT INTO \`ORDER\`
         (\`Order_UserID\`, \`Order_StoreID\`, \`Order_ShoprID\`, \`Order_OrderDate\`, \`Order_Total\`, \`Order_Status\`, \`Order_PaymentStatus\`, \`Order_DeliveryAddress\`)
         VALUES (?, ?, ?, NOW(), ?, 'PENDING', 'PENDING', ?)`,
        [userId, storeId, shoprId, total, deliveryAddress]
      );

      const orderId = orderResult.insertId;

      for (const item of orderItems) {
        await connection.query(
          `INSERT INTO \`ORDER_ITEM\`
           (\`OItem_OrderID\`, \`OItem_ProdID\`, \`OItem_Quantity\`, \`OItem_SubTotal\`)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.subTotal]
        );

        await connection.query(
          'UPDATE `PRODUCT` SET `Prod_Stock` = `Prod_Stock` - ? WHERE `Prod_ID` = ?',
          [item.quantity, item.productId]
        );
      }

      await connection.commit();
      return this.findDetailed(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findDetailed(orderId) {
    const [orders] = await pool.query('SELECT * FROM `ORDER` WHERE `Order_ID` = ? LIMIT 1', [orderId]);
    const order = orders[0];

    if (!order) return null;

    const [items] = await pool.query(
      `SELECT oi.*, p.\`Prod_Name\`, p.\`Prod_ImageURL\`
       FROM \`ORDER_ITEM\` oi
       JOIN \`PRODUCT\` p ON p.\`Prod_ID\` = oi.\`OItem_ProdID\`
       WHERE oi.\`OItem_OrderID\` = ?
       ORDER BY oi.\`OItem_ID\` ASC`,
      [orderId]
    );
    const [deliveries] = await pool.query(
      'SELECT * FROM `DELIVERY` WHERE `Dlvery_OrderID` = ? ORDER BY `Dlvery_ID` DESC',
      [orderId]
    );

    return { ...order, items, deliveries };
  }

  async findAllForUser(user) {
    if (user.role === 'ADMIN') {
      const [rows] = await pool.query('SELECT * FROM `ORDER` ORDER BY `Order_ID` DESC');
      return rows;
    }

    if (user.role === 'CUSTOMER') {
      const [rows] = await pool.query(
        'SELECT * FROM `ORDER` WHERE `Order_UserID` = ? ORDER BY `Order_ID` DESC',
        [user.id]
      );
      return rows;
    }

    const [rows] = await pool.query(
      `SELECT o.*
       FROM \`ORDER\` o
       JOIN \`STORE\` s ON s.\`Store_ID\` = o.\`Order_StoreID\`
       WHERE s.\`Store_OwnerID\` = ?
       ORDER BY o.\`Order_ID\` DESC`,
      [user.id]
    );
    return rows;
  }

  async canAccess(orderId, user) {
    if (user.role === 'ADMIN') return true;

    if (user.role === 'CUSTOMER') {
      const [rows] = await pool.query(
        'SELECT `Order_ID` FROM `ORDER` WHERE `Order_ID` = ? AND `Order_UserID` = ? LIMIT 1',
        [orderId, user.id]
      );
      return rows.length > 0;
    }

    const [rows] = await pool.query(
      `SELECT o.\`Order_ID\`
       FROM \`ORDER\` o
       JOIN \`STORE\` s ON s.\`Store_ID\` = o.\`Order_StoreID\`
       WHERE o.\`Order_ID\` = ? AND s.\`Store_OwnerID\` = ?
       LIMIT 1`,
      [orderId, user.id]
    );
    return rows.length > 0;
  }

  async assignShopper(orderId, shopperId) {
    const [shopperRows] = await pool.query(
      'SELECT `Shopr_ID` FROM `SHOPPER` WHERE `Shopr_ID` = ? AND `Shopr_Status` = "ACTIVE" LIMIT 1',
      [shopperId]
    );

    if (shopperRows.length === 0) {
      const error = new Error('Active shopper not found');
      error.statusCode = 404;
      throw error;
    }

    await pool.query(
      'UPDATE `ORDER` SET `Order_ShoprID` = ?, `Order_Status` = "CONFIRMED" WHERE `Order_ID` = ?',
      [shopperId, orderId]
    );

    return this.findDetailed(orderId);
  }
}

module.exports = new OrderModel();
