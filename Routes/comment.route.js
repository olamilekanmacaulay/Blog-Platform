const express = require("express");
const { addComment, getComments } = require('../Controllers/comment.controller');
const { authorization } = require("../Middlewares/Aunthentication");
const router = express.Router();

router.post("/comment'", authorization, addComment);
router.get("/:blogId", getComments);

module.exports = router;