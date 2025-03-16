const Blog = require('../Models/model.blog');

exports.createBlog = async (req, res) => {
    const { title, content } = req.body;
    try {
        const blog = await Blog.create({ title, content, author: req.user.id });
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'username');
        res.json(blogs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get blogs for the authenticated user
exports.getUserBlogs = async (req, res) => {
    try {
      const blogs = await Blog.find({ author: req.user.id }).populate("author", "username");
      res.json(blogs);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};
  

exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        res.json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    try {
        await Blog.findByIdAndDelete(id);
        res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
