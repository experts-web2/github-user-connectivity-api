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
