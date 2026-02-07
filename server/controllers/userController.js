const User = require('../models/User');

const MAX_FRIENDS = 40;

/**
 * Follow a user
 * POST /api/users/:id/follow
 */
const followUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.id;

        // Can't follow yourself
        if (userId === targetUserId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get current user
        const user = await User.findById(userId);

        // Check friend limit
        if (user.friends.length >= MAX_FRIENDS) {
            return res.status(400).json({ message: `Maximum friends limit reached (${MAX_FRIENDS})` });
        }

        // Check if already following
        if (user.friends.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to friends list
        user.friends.push(targetUserId);
        await user.save();

        res.json({
            message: 'Successfully followed user',
            friends_count: user.friends.length
        });

    } catch (error) {
        console.error('followUser error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Unfollow a user
 * DELETE /api/users/:id/follow
 */
const unfollowUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.id;

        const user = await User.findById(userId);

        // Check if following
        const index = user.friends.indexOf(targetUserId);
        if (index === -1) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from friends list
        user.friends.splice(index, 1);
        await user.save();

        res.json({
            message: 'Successfully unfollowed user',
            friends_count: user.friends.length
        });

    } catch (error) {
        console.error('unfollowUser error:', error);
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

module.exports = {
    followUser,
    unfollowUser,
    getFriends,
    getProfile,
    getMe,
    updateProfile
};
