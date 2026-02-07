const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getPendingRequests,
    removeFriend,
    getFriends,
    getProfile,
    getMe,
    updateProfile,
    searchUserByEmail
} = require('../controllers/userController');

// All routes are protected
router.use(authMiddleware);

// GET /api/users/me - Get current user
router.get('/me', getMe);

// PUT /api/users/me - Update current user profile
router.put('/me', updateProfile);

// GET /api/users/friends - Get friends list
router.get('/friends', getFriends);

// GET /api/users/search - Search user by email
router.get('/search', searchUserByEmail);

// GET /api/users/requests - Get pending friend requests
router.get('/requests', getPendingRequests);

// POST /api/users/requests/:id/accept - Accept a friend request
router.post('/requests/:id/accept', acceptFriendRequest);

// DELETE /api/users/requests/:id - Reject/cancel a friend request
router.delete('/requests/:id', rejectFriendRequest);

// GET /api/users/:id - Get user profile
router.get('/:id', getProfile);

// POST /api/users/:id/request - Send a friend request
router.post('/:id/request', sendFriendRequest);

// DELETE /api/users/:id/friend - Remove a friend
router.delete('/:id/friend', removeFriend);

module.exports = router;
