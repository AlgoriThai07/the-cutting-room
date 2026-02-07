const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getFriends, getProfile, getMe, updateProfile } = require('../controllers/userController');

// All routes are protected
router.use(authMiddleware);

// GET /api/users/me - Get current user
router.get('/me', getMe);

// PUT /api/users/me - Update current user profile
router.put('/me', updateProfile);

// GET /api/users/friends - Get friends list
router.get('/friends', getFriends);

// GET /api/users/:id - Get user profile
router.get('/:id', getProfile);

// POST /api/users/:id/follow - Follow a user
router.post('/:id/follow', followUser);

// DELETE /api/users/:id/follow - Unfollow a user
router.delete('/:id/follow', unfollowUser);

module.exports = router;
