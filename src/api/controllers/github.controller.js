const httpStatus = require("http-status");
const APIError = require("../errors/api-error");

const githubUserModel = require("../models/githubIntegration.model");
const gitProviders = require("../services/gitProviders");

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
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "No user found",
      });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * Handles the GitHub OAuth2 callback and exchanges code for access token
 * @public
 */
exports.githubCallback = async (req, res, next) => {
  const { code, state } = req.body;

  try {
    // Exchange code for an access token
    const accessToken = await gitProviders.exchangeCodeForToken(code, state);
    const githubUser = await gitProviders.getGitHubUser(accessToken);
    console.log('USER PUBLIC',githubUser.public_repos)
    console.log('USER PRIVATE',githubUser.total_private_repos)
    console.log('USER ONLY',accessToken)


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

    res.status(httpStatus.CREATED);
    return res.json({
      message: "Authentication successful",
      data: user,
      accessToken,
    });
    // return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves a list of organizations the authenticated GitHub user is part of
 * @public
 */
exports.getOrganizations = async (req, res, next) => {
  const { accessToken, page, pageSize } = req.body;

  try {
    const organizations = await gitProviders.getGitHubOrganizations(
      accessToken,
      page,
      pageSize
    );
    return res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves a list of organizations with their repositories for a GitHub user
 * @public
 */
exports.getOrganizationsWithRepos = async (req, res, next) => {
  const { accessToken, page = 1, pageSize = 10 } = req.body;

  try {
    const params= { page: page, per_page: pageSize }
      const repos = await gitProviders.getGitHubOrganizationsRepos(
        accessToken,
        params
      );

    return res.json({
      success: true,
      data: repos.data,
      total: repos.total_records
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves pull requests for a specific repository within an organization
 * @public
 */
exports.getOrganizationsRepoPullRequest = async (req, res, next) => {
  const { accessToken, orgName, repoName } = req.body;

  try {
    const repoPullRequests = await gitProviders.getGitHubRepoPullRequests(
      accessToken,
      orgName,
      repoName
    );
    return res.json({
      success: true,
      data: repoPullRequests,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves commit history for a specific repository in an organization
 * @public
 */
exports.getOrganizationsRepoCommits = async (req, res, next) => {
  const { accessToken, orgName, repoName } = req.body;

  try {
    const repoCommits = await gitProviders.getGitHubRepoCommits(
      accessToken,
      orgName,
      repoName
    );
    return res.json({
      success: true,
      data: repoCommits,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves issues for a specific repository in an organization
 * @public
 */
exports.getOrganizationsRepoIssues = async (req, res, next) => {
  const { accessToken, orgName, repoName } = req.body;

  try {
    const repoIssues = await gitProviders.getGitHubRepoIssues(
      accessToken,
      orgName,
      repoName
    );
    return res.json({
      success: true,
      data: repoIssues,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes a GitHub user record based on their access token
 * @public
 */
exports.deleteUser = async (req, res, next) => {
  const { accessToken } = req.query;

  try {
    const deleteUser = await githubUserModel.deleteOne({ accessToken });

    if (deleteUser.deletedCount > 0) {
      return res.json({
        message: "User removed successfully",
      });
    }

    throw new APIError({
      status: httpStatus.NOT_FOUND,
      message: "No user found with that access token",
    });
  } catch (error) {
    return next(error);
  }
};

// /**
//  * Returns a formated object with tokens
//  * @private
//  */
// function generateTokenResponse(user, accessToken) {
//   const tokenType = 'Bearer';
//   const refreshToken = RefreshToken.generate(user).token;
//   const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
//   return {
//     tokenType,
//     accessToken,
//     refreshToken,
//     expiresIn,
//   };
// }

// /**
//  * Returns jwt token if registration was successful
//  * @public
//  */
// exports.register = async (req, res, next) => {
//   try {
//     const userData = omit(req.body, 'role');
//     const user = await new User(userData).save();
//     const userTransformed = user.transform();
//     const token = generateTokenResponse(user, user.token());
//     res.status(httpStatus.CREATED);
//     return res.json({ token, user: userTransformed });
//   } catch (error) {
//     return next(User.checkDuplicateEmail(error));
//   }
// };

// /**
//  * Returns jwt token if valid username and password is provided
//  * @public
//  */
// exports.login = async (req, res, next) => {
//   try {
//     const { user, accessToken } = await User.findAndGenerateToken(req.body);
//     const token = generateTokenResponse(user, accessToken);
//     const userTransformed = user.transform();
//     return res.json({ token, user: userTransformed });
//   } catch (error) {
//     return next(error);
//   }
// };

// /**
//  * login with an existing user or creates a new one if valid accessToken token
//  * Returns jwt token
//  * @public
//  */
// exports.oAuth = async (req, res, next) => {
//   try {
//     const { user } = req;
//     const accessToken = user.token();
//     const token = generateTokenResponse(user, accessToken);
//     const userTransformed = user.transform();
//     return res.json({ token, user: userTransformed });
//   } catch (error) {
//     return next(error);
//   }
// };

// /**
//  * Returns a new jwt when given a valid refresh token
//  * @public
//  */
// exports.refresh = async (req, res, next) => {
//   try {
//     const { email, refreshToken } = req.body;
//     const refreshObject = await RefreshToken.findOneAndRemove({
//       userEmail: email,
//       token: refreshToken,
//     });
//     const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
//     const response = generateTokenResponse(user, accessToken);
//     return res.json(response);
//   } catch (error) {
//     return next(error);
//   }
// };

// exports.sendPasswordReset = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email }).exec();

//     if (user) {
//       const passwordResetObj = await PasswordResetToken.generate(user);
//       emailProvider.sendPasswordReset(passwordResetObj);
//       res.status(httpStatus.OK);
//       return res.json('success');
//     }
//     throw new APIError({
//       status: httpStatus.UNAUTHORIZED,
//       message: 'No account found with that email',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// exports.resetPassword = async (req, res, next) => {
//   try {
//     const { email, password, resetToken } = req.body;
//     const resetTokenObject = await PasswordResetToken.findOneAndRemove({
//       userEmail: email,
//       resetToken,
//     });

//     const err = {
//       status: httpStatus.UNAUTHORIZED,
//       isPublic: true,
//     };
//     if (!resetTokenObject) {
//       err.message = 'Cannot find matching reset token';
//       throw new APIError(err);
//     }
//     if (moment().isAfter(resetTokenObject.expires)) {
//       err.message = 'Reset token is expired';
//       throw new APIError(err);
//     }

//     const user = await User.findOne({ email: resetTokenObject.userEmail }).exec();
//     user.password = password;
//     await user.save();
//     emailProvider.sendPasswordChangeEmail(user);

//     res.status(httpStatus.OK);
//     return res.json('Password Updated');
//   } catch (error) {
//     return next(error);
//   }
// };
