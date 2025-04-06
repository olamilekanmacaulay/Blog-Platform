const User = require("../Models/user.model");
const jwt = require("jsonwebtoken");



// Register a new user.
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
    return res
        .status(400)
        .send(`User with the email ${email} already exists`);
    }

    // Create the user
    try {
        const user = await User.create({ username, email, password, role });
        
        // Exclude sensitive fields from the response
        const { password: _, ...userData } = user.toObject();

        res.status(201).json({ message: "User created successfully", data: userData });
    } catch (error) {
        res.status(400)
            .json({message: "Error creating user", 
        });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }
                
    
        // Create a token of the user
        const token = user.generateAuthToken();

        res
        .cookie("token", token, { httpOnly: true })
        .status(200)
        .json({
            username: user.username,
            email: user.email,
            photo: user.photo,
            role: user.role,
        });

    } catch (error) {
        console.error("Error logging in:", error); // Log the error
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const { username, email, photo, password } = req.body;

        // Check for duplicate email
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }

        // Find the user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (photo) user.photo = photo;

        // Handle password update
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters long" });
            }
            user.password = password; // This will trigger the `pre("save")` middleware to hash the password
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            data: {
                username: user.username,
                email: user.email,
                photo: user.photo,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(400).json({ message: "Error updating user", error: error.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(204).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting user", error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User details fetched successfully", data: { user } });
    } catch (error) {
        res.status(400).json({ message: "Error fetching user details", error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch users with pagination
        const users = await User.find()
            .select("-password")
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            message: "All users fetched successfully",
            data: { users, totalUsers, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        res.status(400).json({ message: "Error fetching users", error: error.message });
    }
};