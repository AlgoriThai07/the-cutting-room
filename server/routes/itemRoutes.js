const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createItem, getItem, getUserItems, deleteItem } = require('../controllers/itemController');

// All routes are protected
router.use(authMiddleware);

// POST /api/items - Create item(s)
router.post('/', createItem);

// GET /api/items/:id - Get item by ID
router.get('/:id', getItem);

// GET /api/items/user/:userId - Get user's items
router.get('/user/:userId', getUserItems);

// DELETE /api/items/:id - Delete item
router.delete('/:id', deleteItem);

module.exports = router;
