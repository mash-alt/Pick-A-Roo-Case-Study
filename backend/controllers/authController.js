const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    {
      id: user.User_ID,
      email: user.User_Email,
      role: user.User_Role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res) {
  const existingUser = await User.findByEmail(req.body.User_Email);

  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const requestedRole = req.body.User_Role || 'CUSTOMER';
  const role = requestedRole === 'ADMIN' ? 'CUSTOMER' : requestedRole;
  const hashedPassword = await bcrypt.hash(req.body.User_Password, 10);

  const user = await User.create({
    User_FName: req.body.User_FName,
    User_LName: req.body.User_LName,
    User_Email: req.body.User_Email,
    User_Password: hashedPassword,
    User_PhoneNum: req.body.User_PhoneNum,
    User_Address: req.body.User_Address,
    User_Role: role
  });

  res.status(201).json({
    user: User.withoutPassword(user),
    token: signToken(user)
  });
}

async function login(req, res) {
  const user = await User.findByEmail(req.body.User_Email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(req.body.User_Password, user.User_Password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    user: User.withoutPassword(user),
    token: signToken(user)
  });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  res.json(User.withoutPassword(user));
}

module.exports = { register, login, me };
