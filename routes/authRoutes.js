const express = require('express');
const { register, login } = require('../controllers/authControllers.js');
const { validateAuth } = require('../middlewares/authMiddlewares.js');

const router = express.Router();

router.post('/user/register', validateAuth, register);
router.post('/user/login', login);
router.post('/employer/register', validateAuth, register);
router.post('/employer/login', login);

module.exports = router;
