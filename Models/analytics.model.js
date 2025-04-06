const mongoose = require('mongoose');

// Analytics schema for tracking post views
const analyticsSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    },

    views: {
        type: Number,
        default: 0
    },

    uniqueVisitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
  timestamps: true
});

// Ensure one document per post per day
analyticsSchema.index({ post: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);