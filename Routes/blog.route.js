const express = require('express');
const { createBlog, updateBlog, getBlogs, deleteBlog, getUserBlogs } = require("../Controllers/blog.controller");
const { authorization } = require("../Middlewares/Aunthentication")
const router = express.Router();

router.post("/createblog", createBlog);
router.get("/", getBlogs);
router.get("/myblogs", authorization, getUserBlogs);
router.put("/:id", authorization, updateBlog);
router.delete("/:id", authorization, deleteBlog);

module.exports = router;