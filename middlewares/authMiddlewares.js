const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const validateAuth = [
  body('email').isEmail().withMessage('Invalid email format!'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long!'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //passed the user id here
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = {
  validateAuth,
  protectRoute,
};
