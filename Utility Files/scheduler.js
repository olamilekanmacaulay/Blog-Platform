const Post = require('../Models/post.model');
const cron = require('node-cron');

// Check for scheduled posts every minute
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      
      // Find posts scheduled to be published
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduledPublish: { $lte: now }
      }).lean();
      
      if (postsToPublish.length > 0) {
        const postIds = postsToPublish.map(post => post._id);

        
        // Update posts to published
        const result = await Post.updateMany(
          { _id: { $in: postIds } },
          { 
            status: 'published',
            publishedAt: now,
            scheduledPublish: null
          }
        );
        console.log(`Published ${result.modifiedCount} scheduled posts`);
      }
    } catch (err) {
      console.error('Error in scheduler:', err);
    }
  });
  
  console.log('Post scheduler started');
};

module.exports = startScheduler;