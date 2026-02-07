const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createItem, getItem, getUserItems, deleteItem } = require('../controllers/itemController');

// All routes are protected
router.use(authMiddleware);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/items - Create item(s)
// Use upload.any() to handle multiple files from any field (or 'files' field specifically if preferred)
router.post('/', upload.any(), createItem);

// GET /api/items/:id - Get item by ID
router.get('/:id', getItem);

// GET /api/items/user/:userId - Get user's items
router.get('/user/:userId', getUserItems);

// DELETE /api/items/:id - Delete item
router.delete('/:id', deleteItem);

module.exports = router;
