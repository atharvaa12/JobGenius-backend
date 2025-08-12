const express = require('express');
const { getStreamToken } = require('../controllers/streamController');
const authenticateToken = require('../utils/authenticateToken');

const router = express.Router();

router.get('/token', authenticateToken, getStreamToken);

module.exports = router;
