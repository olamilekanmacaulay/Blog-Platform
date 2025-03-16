const express = require("express");
const { register, login, deleteUser } = require("../Controllers/user.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/user/delete", deleteUser);

module.exports = router;
