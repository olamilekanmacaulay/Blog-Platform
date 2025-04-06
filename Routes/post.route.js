const express = require('express');
const {
    createPost,
    getPosts,
    getPost,
    getMyPublishedPosts,
    getMyDrafts,
    getMyScheduled,
    toggleBookmark,
    updatePost,
    deletePost,
    updatePostSchedule
} = require('../Controllers/post.controller');
const { authorization } = require('../Middlewares/Authentication');

const router = express.Router();

// Create a new post
router.post('/posts', authorization, createPost);

// Get all posts
router.get('/posts', getPosts);

// Get a single post
router.get('/posts/:id', getPost);

// Get user's published posts
router.get('/posts/me/published', authorization, getMyPublishedPosts);

// Get user's drafts
router.get('/posts/me/drafts', authorization, getMyDrafts);

// Get user's scheduled posts
router.get('/posts/me/scheduled', authorization, getMyScheduled);

// Toggle bookmark
router.post('/posts/:id/bookmark', authorization, toggleBookmark);

// Update a post
router.put('/posts/:id', authorization, updatePost);

// Delete a post
router.delete('/posts/:id', authorization, deletePost);

// Update post schedule
router.patch('/posts/:id/schedule', authorization, updatePostSchedule);

module.exports = router;