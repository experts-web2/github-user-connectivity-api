const express = require("express");
const controller = require("../../controllers/github.controller");

const router = express.Router();

router.route("/user").get(controller.getUser).delete(controller.deleteUser);

router.route("/callback").post(controller.githubCallback);

router.route("/organizations").post(controller.getOrganizations);

router.route("/organizations/repos").post(controller.getOrganizationsWithRepos);

router
  .route("/organizations/repos-pull-requests")
  .post(controller.getOrganizationsRepoPullRequest);

router
  .route("/organizations/repos-issues")
  .post(controller.getOrganizationsRepoIssues);

router
  .route("/organizations/repos-commits")
  .post(controller.getOrganizationsRepoCommits);

module.exports = router;
