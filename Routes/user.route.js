const express = require("express");
const {
    register,
    login,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require("../Controllers/user.controller");
const { authorization, adminOnly } = require("../Middlewares/Authentication");
const { validateRegister, validateLogin } = require("../Middlewares/Validation");
const rateLimit = require("express-rate-limit");
const { isAdmin } = require("../Middlewares/Authentication");

const router = express.Router();

// Rate limiting for public routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: "Too many login/register attempts. Please try again later." }
});

// Public routes
router.post("/register", authLimiter, validateRegister, register); // User registration with validation
router.post("/login", authLimiter, validateLogin, login);         // User login with validation

// Protected routes
router.get("/users/me", authorization, getUser); // Get current user's details
router.put("/users/me", authorization, updateUser); // Update current user's details
router.delete("/users/me", authorization, deleteUser); // Delete current user's account

// Admin-only routes
router.get("/users", authorization, isAdmin, getAllUsers); // Get all users (admin only)

module.exports = router;
