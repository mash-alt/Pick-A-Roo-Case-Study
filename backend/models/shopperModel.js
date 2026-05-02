const BaseModel = require('./baseModel');

const shopperFields = [
  'Shopr_FName',
  'Shopr_LName',
  'Shopr_PhoneNum',
  'Shopr_Status'
];

module.exports = new BaseModel('SHOPPER', 'Shopr_ID', shopperFields);
