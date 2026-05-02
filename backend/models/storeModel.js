const BaseModel = require('./baseModel');
const pool = require('../config/db');

const storeFields = [
  'Store_Name',
  'Store_City',
  'Store_Loc',
  'Store_ContactNum',
  'Store_OwnerID',
  'Store_Status'
];

class StoreModel extends BaseModel {
  constructor() {
    super('STORE', 'Store_ID', storeFields);
  }

  async findByOwner(ownerId) {
    return this.findAll({ filters: { Store_OwnerID: ownerId }, orderBy: 'Store_ID' });
  }

  async isOwnedBy(storeId, ownerId) {
    const [rows] = await pool.query(
      'SELECT `Store_ID` FROM `STORE` WHERE `Store_ID` = ? AND `Store_OwnerID` = ? LIMIT 1',
      [storeId, ownerId]
    );
    return rows.length > 0;
  }
}

module.exports = new StoreModel();
