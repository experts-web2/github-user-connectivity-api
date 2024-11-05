const githubHelper = require("../helpers/githubHelper");
const githubUserModel = require("../models/githubIntegration");

// Handle the User Retrieval
exports.getUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
    // Find user in the database
    const user = await githubUserModel.findOne({ accessToken });

    if (user) {
      res.json({
        message: "User retrieved successfully",
        data: user,
      });
    } else {
      res.json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error during user retrieval:", error);
    res.status(500).json({ message: "User retrieval failed" });
  }
};

// Handle the OAuth2 callback
exports.githubCallback = async (req, res) => {
  const { code, state } = req.body;

  try {
    const accessToken = await githubHelper.exchangeCodeForToken(code, state);
    const githubUser = await githubHelper.getGitHubUser(accessToken);
    // Check if the user already exists in the database
    let user = await githubUserModel.findOne({ githubId: githubUser.id });
    if (!user) {
      // Create a new user if not found
      user = new githubUserModel({
        id: githubUser.id,
        avatar_url: githubUser.avatar_url,
        login: githubUser.login,
        name: githubUser.name,
        type: githubUser.type,
        created_at: githubUser.created_at,
        accessToken,
      });
      await user.save();
    } else {
      // Update existing user's access token
      user.accessToken = accessToken;
      await user.save();
    }

    res.json({
      message: "Authentication successful",
      data: user,
      accessToken,
    });
  } catch (error) {
    console.error("Error during GitHub OAuth:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    const { accessToken, page, pageSize } = req.body;
    const organizations = await githubHelper.getGitHubOrganizations(accessToken);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error.message);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};


exports.getOrganizationsRapoes = async (req, res) => {
  try {
    const { accessToken} = req.body;
    const organizations = await githubHelper.getGitHubOrganizations(accessToken);
    const organizationsWithRepos = [];

    for (const org of organizations) {
      const repos = await githubHelper.getGitHubOrganizationsRepoes(accessToken, org.login);
      organizationsWithRepos.push(...repos);
    }
    
    res.json(
      {
        success: true,
        data: organizationsWithRepos,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations or repositories',
      error: error.message
    });
  }
};


exports.getOrganizationsRepoPullRequest = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoPullRequests = await githubHelper.getGitHubRepoPullRequests(accessToken, orgName, repoName);

    res.json({
      success: true,
      data: repoPullRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching repo pull-request for ${repoName} `,
      error: error.message
    });
  }
};

exports.getOrganizationsRepoCommits = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoCommits = await githubHelper.getGitHubRepoCommits(accessToken, orgName, repoName);

    res.json({
      success: true,
      data: repoCommits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching repo commits for ${repoName} `,
      error: error.message
    });
  }
};

exports.getOrganizationsRepoIssues = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoIssuses = await githubHelper.getGitHubRepoIssues(accessToken, orgName, repoName);

    res.json({
      success: true,
      data: repoIssuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching repo issues for ${repoName} `,
      error: error.message
    });
  }
};

// Handle the User Delete
exports.deleteUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
    // Delete user already exists in the database
    const deleteUser = await githubUserModel.deleteOne({ accessToken });

    if (deleteUser.deletedCount > 0) {
      res.json({
        message: "User deleted successfully",
        data: deleteUser,
      });
    } else {
      res.json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error during User delete:", error);
    res.status(500).json({ message: "Delete user operation failed" });
  }
};
