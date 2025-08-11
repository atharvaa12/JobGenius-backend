const db = require('../utils/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password, role } = req.body;
  const table = role === 'user' ? 'userauth' : 'employerauth';
  try {
    const userExists = await db.query(
      `SELECT * FROM ${table} WHERE email = $1`,
      [email]
    );

    if (userExists.rowCount) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertRes = await db.query(
      `INSERT INTO ${table} (email, password) VALUES ($1, $2) RETURNING ${
        role === 'user' ? 'user_id' : 'employer_id'
      }`,
      [email, hashedPassword]
    );

    const payload = {
      id:
        role === 'user'
          ? insertRes.rows[0].user_id
          : insertRes.rows[0].employer_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ message: 'successful', token });
  } catch (error) {
    console.error('Error in register', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password, role } = req.body;
  const table = role === 'user' ? 'userauth' : 'employerauth';

  try {
    const userExists = await db.query(
      `SELECT * FROM ${table} WHERE email = $1`,
      [email]
    );

    if (userExists.rowCount === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      userExists.rows[0].password
    );

    if (!isCorrectPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id:
        role === 'user'
          ? userExists.rows[0].user_id
          : userExists.rows[0].employer_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ message: 'successful', token });
  } catch (error) {
    console.error('Error in login', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
};
