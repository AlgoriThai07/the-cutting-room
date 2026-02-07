const Item = require('../models/Item');
const modelApi = require('../services/modelApi');

/**
 * Create one or more items
 * POST /api/items
 * Body can be: { content_type, text, ... } OR { items: [{...}, {...}] }
 */
const createItem = async (req, res) => {
    try {
        const userId = req.user.id;

        // Detect if single item or array
        let items = [];
        if (req.body.items && Array.isArray(req.body.items)) {
            items = req.body.items;
        } else {
            items = [req.body];
        }

        if (items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        const createdItems = [];

        for (const item of items) {
            const { content_type, content_url, text, caption, description } = item;

            // Validate content_type
            if (!['text', 'image'].includes(content_type)) {
                return res.status(400).json({ message: 'content_type must be "text" or "image"' });
            }

            // Validate content
            if (content_type === 'text' && !text) {
                return res.status(400).json({ message: 'Text content is required for text items' });
            }
            if (content_type === 'image' && !content_url) {
                return res.status(400).json({ message: 'Image URL is required for image items' });
            }

            // Generate embedding (stub for now)
            const content = content_type === 'text' ? text : caption || '';
            const embedding = await modelApi.generateEmbedding(content);

            // Create the item
            const newItem = await Item.create({
                user_id: userId,
                content_type,
                content_url: content_type === 'image' ? content_url : null,
                text: content_type === 'text' ? text : null,
                caption,
                embedding,
                similar_item_ids: [],
                description
            });

            createdItems.push(newItem);
        }

        res.status(201).json({
            message: `${createdItems.length} item(s) created successfully`,
            items: createdItems
        });

    } catch (error) {
        console.error('createItem error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get an item by ID
 * GET /api/items/:id
 */
const getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('user_id', 'username avatar')
            .populate('similar_item_ids');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);

    } catch (error) {
        console.error('getItem error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get user's items
 * GET /api/items/user/:userId
 */
const getUserItems = async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await Item.find({ user_id: userId })
            .sort({ _id: -1 })
            .limit(50);

        res.json(items);

    } catch (error) {
        console.error('getUserItems error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete an item
 * DELETE /api/items/:id
 */
const deleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check ownership
        if (item.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await Item.findByIdAndDelete(req.params.id);

        res.json({ message: 'Item deleted successfully' });

    } catch (error) {
        console.error('deleteItem error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createItem,
    getItem,
    getUserItems,
    deleteItem
};
