const Item = require('../models/Item');
const modelApi = require('../services/modelApi');
const { uploadFile } = require('../services/r2Storage');

/**
 * Create one or more items
 * POST /api/items
 * Body can be: { content_type, text, ... } OR { items: [...] } (multipart/form-data)
 */
const createItem = async (req, res) => {
    try {
        const userId = req.user.id;

        let items = [];

        // Handle multipart/form-data
        // If sending JSON as a string in a form field called 'data'
        if (req.body.data) {
            try {
                const parsedData = JSON.parse(req.body.data);
                if (Array.isArray(parsedData)) {
                    items = parsedData;
                } else if (parsedData.items && Array.isArray(parsedData.items)) {
                    items = parsedData.items;
                } else {
                    items = [parsedData];
                }
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON in data field' });
            }
        }
        // Direct fields (simple single item case)
        else {
            items = [{
                content_type: req.body.content_type,
                text: req.body.text,
                caption: req.body.caption,
                description: req.body.description,
                content_url: req.body.content_url
            }];
        }

        if (items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        const createdItems = [];

        // Map files to items 
        // Assumption: If multiple files, they correspond to items with content_type='image' in order
        const files = req.files || [];
        let fileIndex = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let { content_type, content_url, text, caption, description } = item;

            // Validate content_type
            if (!['text', 'image'].includes(content_type)) {
                return res.status(400).json({ message: 'content_type must be "text" or "image"' });
            }

            // Handle Image Upload
            if (content_type === 'image') {
                if (files[fileIndex]) {
                    // Upload to R2
                    const publicUrl = await uploadFile(files[fileIndex]);
                    content_url = publicUrl;
                    fileIndex++;
                } else if (!content_url) {
                    // Check if content_url was provided in body (e.g. pre-signed URL or external link)
                    return res.status(400).json({ message: 'Image file or URL is required for image items' });
                }
            }

            // Validate content
            if (content_type === 'text' && !text) {
                return res.status(400).json({ message: 'Text content is required for text items' });
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
