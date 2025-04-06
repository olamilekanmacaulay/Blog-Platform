const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Post = require("../Models/post.model"); // post model
const Comment = require("../Models/comment.model"); // Comment model

// Define the User schema

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, "Username is required"], 
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },

    email: { 
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },

    password: { 
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },

    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },

    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }],

}, {
        timestamps: true,
        versionKey: false 
});

// Pre-save middleware to hash the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next(); // Skip if the password is not modified

    try {
        // Hash the password
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    } catch (error) {
        return next(error);
    }
});


// Method to compare the entered password with the hashed password in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Uses bcrypt to compare the passwords.
};

// Method to generate a JWT for the user
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role }, // Payload
        process.env.JWT_SECRET,           // Secret key
        { expiresIn: "7d" }               // Token expiration (7 days)
    );
};

userSchema.post("findOneAndDelete", async function (user) {
    if (user) {
      // Delete all posts authored by the user
      await Post.deleteMany({ author: user._id });
  
      // Delete all comments authored by the user
      await Comment.deleteMany({ author: user._id });
  
      console.log(`User ${user.username} and their associated data have been deleted.`);
    }
  });
  
module.exports = mongoose.model('User', userSchema);