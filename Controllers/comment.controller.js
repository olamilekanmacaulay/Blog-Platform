const Comment = require("../Models/comment.model");
const Post = require("../Models/post.model")

const addComment = async (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Content cannot be empty' });
    }
    try {
        const post = await Post.findById(req.params.id);

        if (!post || post.status !== 'published') {
            return res.status(404).json({ message:'Post not found or not published'});
        } 
        const comment = await Comment.create({ 
            content, 
            post: post._id, 
            author: req.user.id 
        });
        res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};
  
// Get all comments for a post
const getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post || post.status !== 'published') {
            res.status(404).json({ message:'Post not found or not published'});
        } 
        const comments = await Comment.find({ post: postId })
            .populate('author', 'username')
            .sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: comments.length,
            data: { comments }
          });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

//Update a comment
const updateComment = async (req, res) => {
    
    try {
        const { content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Content cannot be empty' });
        }
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check permissions
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to update this comment'});
        }
      
        comment.content = content;
        comment.updatedAt = new Date();
        await comment.save();
      
        res.status(200).json({
            status: 'success',
            data: { comment }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete a comment
const deleteComment = async (req, res) => {
    
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check permissions
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to update this comment'});
        }

        await comment.remove();
    
        res.status(204).json({
        status: 'success'
    });
      
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
}

  
module.exports = { addComment, getComments, updateComment, deleteComment };