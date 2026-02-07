const Node = require('../models/Node');
const Track = require('../models/Track');

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
 * Get current track with all nodes
 * GET /api/tracks/current
 */
const getCurrentTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const weekId = getWeekId();

        let track = await Track.findOne({ user_id: userId, week_id: weekId })
            .populate({
                path: 'node_ids',
                populate: { path: 'similar_item_ids' },
                options: { sort: { created_at: 1 } }
            });

        if (!track) {
            return res.json({
                user_id: userId,
                week_id: weekId,
                nodes: [],
                story: null
            });
        }

        res.json({
            _id: track._id,
            user_id: track.user_id,
            week_id: track.week_id,
            nodes: track.node_ids,
            story: track.story,
            created_at: track.created_at
        });

    } catch (error) {
        console.error('getCurrentTrack error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get a track by ID
 * GET /api/tracks/:id
 */
const getTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id)
            .populate({
                path: 'node_ids',
                populate: { path: 'similar_item_ids' }
            });

        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        res.json(track);

    } catch (error) {
        console.error('getTrack error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get weekly story for a track
 * GET /api/tracks/:id/story
 */
const getWeeklyStory = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        res.json({
            track_id: track._id,
            week_id: track.week_id,
            story: track.story || 'Story not yet generated. Check back at the end of the week!',
            created_at: track.created_at
        });

    } catch (error) {
        console.error('getWeeklyStory error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update a track's story
 * PUT /api/tracks/:id
 * Updatable fields: story
 */
const updateTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        if (track.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this track' });
        }

        const { story } = req.body;

        if (story !== undefined) track.story = story;

        const updatedTrack = await track.save();
        res.json(updatedTrack);

    } catch (error) {
        console.error('updateTrack error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get track history for a user
 * GET /api/tracks/history
 */
const getTrackHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const tracks = await Track.find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(12);

        res.json(tracks);

    } catch (error) {
        console.error('getTrackHistory error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a track
 * DELETE /api/tracks/:id
 */
const deleteTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        if (track.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this track' });
        }

        await Track.findByIdAndDelete(req.params.id);

        res.json({ message: 'Track deleted successfully' });

    } catch (error) {
        console.error('deleteTrack error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCurrentTrack,
    getTrack,
    getWeeklyStory,
    updateTrack,
    getTrackHistory,
    deleteTrack
};
