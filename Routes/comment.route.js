const express = require('express');
const { addComment, getComments, updateComment, deleteComment } = require('../Controllers/comment.controller');
const { authorization } = require('../Middlewares/Authentication');

const router = express.Router();

// Add a comment to a post
router.post('/posts/:id/comments', authorization, addComment);

// Get all comments for a post
router.get('/posts/:postId/comments', getComments);

// Update a comment
router.put('/comments/:commentId', authorization, updateComment);

// Delete a comment
router.delete('/comments/:commentId', authorization, deleteComment);

module.exports = router;