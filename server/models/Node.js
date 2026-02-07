const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_type: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    content_url: {
        type: String,
        default: null // For images
    },
    text: {
        type: String, // For text posts
        default: null
    },
    caption: {
        type: String,
        maxlength: 280
    },
    embedding: {
        type: [Number], // Vector from Model Team
        default: []
    },
    previous_node_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node',
        default: null
    },
    neighbor_node_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
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
