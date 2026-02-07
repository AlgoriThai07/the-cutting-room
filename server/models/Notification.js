const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['like', 'friend_request', 'friend_accepted'],
        required: true
    },
    from_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // For 'like' notifications
    node_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying of unread notifications
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
