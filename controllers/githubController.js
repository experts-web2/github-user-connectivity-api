const githubHelper = require("../helpers/githubHelper");
const GithubUser = require("../models/githubIntegration");

// Handle the User Retrieval
exports.getUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
    const user = await GithubUser.findOne({ accessToken });

    res.json({
      message: user ? "User retrieved successfully" : "User not found",
      data: user || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: "User retrieval failed" });
  }
};

// Handle the OAuth2 callback
exports.githubCallback = async (req, res) => {
  const { code, state } = req.body;

  try {
    const accessToken = await githubHelper.exchangeCodeForToken(code, state);
    const githubUser = await githubHelper.getGitHubUser(accessToken);

    const user = await GithubUser.findOneAndUpdate(
      { githubId: githubUser.id },
      {
        $set: {
          avatar_url: githubUser.avatar_url,
          login: githubUser.login,
          name: githubUser.name,
          type: githubUser.type,
          created_at: githubUser.created_at,
          accessToken,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Authentication successful",
      data: user,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Handle the User Delete
exports.deleteUser = async (req, res) => {
  const { accessToken } = req.query;

  try {
    const result = await GithubUser.deleteOne({ accessToken });

    res.json({
      message:
        result.deletedCount > 0
          ? "User deleted successfully"
          : "User not found",
      data: result.deletedCount > 0 ? result : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: "Delete user operation failed" });
  }
};
