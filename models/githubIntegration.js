const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({  
    id: {
        type: Number,
        required: 'Id is required',
    }, 
    avatar_url: {
        type: String,
        required: 'Avatar url required',
    },
    login: {
        type: String,
        required: 'Login name required',
    },
    name: {
        type: String,
        required: 'Name is required',
    },
    type: {
        type: String,
        required: 'User type is required',
    },

    accessToken: {
        type: String,
        required: 'Access token is required',
    },
    
    created_at: { 
        type: Date, default: Date.now 
    },
})

module.exports = mongoose.model("github-integration", githubIntegrationSchema)