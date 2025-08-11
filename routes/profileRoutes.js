const express = require('express');
const multer=require('multer');
const upload=multer({storage: multer.memoryStorage()});

const router = express.Router();
const profileControllers = require('../controllers/profileControllers');
const authenticateToken = require('../utils/authenticateToken');

// Protect all profile routes
router.get('/user', authenticateToken, profileControllers.getUserProfile);
router.post(
    '/user',
    authenticateToken,
    upload.fields([
      { name: 'pdfFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
    profileControllers.setUserProfile
  );
router.get('/employer', authenticateToken, profileControllers.getEmployerProfile);
router.post(
    '/employer',
    authenticateToken,
    upload.single('org_avatar'),   // multer middleware for single image file named 'logo'
    profileControllers.setEmployerProfile
  );
  
module.exports = router;
