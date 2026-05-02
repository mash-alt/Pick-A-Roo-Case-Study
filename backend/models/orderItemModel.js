const BaseModel = require('./baseModel');
const pool = require('../config/db');

const orderItemFields = [
  'OItem_OrderID',
  'OItem_ProdID',
  'OItem_Quantity',
  'OItem_SubTotal'
];

class OrderItemModel extends BaseModel {
  constructor() {
    super('ORDER_ITEM', 'OItem_ID', orderItemFields);
  }

  async createWithComputedSubtotal(data) {
    const productId = Number(data.OItem_ProdID);
    const quantity = Number(data.OItem_Quantity);

    const [products] = await pool.query(
      'SELECT `Prod_Price` FROM `PRODUCT` WHERE `Prod_ID` = ? LIMIT 1',
      [productId]
    );

    if (products.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const item = await this.create({
      ...data,
      OItem_Quantity: quantity,
      OItem_SubTotal: Number(products[0].Prod_Price) * quantity
    });

    await this.recalculateOrderTotal(data.OItem_OrderID);
    return item;
  }

  async updateWithComputedSubtotal(itemId, data) {
    const existing = await this.findById(itemId);
    if (!existing) return null;

    const nextProductId = Number(data.OItem_ProdID || existing.OItem_ProdID);
    const nextQuantity = Number(data.OItem_Quantity || existing.OItem_Quantity);

    const [products] = await pool.query(
      'SELECT `Prod_Price` FROM `PRODUCT` WHERE `Prod_ID` = ? LIMIT 1',
      [nextProductId]
    );

    if (products.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await this.update(itemId, {
      ...data,
      OItem_ProdID: nextProductId,
      OItem_Quantity: nextQuantity,
      OItem_SubTotal: Number(products[0].Prod_Price) * nextQuantity
    });

    await this.recalculateOrderTotal(updated.OItem_OrderID);
    return updated;
  }

  async deleteAndRecalculate(itemId) {
    const existing = await this.findById(itemId);
    if (!existing) return false;

    const deleted = await this.delete(itemId);
    await this.recalculateOrderTotal(existing.OItem_OrderID);
    return deleted;
  }

  async recalculateOrderTotal(orderId) {
    await pool.query(
      `UPDATE \`ORDER\`
       SET \`Order_Total\` = COALESCE((
         SELECT SUM(\`OItem_SubTotal\`)
         FROM \`ORDER_ITEM\`
         WHERE \`OItem_OrderID\` = ?
       ), 0)
       WHERE \`Order_ID\` = ?`,
      [orderId, orderId]
    );
  }
}

module.exports = new OrderItemModel();
