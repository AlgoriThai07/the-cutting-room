const Item = require('../models/Item');
const Node = require('../models/Node');
const Track = require('../models/Track');
const modelApi = require('../services/modelApi');
const { uploadFile } = require('../services/r2Storage');

const DAILY_POST_LIMIT = 3;
const TRACK_NODE_LIMIT = 10;
const TRACK_MAX_AGE_DAYS = 7;

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
 * Check daily post limit for a user.
 * Returns { allowed, remaining, count }.
 */
const checkDailyLimit = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Item.countDocuments({
        user_id: userId,
        created_at: { $gte: today, $lt: tomorrow }
    });

    return {
        allowed: count < DAILY_POST_LIMIT,
        remaining: Math.max(0, DAILY_POST_LIMIT - count),
        count
    };
};

/**
 * Get all item IDs already paired with this user in any node's similar_item_ids.
 * This prevents a user from seeing the same external item in two different nodes.
 */
const getAlreadyPairedItemIds = async (userId) => {
    const nodes = await Node.find({ user_id: userId }, { similar_item_ids: 1 });
    const ids = new Set();
    for (const node of nodes) {
        for (const id of node.similar_item_ids) {
            ids.add(id.toString());
        }
    }
    return Array.from(ids);
};

/**
 * Get or create the user's active (unconcluded) track.
 * A track concludes at TRACK_NODE_LIMIT nodes, after 7 days, or by user choice.
 * If current track is concluded or belongs to a past week, create a new one.
 */
const getActiveTrack = async (userId) => {
    const weekId = getWeekId();

    // First, conclude any expired tracks
    await concludeExpiredTracks(userId);

    // Look for an unconcluded track in the current week
    let track = await Track.findOne({
        user_id: userId,
        week_id: weekId,
        concluded: false
    });

    if (track) return track;

    // Create new track for this week
    track = await Track.create({
        user_id: userId,
        week_id: weekId,
        node_ids: [],
        story: '',
        concluded: false
    });

    return track;
};

/**
 * Check if a track has exceeded the 7-day lifespan.
 * @param {Object} track - Mongoose track document
 * @returns {boolean}
 */
const isTrackExpired = (track) => {
    const createdAt = new Date(track.created_at);
    const now = new Date();
    const ageMs = now - createdAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays >= TRACK_MAX_AGE_DAYS;
};

/**
 * Auto-conclude any expired, unconcluded tracks for a user.
 * Called before creating new items to ensure stale tracks are closed.
 */
const concludeExpiredTracks = async (userId) => {
    const expiredTracks = await Track.find({
        user_id: userId,
        concluded: false
    });

    for (const track of expiredTracks) {
        if (isTrackExpired(track)) {
            console.log(`Track ${track._id} expired (older than ${TRACK_MAX_AGE_DAYS} days) — auto-concluding`);
            try {
                await concludeTrackInternal(track);
            } catch (err) {
                console.error(`Failed to auto-conclude expired track ${track._id}:`, err.message);
                // Force-conclude without ML if generation fails
                track.concluded = true;
                await track.save();
            }
        }
    }
};

/**
 * Check if a track should auto-conclude (hit node limit).
 * Auto-concludes and returns true if it did.
 */
const checkAutoConclusion = async (track) => {
    if (track.node_ids.length >= TRACK_NODE_LIMIT) {
        console.log(`Track ${track._id} reached ${TRACK_NODE_LIMIT} nodes — auto-concluding`);
        await concludeTrackInternal(track);
        return true;
    }
    return false;
};

/**
 * Internal conclude logic — shared by auto-conclude and manual conclude.
 * Calls ML service for conclusion text + community reflection.
 */
const concludeTrackInternal = async (track) => {
    const story = track.story || '';

    if (!story) {
        // Nothing to conclude
        track.concluded = true;
        await track.save();
        return track;
    }

    // Find other users' stories from this week for community reflection
    const otherTracks = await Track.find({
        user_id: { $ne: track.user_id },
        week_id: track.week_id,
        story: { $ne: null, $ne: '' }
    }).limit(6);

    const similarStories = otherTracks
        .map(t => t.story)
        .filter(s => s && s.length > 0)
        .slice(0, 3);

    try {
        const result = await modelApi.generateConclusion(story, similarStories);
        track.story = `${story}\n\n${result.conclusion}`;
        track.community_reflection = result.community_reflection || '';
    } catch (err) {
        console.error('ML conclusion generation failed, concluding without it:', err.message);
        // Still conclude — just without ML-generated text
    }

    track.concluded = true;
    await track.save();
    return track;
};

/**
 * After storing an item, try to create a node if there are enough items
 * in the global database (10+). Then check auto-conclusion.
 */
