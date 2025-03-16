const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },

    email: { 
        type: String, 
        required: true, 
        unique: true 
    },

    password: { 
        type: String, 
        required: true },

    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) 
        return next();
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.post("findOneAndDelete", async function (user) {
    if (user) {
      // Delete all blogs authored by the user
      await Blog.deleteMany({ author: user._id });
  
      // Delete all comments authored by the user
      await Comment.deleteMany({ author: user._id });
  
      console.log(`User ${user.username} and their associated data have been deleted.`);
    }
  });
  
module.exports = mongoose.model('User', userSchema);