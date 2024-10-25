const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// Get request to handle user retrieval
router.get('/user', githubController.getUser);

// POST request to handle GitHub OAuth callback
router.post('/callback', githubController.githubCallback);

router.post('/organizations', githubController.getOrganizations);

router.post('/organizations/repos', githubController.getOrganizationsRapoes);

router.post('/organizations/repos-pull-requests', githubController.getOrganizationsRepoPullRequest);

router.post('/organizations/repos-issues', githubController.getOrganizationsRepoIssues);

router.post('/organizations/repos-commits', githubController.getOrganizationsRepoCommits);

// DELETE request to handle user deletion
router.delete('/user', githubController.deleteUser);

module.exports = router;