const tryCreateNode = async (userId, item) => {
    // Check global item count
    const totalItems = await Item.countDocuments({});
    if (totalItems < 10) {
        console.log(`Only ${totalItems} items globally — need 10+ for node creation`);
        return null;
    }

    // Get items already paired to avoid duplicates
    const excludeIds = await getAlreadyPairedItemIds(userId);

    // Call ML service for vector search
    let similarItems;
    try {
        const searchResult = await modelApi.vectorSearch(
            item.embedding,
            userId,
            3,
            excludeIds
        );
        similarItems = searchResult.similar_items || [];
    } catch (err) {
        console.error('Vector search failed:', err.message);
        return null;
    }

    if (similarItems.length === 0) {
        console.log('No similar items found from other users');
        return null;
    }

    const similarItemIds = similarItems.map(s => s._id);
    const similarDescriptions = similarItems.map(s => s.description || s.text || '');

    // Get active track
    const track = await getActiveTrack(userId);

    // If track is already concluded, skip (shouldn't happen but safety check)
    if (track.concluded) return null;

    const storySoFar = track.story || '';
    const userDescription = item.description || item.text || '';

    // Call ML for recap sentence
    let recapSentence = '';
    try {
        const recapResult = await modelApi.generateRecap(
            userDescription,
            similarDescriptions,
            storySoFar
        );
        recapSentence = recapResult.recap_sentence || '';
    } catch (err) {
        console.error('Recap generation failed:', err.message);
        recapSentence = '';
    }

    // Find previous node for linking
    const previousNode = await Node.findOne({ user_id: userId })
        .sort({ created_at: -1 });

    const weekId = getWeekId();

    // Create the node
    const node = await Node.create({
        user_id: userId,
        user_item_id: item._id,
        previous_node_id: previousNode ? previousNode._id : null,
        similar_item_ids: similarItemIds,
        recap_sentence: recapSentence,
        week_id: weekId
    });

    // Update track
    const updatedStory = `${storySoFar} ${recapSentence}`.trim();
    track.node_ids.push(node._id);
    track.story = updatedStory;
    await track.save();

    console.log(`Created node ${node._id} (track now has ${track.node_ids.length} nodes)`);

    // Check if track should auto-conclude
    await checkAutoConclusion(track);

    return node;
};

/**
 * Create an item — full pipeline
 * POST /api/items
 * 
 * Flow: daily limit → ML parse → store item → try create node → auto-conclude check
 */
const createItem = async (req, res) => {
    try {
        const userId = req.user.id;

        // ─── Daily limit check ───
        const { allowed, remaining } = await checkDailyLimit(userId);
        if (!allowed) {
            return res.status(429).json({
                message: `Daily post limit reached (${DAILY_POST_LIMIT}/day). Try again tomorrow.`,
                remaining: 0
            });
        }

        // ─── Parse request body ───
        let content_type, text, caption, content_url, description;

        if (req.body.data) {
            try {
                const parsed = JSON.parse(req.body.data);
                ({ content_type, text, caption, content_url, description } = parsed);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON in data field' });
            }
        } else {
            ({ content_type, text, caption, content_url, description } = req.body);
        }

        if (!['text', 'image'].includes(content_type)) {
            return res.status(400).json({ message: 'content_type must be "text" or "image"' });
        }

        // ─── Handle file upload ───
        const files = req.files || [];
        let embedding = [];

        if (content_type === 'image') {
            if (files[0]) {
                // Validate MIME type — only JPEG and PNG
                const allowedMimes = ['image/jpeg', 'image/png'];
                if (!allowedMimes.includes(files[0].mimetype)) {
                    return res.status(400).json({
                        message: `Unsupported image format '${files[0].mimetype}'. Only JPEG and PNG are accepted.`
                    });
                }

                // Upload to R2
                content_url = await uploadFile(files[0]);

                // Call ML to parse image → get description + embedding
                try {
                    const parsed = await modelApi.parseImage(files[0].buffer, files[0].originalname);
                    description = parsed.description;
                    embedding = parsed.embedding;
                } catch (err) {
                    console.error('ML image parsing failed:', err.message);
                    // Still create the item, just without embedding/description
                }
            } else if (!content_url) {
                return res.status(400).json({ message: 'Image file or URL is required for image items' });
            }
        } else if (content_type === 'text') {
            if (!text) {
                return res.status(400).json({ message: 'Text content is required for text items' });
            }
            description = text;

            // Call ML to get embedding
            try {
                const parsed = await modelApi.parseText(text);
                embedding = parsed.embedding;
            } catch (err) {
                console.error('ML text parsing failed:', err.message);
            }
        }

        // ─── Store item in MongoDB ───
        const newItem = await Item.create({
            user_id: userId,
            content_type,
            content_url: content_type === 'image' ? content_url : null,
            text: content_type === 'text' ? text : null,
            caption,
            description,
            embedding
        });

        // ─── Try to create a node (async, don't block response) ───
        tryCreateNode(userId, newItem).catch(err => {
            console.error('Node creation pipeline error:', err.message);
        });

        res.status(201).json({
            message: 'Item created successfully',
            item: newItem,
            remaining: remaining - 1
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
            .populate('user_id', 'username avatar');

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
 * Update an item
 * PUT /api/items/:id
 * Updatable fields: caption, description, text
 */
const updateItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const { caption, description, text } = req.body;

        if (caption !== undefined) item.caption = caption;
        if (description !== undefined) item.description = description;
        if (text !== undefined && item.content_type === 'text') {
            item.text = text;
            // Re-embed via ML
            try {
                const parsed = await modelApi.parseText(text);
                item.embedding = parsed.embedding;
            } catch (err) {
                console.error('ML re-embedding failed:', err.message);
            }
        }

        const updatedItem = await item.save();
        res.json(updatedItem);

    } catch (error) {
        console.error('updateItem error:', error);
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
    updateItem,
    deleteItem,
    // Exported for use by trackController
    concludeTrackInternal,
    getActiveTrack
};
