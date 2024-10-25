const axios = require("axios");

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
      {
        headers: { accept: "application/json" },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw new Error("Failed to exchange code for token");
  }
};

// Get authenticated GitHub user details
exports.getGitHubUser = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user details:", error);
    throw new Error("Failed to fetch GitHub user details");
  }
};


exports.getGitHubOrganizations = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: `Bearer ${accessToken}`,
      Accept : "application/vnd.github.v3+json"
     },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user details:", error);
    throw new Error("Failed to fetch GitHub user details");
  }
};

exports.getGitHubOrganizationsRepoes = async (accessToken,orgName) => {
  try {
    const response = await axios.get(`https://api.github.com/orgs/${orgName}/repos`, {
      headers: { Authorization: `Bearer ${accessToken}`,
      Accept : "application/vnd.github.v3+json"
     },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user details:", error);
    throw new Error("Failed to fetch GitHub user details");
  }
};


// Get commits for a repository
exports.getGitHubRepoCommits = async (accessToken, owner, repo) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
    const response = await axios.get(url, {
      headers: { Authorization: `token ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user details:", error);
    throw new Error("Failed to fetch GitHub Commits");
  }
};

// Get pull requests for a repository
exports.getGitHubRepoPullRequests = async (accessToken, owner, repo) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
    const response = await axios.get(url, {
      headers: { Authorization: `token ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user pull requests:", error);
    throw new Error("Failed to fetch user pull requests");
  }
 
};

// Get issues for a repository
exports.getGitHubRepoIssues = async (accessToken, owner, repo) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const response = await axios.get(url, {
    headers: { Authorization: `token ${accessToken}` }
  });
  return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user issues:", error);
    throw new Error("Failed to fetch user issues")
  }
  
};
