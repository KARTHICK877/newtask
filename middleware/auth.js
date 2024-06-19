const jwt = require('jsonwebtoken');
const User = require('../model/user');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ email: decoded.email });
    if (!req.user) return res.status(404).send('User not found.');
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};
