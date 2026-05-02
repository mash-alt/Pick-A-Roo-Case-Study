const bcrypt = require('bcrypt');
const User = require('../models/userModel');

async function getUsers(req, res) {
  const users = await User.findAll({ orderBy: 'User_ID' });
  res.json(users.map((user) => User.withoutPassword(user)));
}

async function getUser(req, res) {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(User.withoutPassword(user));
}

async function createUser(req, res) {
  const existingUser = await User.findByEmail(req.body.User_Email);

  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const hashedPassword = await bcrypt.hash(req.body.User_Password, 10);
  const user = await User.create({
    ...req.body,
    User_Password: hashedPassword
  });

  res.status(201).json(User.withoutPassword(user));
}

async function updateUser(req, res) {
  const data = { ...req.body };

  if (data.User_Password) {
    data.User_Password = await bcrypt.hash(data.User_Password, 10);
  }

  const user = await User.update(req.params.id, data);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(User.withoutPassword(user));
}

async function deleteUser(req, res) {
  const deleted = await User.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(204).send();
}

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
