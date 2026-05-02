const BaseModel = require('./baseModel');
const pool = require('../config/db');

const productFields = [
  'Prod_StoreID',
  'Prod_Name',
  'Prod_Price',
  'Prod_Stock',
  'Prod_ImageURL'
];

class ProductModel extends BaseModel {
  constructor() {
    super('PRODUCT', 'Prod_ID', productFields);
  }

  async list({ storeId, page = 1, limit = 10 } = {}) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const offset = (safePage - 1) * safeLimit;
    const values = [];
    let where = '';

    if (storeId) {
      where = 'WHERE `Prod_StoreID` = ?';
      values.push(storeId);
    }

    const [rows] = await pool.query(
      `SELECT * FROM \`PRODUCT\` ${where} ORDER BY \`Prod_ID\` DESC LIMIT ? OFFSET ?`,
      [...values, safeLimit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`PRODUCT\` ${where}`,
      values
    );

    return {
      data: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / safeLimit)
      }
    };
  }

  async isManagedByOwner(productId, ownerId) {
    const [rows] = await pool.query(
      `SELECT p.\`Prod_ID\`
       FROM \`PRODUCT\` p
       JOIN \`STORE\` s ON s.\`Store_ID\` = p.\`Prod_StoreID\`
       WHERE p.\`Prod_ID\` = ? AND s.\`Store_OwnerID\` = ?
       LIMIT 1`,
      [productId, ownerId]
    );
    return rows.length > 0;
  }

  async storeBelongsToOwner(storeId, ownerId) {
    const [rows] = await pool.query(
      'SELECT `Store_ID` FROM `STORE` WHERE `Store_ID` = ? AND `Store_OwnerID` = ? LIMIT 1',
      [storeId, ownerId]
    );
    return rows.length > 0;
  }
}

module.exports = new ProductModel();
