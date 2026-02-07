const Node = require('../models/Node');
const Track = require('../models/Track');
const modelApi = require('../services/modelApi');

/**
 * Get ISO week string (e.g., "2026-W06")
 */
const getWeekId = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * Create a node
 * POST /api/nodes
 * Body: { similar_item_ids: [...], recap_sentence? }
 */
const createNode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { similar_item_ids, recap_sentence } = req.body;

        if (!similar_item_ids || !Array.isArray(similar_item_ids) || similar_item_ids.length === 0) {
            return res.status(400).json({ message: 'similar_item_ids is required and must be a non-empty array' });
        }

        // Check daily limit (3 nodes per day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCount = await Node.countDocuments({
            user_id: userId,
            created_at: { $gte: today, $lt: tomorrow }
        });

        if (todayCount >= 3) {
            return res.status(429).json({
                message: `Daily limit reached. You can create ${3 - todayCount} more nodes today.`,
                remaining: 3 - todayCount
            });
        }

        const weekId = getWeekId();

        // Find previous node for linking
        const previousNode = await Node.findOne({ user_id: userId })
            .sort({ created_at: -1 });

        const node = await Node.create({
            user_id: userId,
            previous_node_id: previousNode ? previousNode._id : null,
            similar_item_ids,
            recap_sentence: recap_sentence || null,
            week_id: weekId
        });

        // Add node to current week's track (create if needed)
        let track = await Track.findOne({ user_id: userId, week_id: weekId });
        if (!track) {
            track = await Track.create({
                user_id: userId,
                node_ids: [node._id],
                week_id: weekId
            });
        } else {
            track.node_ids.push(node._id);
            await track.save();
        }

        // Fire-and-forget: Generate recap if not provided
        if (!recap_sentence) {
            modelApi.generateRecap(node).then(async (recap) => {
                if (recap) {
                    await Node.findByIdAndUpdate(node._id, { recap_sentence: recap });
                }
            }).catch(console.error);
        }

        res.status(201).json({
            message: 'Node created successfully',
            node
        });

    } catch (error) {
        console.error('createNode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get a node by ID
 * GET /api/nodes/:id
 */
const getNode = async (req, res) => {
    try {
        const node = await Node.findById(req.params.id)
            .populate('user_id', 'username avatar')
            .populate('previous_node_id')
            .populate('similar_item_ids');

        if (!node) {
            return res.status(404).json({ message: 'Node not found' });
        }

        res.json(node);

    } catch (error) {
        console.error('getNode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get user's nodes
 * GET /api/nodes/user/:userId
 */
const getUserNodes = async (req, res) => {
    try {
        const userId = req.params.userId;
        const nodes = await Node.find({ user_id: userId })
            .populate('similar_item_ids')
            .sort({ created_at: -1 })
            .limit(50);

        res.json(nodes);

    } catch (error) {
        console.error('getUserNodes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update a node
 * PUT /api/nodes/:id
 * Updatable fields: similar_item_ids, recap_sentence
 */
const updateNode = async (req, res) => {
    try {
        const userId = req.user.id;
        const node = await Node.findById(req.params.id);

        if (!node) {
            return res.status(404).json({ message: 'Node not found' });
        }

        if (node.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this node' });
        }

        const { similar_item_ids, recap_sentence } = req.body;

        if (similar_item_ids !== undefined) node.similar_item_ids = similar_item_ids;
        if (recap_sentence !== undefined) node.recap_sentence = recap_sentence;

        const updatedNode = await node.save();
        res.json(updatedNode);

    } catch (error) {
        console.error('updateNode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a node
 * DELETE /api/nodes/:id
 */
const deleteNode = async (req, res) => {
    try {
        const userId = req.user.id;
        const node = await Node.findById(req.params.id);

        if (!node) {
            return res.status(404).json({ message: 'Node not found' });
        }

        if (node.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this node' });
        }

        // Remove node from its track
        await Track.updateMany(
            { node_ids: node._id },
            { $pull: { node_ids: node._id } }
        );

        await Node.findByIdAndDelete(req.params.id);

        res.json({ message: 'Node deleted successfully' });

    } catch (error) {
        console.error('deleteNode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createNode,
    getNode,
    getUserNodes,
    updateNode,
    deleteNode
};
