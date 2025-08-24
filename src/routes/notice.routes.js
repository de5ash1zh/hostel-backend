const express = require('express');
const { 
  getGroupNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice, 
  togglePinNotice 
} = require('../controllers/notice.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notices for a group
router.get('/groups/:id/notices', getGroupNotices);

// Create a new notice
router.post('/groups/:id/notices', createNotice);

// Update a notice
router.put('/notices/:noticeId', updateNotice);

// Delete a notice
router.delete('/notices/:noticeId', deleteNotice);

// Toggle pin status of a notice
router.patch('/notices/:noticeId/pin', togglePinNotice);

module.exports = router;
