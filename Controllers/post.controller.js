const Post = require('../Models/post.model');
const calculateReadingTime = require('../Utility Files/readingTime');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, status, scheduledPublish } = req.body;
        // Validate scheduled publish date
        if (status === 'scheduled' && !scheduledPublish) {
            return res.status(400).json({ message: 'Scheduled publish date is required for scheduled posts' });        
        }
      
        if (scheduledPublish) {
            const scheduleDate = new Date(scheduledPublish);
            if (isNaN(scheduleDate.getTime())) {
                return res.status(400).json({ message: 'Invalid scheduled publish date' });
            }
            if (scheduleDate <= new Date()) {
                return res.status(400).json({ message: 'Scheduled publish date must be in the future' });
            }
        }

        // Calculate reading time
        const readingTime = calculateReadingTime(content);

        // Create new post
        const post = await Post.create({ title, 
            content,
            tags,
            status,
            scheduledPublish: status === 'scheduled' ? scheduledPublish : null,
            readingTime,
            author: req.user.id });
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { status, author } = req.query;
        const query = {};
        
        // Apply filters
        if (status) query.status = status;
        if (author) query.author = author;
        
        // Only show published posts to non-authors
        if (!req.user || (req.user.id !== author && req.user.role !== 'admin')) {
          query.status = 'published';
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = await Post.find(query)
          .populate('author', 'username')
          .sort('-createdAt')
          .skip(skip)
          .limit(parseInt(limit));
        
        res.status(200).json({
          status: 'success',
          results: posts.length,
          data: { posts }
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Get a single post by ID(with view tracking)
exports.getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await Post.findById(id)
            .populate('author', 'username')
            .populate('comments');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        // Check permissions
        if (post.status !== 'published' && 
            (!req.user || (req.user.id !== post.author.id && req.user.role !== 'admin'))) {
            return res.status(403).json({ message: 'Forbidden'});
        }

        // Track view count for all users
        post.viewCount += 1;
        await post.save();

        // Record analytics for authenticated users
        if (req.user) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                await Analytics.findOneAndUpdate(
                    { post: post._id, date: today },
                    { 
                        $inc: { views: 1 },
                        $addToSet: { uniqueVisitors: req.user.id }
                    },
                    { upsert: true, new: true }
                );
            } catch (error) {
                console.error('Error recording analytics:', error.message);
            }
        }

        // Check if post is bookmarked by the user
        let isBookmarked = false;
        if (req.user) {
            const user = await User.findById(req.user.id);
            isBookmarked = user.bookmarks.includes(post._id);
        }
        res.status(200).json({
            status: 'success',
            data: {
                ...post.toObject(),
                isBookmarked
            }
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


// Get Posts for the authenticated user
//Get user's published post (Private)
exports.getMyPublishedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ 
            author: req.user.id,
            status: 'published'
        })
        .sort('-publishedAt')
        .populate("author", "username");
        res.json({
            status: 'success',
            count: posts.length,
            posts
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};


// Get user's draft(Private)
exports.getMyDrafts = async (req, res) => {
    try {
        const posts = await Post.find({
            author: req.user.id,
            status: 'draft'
        }).sort('-updatedAt');
        res.json({ posts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Get user's scheduled posts (private)
exports.getMyScheduled = async (req, res) => {
    try {
        const posts = await Post.find({
            author: req.user.id,
            status: 'scheduled'
        }).sort('scheduledPublish');
        res.json({ posts });
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
};

  

exports.toggleBookmark = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.status !== 'published') {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const user = req.user;

        // Check if the post is already bookmarked
        const bookmarkIndex = user.bookmarks.indexOf(post._id);
        if (bookmarkIndex === -1) {
            user.bookmarks.push(post._id);
            await user.save();
            return res.json({ action: 'bookmarked', bookmarks: user.bookmarks });
        } else {
            user.bookmarks.pull(post._id);
            await user.save();
            return res.json({ action: 'unbookmarked', bookmarks: user.bookmarks });
        }
    } catch (error) {
        return res.status(404).json({ message: 'error performing that function' });

    }
    
}

exports.updatePost = async (req, res) => {
    const { id } = req.params;
    try {
        const {title, content, tags, status, scheduledPublish} = req.body;
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check permissions
        const isOwner = post.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ message: 'You can only modify your own posts' })
        }

        if (scheduledPublish) {
            const scheduleDate = new Date(scheduledPublish);
            if (isNaN(scheduleDate.getTime())) {
                return res.status(400).json({ message: 'Invalid scheduled publish date' });
            }
            if (scheduleDate <= new Date()) {
                return res.status(400).json({ message: 'Scheduled publish date must be in the future' });
            }
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.status = status || post.status;
        post.scheduledPublish = scheduledPublish || post.scheduledPublish;

        // Recalculate reading time if content is updated
        if (content) {
            post.readingTime = calculateReadingTime(content);
        }

        await post.save();
        res.status(200).json({ status: 'success', data: { post } });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check permissions
        const isOwner = post.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ message: 'You can only modify your own posts' })
        }
        // Remove post from all users' bookmarks
        try {
            await User.updateMany(
                { bookmarks: post._id },
                { $pull: { bookmarks: post._id } }
            );
        } catch (error) {
            console.error('Error removing post from bookmarks:', error.message);
        }
      
        await post.remove();

        res.json({ message: 'Post deleted successfully' }).status(204);
  } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.updatePostSchedule = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { action, newSchedule } = req.body;

        // Find the post and ensure ownership
        const post = await Post.findOne({
            _id: postId,
            author: req.user.id
        });

        if (!post) {
            res.send('Post not found');
        }

        // Handle different scheduling actions
        switch (action) {
            case 'publish-now':
                post.status = 'published';
                post.publishedAt = new Date();
                post.scheduledPublish = null;
                break;

            case 'reschedule':
                if (!newSchedule) {
                    res.send('New schedule time required');
                }
                const scheduleDate = new Date(newSchedule);
                if (isNaN(scheduleDate.getTime())) {
                    res.send('Invalid schedule date');
                }
                post.scheduledPublish = scheduleDate;
                post.status = scheduleDate > new Date() ? 'scheduled' : 'published';
                break;

            case 'convert-to-draft':
                post.status = 'draft';
                post.scheduledPublish = null;
                break;

            default:
                res.send('Invalid action');
        }

        await post.save();

        res.json({ 
            postId: post._id,
            title: post.title,
            status: post.status,
            scheduledPublish: post.scheduledPublish,
            publishedAt: post.publishedAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating post schedule' });
    }
};
