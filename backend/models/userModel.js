const BaseModel = require('./baseModel');
const pool = require('../config/db');

const userFields = [
  'User_FName',
  'User_LName',
  'User_Email',
  'User_Password',
  'User_PhoneNum',
  'User_Address',
  'User_Role'
];

class UserModel extends BaseModel {
  constructor() {
    super('USER', 'User_ID', userFields);
  }

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM `USER` WHERE `User_Email` = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  withoutPassword(user) {
    if (!user) return null;
    const { User_Password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new UserModel();
