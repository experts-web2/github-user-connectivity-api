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
