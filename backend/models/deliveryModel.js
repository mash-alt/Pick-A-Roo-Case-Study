const BaseModel = require('./baseModel');

const deliveryFields = [
  'Dlvery_OrderID',
  'Dlvery_RiderName',
  'Dlvery_Distance',
  'Dlvery_Status',
  'Dlvery_DeliveryFee'
];

module.exports = new BaseModel('DELIVERY', 'Dlvery_ID', deliveryFields);
