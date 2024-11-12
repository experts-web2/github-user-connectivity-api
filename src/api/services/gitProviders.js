/* eslint-disable camelcase */
const axios = require('axios');

exports.facebook = async (access_token) => {
  const fields = 'id, name, email, picture';
  const url = 'https://graph.facebook.com/me';
  const params = { access_token, fields };
  const response = await axios.get(url, { params });
  const {
    id, name, email, picture,
  } = response.data;
  return {
    service: 'facebook',
    picture: picture.data.url,
    id,
    name,
    email,
  };
};

exports.google = async (access_token) => {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const params = { access_token };
  const response = await axios.get(url, { params });
  const {
    sub, name, email, picture,
  } = response.data;
  return {
    service: 'google',
    picture,
    id: sub,
    name,
    email,
  };
};

// Helper function to make GET requests with common headers
const fetchGitHubData = async (url, accessToken) => {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data;
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

    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      params,
      { headers: { accept: "application/json" } }
    );
    return response.data.access_token;

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
exports.getGitHubOrganizationsRepos = async (accessToken,params) => {
  const url = `https://api.github.com/user/repos`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    params,
  });
  const linkHeader = response.headers['link'];
  const linkParts = linkHeader.split(','); // Split multiple links
    const lastPageLink = linkParts.find(part => part.includes('rel="last"')); // Get the link for the last page

    console.log('LAST PAGE',lastPageLink)

    if(lastPageLink){
    
      // Extract the URL for the last page
      const lastPageUrl = lastPageLink.match(/<([^>]+)>/)[1];
      const lastPageParams = new URLSearchParams(lastPageUrl.split('?')[1]);      
      const totalPages = parseInt(lastPageParams.get('page'), 10);

      const lastPageResponse = await axios.get(lastPageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const totalRepos = (totalPages - 1) * params.per_page + lastPageResponse.data.length; // Add the repos from the current page
      response['total_records'] = totalRepos
    }

  return response;
};

// Get pull requests for a specific repository
exports.getGitHubRepoPullRequests = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  return fetchGitHubData(url, accessToken);
};


// Get commits for a specific repository
exports.getGitHubRepoCommits = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  return fetchGitHubData(url, accessToken);
};

// Get issues for a specific repository
exports.getGitHubRepoIssues = async (accessToken, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  return fetchGitHubData(url, accessToken);
};
