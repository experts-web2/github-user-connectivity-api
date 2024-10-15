const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// Get request to handle user retrieval
router.get('/user', githubController.getUser);

// POST request to handle GitHub OAuth callback
router.post('/callback', githubController.githubCallback);

// DELETE request to handle user deletion
router.delete('/user', githubController.deleteUser);

module.exports = router;
