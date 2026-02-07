const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCurrentTrack, getTrack, getWeeklyStory, updateTrack, getTrackHistory, concludeTrack, deleteTrack } = require('../controllers/trackController');

// All routes are protected
router.use(authMiddleware);

// GET /api/tracks/current - Get current week's track
router.get('/current', getCurrentTrack);

// GET /api/tracks/history - Get track history
router.get('/history', getTrackHistory);

// GET /api/tracks/:id - Get a track by ID
router.get('/:id', getTrack);

// GET /api/tracks/:id/story - Get weekly story
router.get('/:id/story', getWeeklyStory);

// POST /api/tracks/:id/conclude - Conclude a track (end of week)
router.post('/:id/conclude', concludeTrack);

// PUT /api/tracks/:id - Update a track
router.put('/:id', updateTrack);

// DELETE /api/tracks/:id - Delete a track
router.delete('/:id', deleteTrack);

module.exports = router;
