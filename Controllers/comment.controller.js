const Comment = require("../Models/comment.model");

const addComment = async (req, res) => {
    const { content, blogId } = req.body;
    try {
      const comment = await Comment.create({ content, blog: blogId, author: req.user.id });
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const getComments = async (req, res) => {
    const { blogId } = req.params;
    try {
      const comments = await Comment.find({ blog: blogId }).populate('author', 'username');
      res.json(comments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  module.exports = { addComment, getComments };