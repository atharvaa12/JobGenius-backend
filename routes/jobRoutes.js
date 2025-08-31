const express = require('express');
const router = express.Router();
const jobControllers = require('../controllers/jobControllers');
const authenticateToken = require('../utils/authenticateToken');
router.post('/createjob', authenticateToken, jobControllers.createJobPost);
router.get('/showjobs', authenticateToken, jobControllers.showJobs);
router.post('/apply', authenticateToken, jobControllers.applyToJob);
router.get(
  '/showjobs/employer/:employerId',
  authenticateToken,
  jobControllers.showJobsByEmployer
);
router.get(
  '/showjobs/user/:userId',
  authenticateToken,
  jobControllers.showJobsByUser
);
module.exports = router;
