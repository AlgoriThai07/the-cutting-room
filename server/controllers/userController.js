const User = require('../models/User');
const { createNotification } = require('./notificationController');

const MAX_FRIENDS = 40;

/**
 * Send a friend request
 * POST /api/users/:id/request
 */
const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.id;

        // Can't send request to yourself
        if (userId === targetUserId) {
            return res.status(400).json({ message: 'Cannot send friend request to yourself' });
        }

        // Check if target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(userId);

        // Check if already friends
        if (user.friends.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already friends with this user' });
        }

        // Check if request already sent
        if (user.friend_requests_sent.includes(targetUserId)) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        // Check if they already sent us a request (auto-accept)
        if (user.friend_requests_received.includes(targetUserId)) {
            // Auto-accept: add each other as friends
            if (user.friends.length >= MAX_FRIENDS) {
                return res.status(400).json({ message: `You have reached the maximum friends limit (${MAX_FRIENDS})` });
            }
            if (targetUser.friends.length >= MAX_FRIENDS) {
                return res.status(400).json({ message: `Target user has reached the maximum friends limit (${MAX_FRIENDS})` });
            }

            user.friends.push(targetUserId);
            targetUser.friends.push(userId);
            user.friend_requests_received.pull(targetUserId);
            targetUser.friend_requests_sent.pull(userId);
            await user.save();
            await targetUser.save();

            return res.json({
                message: 'Friend request auto-accepted (they had already sent you a request)',
                friends_count: user.friends.length
            });
        }

        // Send the request
        user.friend_requests_sent.push(targetUserId);
        targetUser.friend_requests_received.push(userId);
        await user.save();
        await targetUser.save();

        // Notify target user
        await createNotification(targetUserId, 'friend_request', userId);

        res.json({ message: 'Friend request sent' });

    } catch (error) {
        console.error('sendFriendRequest error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Accept a friend request
 * POST /api/users/requests/:id/accept
 */
const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const fromUserId = req.params.id;

        const user = await User.findById(userId);
        const fromUser = await User.findById(fromUserId);

        if (!fromUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if request exists
        if (!user.friend_requests_received.includes(fromUserId)) {
            return res.status(400).json({ message: 'No friend request from this user' });
        }

        // Check friend limits
        if (user.friends.length >= MAX_FRIENDS) {
            return res.status(400).json({ message: `You have reached the maximum friends limit (${MAX_FRIENDS})` });
        }
        if (fromUser.friends.length >= MAX_FRIENDS) {
            return res.status(400).json({ message: `Requesting user has reached the maximum friends limit (${MAX_FRIENDS})` });
        }

        // Add each other as friends
        user.friends.push(fromUserId);
        fromUser.friends.push(userId);

        // Clean up requests
        user.friend_requests_received.pull(fromUserId);
        fromUser.friend_requests_sent.pull(userId);

        await user.save();
        await fromUser.save();

        // Notify the requester that their request was accepted
        await createNotification(fromUserId, 'friend_accepted', userId);

        res.json({
            message: 'Friend request accepted',
            friends_count: user.friends.length
        });

    } catch (error) {
        console.error('acceptFriendRequest error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Reject/cancel a friend request
 * DELETE /api/users/requests/:id
 */
const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.id;

        const user = await User.findById(userId);
        const otherUser = await User.findById(otherUserId);

        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        let removed = false;

        // Check if we received a request from them
        if (user.friend_requests_received.includes(otherUserId)) {
            user.friend_requests_received.pull(otherUserId);
            otherUser.friend_requests_sent.pull(userId);
            removed = true;
        }

        // Check if we sent a request to them (cancel)
        if (user.friend_requests_sent.includes(otherUserId)) {
            user.friend_requests_sent.pull(otherUserId);
            otherUser.friend_requests_received.pull(userId);
            removed = true;
        }

        if (!removed) {
            return res.status(400).json({ message: 'No friend request found with this user' });
        }

        await user.save();
        await otherUser.save();

        res.json({ message: 'Friend request removed' });

    } catch (error) {
        console.error('rejectFriendRequest error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get pending friend requests (received)
 * GET /api/users/requests
 */
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .populate('friend_requests_received', 'username email avatar')
            .populate('friend_requests_sent', 'username email avatar');

        res.json({
            received: user.friend_requests_received,
            sent: user.friend_requests_sent
        });

    } catch (error) {
        console.error('getPendingRequests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Remove a friend (unfriend)
 * DELETE /api/users/:id/friend
 */
const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = req.params.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if actually friends
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'Not friends with this user' });
        }

        // Remove from both sides
        user.friends.pull(friendId);
        friend.friends.pull(userId);

        await user.save();
        await friend.save();

        res.json({
            message: 'Friend removed',
            friends_count: user.friends.length
        });

    } catch (error) {
        console.error('removeFriend error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get friends list
 * GET /api/users/friends
 */
const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate('friends', 'username email avatar');

        res.json({
            count: user.friends.length,
            max: MAX_FRIENDS,
            friends: user.friends
        });

    } catch (error) {
        console.error('getFriends error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get user profile
 * GET /api/users/:id
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('username avatar created_at');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update current user's profile
 * PUT /api/users/me
 * Updatable fields: username, avatar
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, avatar } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username !== undefined) {
            // Check if username is taken
            const existing = await User.findOne({ username, _id: { $ne: userId } });
            if (existing) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }
        if (avatar !== undefined) user.avatar = avatar;

        const updatedUser = await user.save();
        const userObj = updatedUser.toObject();
        delete userObj.password_hash;

        res.json(userObj);

    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get current user's profile
 * GET /api/users/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password_hash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Search user by email (exact match)
 * GET /api/users/search?email=...
 */
const searchUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('username email avatar bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        console.error('searchUserByEmail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
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
};

