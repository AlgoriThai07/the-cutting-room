const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    node_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }],
    story: {
        type: String,
        default: null
    },
    community_reflection: {
        type: String,
        default: ''
    },
    concluded: {
        type: Boolean,
        default: false
    },
    week_id: {
        type: String, // e.g., "2026-W06"
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Track', trackSchema);
