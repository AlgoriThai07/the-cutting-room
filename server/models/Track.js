const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    week_start: {
        type: Date,
        required: true
    },
    node_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }],
    personal_story: {
        type: String,
        default: null
    },
    community_story: {
        type: String,
        default: null
    },
    theme_vector: {
        type: [Number],
        default: []
    },
    generated_at: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Track', trackSchema);
