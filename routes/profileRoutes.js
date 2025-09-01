const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
const profileControllers = require('../controllers/profileControllers');
const authenticateToken = require('../utils/authenticateToken');

// Protect all profile routes
router.use(authenticateToken);

router.get('/user', profileControllers.getUserProfile);
router.post(
  '/user',

  upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 },
  ]),
  profileControllers.setUserProfile
);
router.patch(
  '/user',
  upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 },
  ]),
  profileControllers.updateUserProfile
);

router.get('/employer', profileControllers.getEmployerProfile);
router.post(
  '/employer',
  upload.single('org_avatar'), // multer middleware for single image file named 'logo'
  profileControllers.setEmployerProfile
);
router.patch(
  '/employer',
  upload.single('org_avatar'),
  profileControllers.updateEmployerProfile
);
router.get('/user/:userId', profileControllers.getUserProfileForEmployer);

module.exports = router;
