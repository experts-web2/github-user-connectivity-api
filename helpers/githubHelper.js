const axios = require("axios");

// Helper function to make GET requests with common headers
const fetchGitHubData = async (url, accessToken) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json", // Common header for all GitHub API calls
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from GitHub: ${error.message}`);
    throw new Error(`Failed to fetch data from ${url}`);
  }
};

// Exchange the authorization code for an access token
exports.exchangeCodeForToken = async (code, state) => {
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    state,
    redirect_uri: process.env.REDIRECT_URI,
  };

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      params,
      { headers: { accept: "application/json" } }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to exchange code for token");
  }
};

// Get authenticated GitHub user details
exports.getGitHubUser = async (accessToken) => {
  const url = "https://api.github.com/user";
  return fetchGitHubData(url, accessToken);
};

// Get GitHub organizations for the authenticated user
exports.getGitHubOrganizations = async (accessToken) => {
  const url = "https://api.github.com/user/orgs";
  return fetchGitHubData(url, accessToken);
};

// Get repositories of a specific GitHub organization
exports.getGitHubOrganizationsRepos = async (accessToken, orgName) => {
  const url = `https://api.github.com/orgs/${orgName}/repos`;
  return fetchGitHubData(url, accessToken);
};

// Get commits for a specific repository
exports.getGitHubRepoCommits = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  return fetchGitHubData(url, accessToken);
};

// Get pull requests for a specific repository
exports.getGitHubRepoPullRequests = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  return fetchGitHubData(url, accessToken);
};

// Get issues for a specific repository
exports.getGitHubRepoIssues = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  return fetchGitHubData(url, accessToken);
};
