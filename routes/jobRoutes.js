const express=require('express');
const router=express.Router();
const jobControllers=require('../controllers/jobControllers');
const authenticateToken = require('../utils/authenticateToken');
router.post('/createjob',authenticateToken,jobControllers.createJobPost);
module.exports=router;