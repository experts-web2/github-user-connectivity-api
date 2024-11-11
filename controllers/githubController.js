const githubHelper = require("../helpers/githubHelper");
const githubUserModel = require("../models/githubIntegration");
const handleError = require("../helpers/errorHandler.js");

// Handle the User Retrieval
exports.getUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
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
    handleError(res, error, 'User retrieval failed');
  }
};

// Handle the OAuth2 callback
exports.githubCallback = async (req, res) => {
  const { code, state } = req.body;

  try {
    const accessToken = await githubHelper.exchangeCodeForToken(code, state);
    const githubUser = await githubHelper.getGitHubUser(accessToken);

    let user = await githubUserModel.findOne({ id: githubUser.id });
    if (!user) {
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
      user.accessToken = accessToken;
      await user.save();
    }

    res.json({
      message: "Authentication successful",
      data: user,
      accessToken,
    });
  } catch (error) {
    handleError(res, error, 'Authentication failed');
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    const { accessToken, page, pageSize } = req.body;
    const organizations = await githubHelper.getGitHubOrganizations(accessToken);
    res.json(organizations);
  } catch (error) {
    handleError(res, error, 'Failed to fetch organizations');
  }
};

exports.getOrganizationsRapoes = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const organizations = await githubHelper.getGitHubOrganizations(accessToken);
    const organizationsWithRepos = [];

    for (const org of organizations) {
      const repos = await githubHelper.getGitHubOrganizationsRepos(accessToken, org.login);
      organizationsWithRepos.push(...repos);
    }

    res.json({
      success: true,
      data: organizationsWithRepos,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching organizations or repositories');
  }
};

exports.getOrganizationsRepoPullRequest = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoPullRequests = await githubHelper.getGitHubRepoPullRequests(accessToken, orgName, repoName);
    res.json({
      success: true,
      data: repoPullRequests,
    });
  } catch (error) {
    handleError(res, error, `Error fetching repo pull-request for ${repoName}`);
  }
};

exports.getOrganizationsRepoCommits = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoCommits = await githubHelper.getGitHubRepoCommits(accessToken, orgName, repoName);
    res.json({
      success: true,
      data: repoCommits,
    });
  } catch (error) {
    handleError(res, error, `Error fetching repo commits for ${repoName}`);
  }
};

exports.getOrganizationsRepoIssues = async (req, res) => {
  const { accessToken, orgName, repoName } = req.body;
  try {
    const repoIssues = await githubHelper.getGitHubRepoIssues(accessToken, orgName, repoName);
    res.json({
      success: true,
      data: repoIssues,
    });
  } catch (error) {
    handleError(res, error, `Error fetching repo issues for ${repoName}`);
  }
};

// Handle the User Delete
exports.deleteUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
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
    handleError(res, error, 'Delete user operation failed');
  }
};
