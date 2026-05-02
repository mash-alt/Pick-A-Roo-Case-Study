const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

async function getUsers(req, res) {
  const { page = 1, limit = 20, role } = req.query;
  const result = await userModel.findAll({
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 20, 100),
    filters: role ? { User_Role: role } : {}
  });
  res.json({ data: result.data || result });
}

async function getUser(req, res) {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(userModel.withoutPassword(user));
}

async function createUser(req, res) {
  const { User_Email, User_Password, User_FName, User_LName, User_PhoneNum, User_Address, User_Role } = req.body;
  
  const existing = await userModel.findByEmail(User_Email);
  if (existing) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(User_Password, 10);
  const user = await userModel.create({
    User_Email,
    User_Password: hashedPassword,
    User_FName,
    User_LName,
    User_PhoneNum,
    User_Address,
    User_Role: User_Role || 'CUSTOMER'
  });
  
  res.status(201).json(userModel.withoutPassword(user));
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { User_FName, User_LName, User_PhoneNum, User_Address, User_Role, User_Password } = req.body;
  
  const existing = await userModel.findById(id);
  if (!existing) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const updateData = { User_FName, User_LName, User_PhoneNum, User_Address, User_Role };
  if (User_Password) {
    updateData.User_Password = await bcrypt.hash(User_Password, 10);
  }
  
  const user = await userModel.update(id, updateData);
  res.json(userModel.withoutPassword(user));
}

async function deleteUser(req, res) {
  const { id } = req.params;
  
  const existing = await userModel.findById(id);
  if (!existing) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Prevent self-deletion
  if (Number(id) === req.user?.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  await userModel.delete(id);
  res.json({ message: 'User deleted successfully' });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};