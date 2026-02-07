const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    previous_node_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node',
        default: null
    },
    similar_item_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    recap_sentence: {
        type: String,
        default: null
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

module.exports = mongoose.model('Node', nodeSchema);
