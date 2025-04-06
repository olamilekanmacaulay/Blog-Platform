const mongoose = require('mongoose');
const calculateReadingTime = require('../Utility Files/readingTime'); // Utility function to calculate reading time

const postSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'] 
    },

    content: { 
        type: String, 
        required: [true, 'Content is required'] 
    },

    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled'],
        default: 'draft'
    },

    readingTime: {
        type: Number, // in minutes
        default: 0
    },

    scheduledPublish: {
        type: Date,
        default: null
    },

    publishedAt: {
        type: Date,
        default: null
    },

    tags: [{
        type: String,
        maxlength: [20, 'Tags cannot exceed 20 characters']
    }],

    viewCount: {
        type: Number,
        default: 0
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
  });
  
// Calculate reading time before saving
postSchema.pre('save', function(next) {
    if (this.isModified('content')) {
      this.readingTime = calculateReadingTime(this.content);
    }
    
    // Update publishedAt if status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    
    next();
});


// Indexes for better performance
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, publishedAt: 1 });

module.exports = mongoose.model('Post', postSchema);