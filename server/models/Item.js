const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
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
        maxlength: 90 
    },
    embedding: {
        type: [Number], // Vector from Model Team
        default: []
    },
    description: {
        type: String,
        default: null
    },
});


module.exports = mongoose.model('Item', itemSchema);