const Notification = require('../models/Notification');

/**
 * Get user's notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only } = req.query;

        const query = { user_id: userId };
        if (unread_only === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate('from_user_id', 'username avatar')
            .populate('node_id', 'recap_sentence')
            .sort({ created_at: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            read: false
        });

        res.json({
            notifications,
            unread_count: unreadCount
        });

    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error('markAsRead error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { user_id: userId, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.json({ message: 'Notification deleted' });

    } catch (error) {
        console.error('deleteNotification error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Helper: Create a notification (used by other controllers)
 */
const createNotification = async (userId, type, fromUserId, nodeId = null) => {
    try {
        // Don't notify yourself
        if (userId.toString() === fromUserId.toString()) {
            return null;
        }

        const notification = await Notification.create({
            user_id: userId,
            type,
            from_user_id: fromUserId,
            node_id: nodeId
        });

        return notification;
    } catch (error) {
        console.error('createNotification error:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
