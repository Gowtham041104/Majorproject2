const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'));
    }
  }
});

// Create a new post
// POST /api/posts
const createPost = [
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = new Post({
      user: req.user._id,
      content,
      image,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  })
];

// Get posts from following users or own posts with pagination
// GET /api/posts?page=<number>&limit=<number>
const getPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const user = req.user;
  const following = user.following;

  const filter = {
    $or: [
      { user: { $in: following } },
      { user: user._id }
    ]
  };

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture'),
    Post.countDocuments(filter)
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    hasMore: skip + items.length < total,
  });
});

// Create a new comment
// POST /api/posts/:id/comments
const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);
  if (post) {
    const comment = {
      user: req.user._id,
      content,
    };
    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: 'Comment Added' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// Get post by ID
// GET /api/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// Get user's posts
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId })
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username');
  res.json(posts);
});

// Delete post
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('You are not authorized to delete this post');
    }
    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post removed' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// Like a post
// POST /api/posts/:id/like
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const userId = req.user._id.toString();
  const alreadyLiked = post.likes?.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    return res.json({ message: 'Already liked', likes: post.likes.length });
  }
  post.likes = post.likes || [];
  post.likes.push(req.user._id);
  await post.save();
  res.json({ message: 'Liked', likes: post.likes.length });
});

// Unlike a post
// POST /api/posts/:id/unlike
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const userId = req.user._id.toString();
  const before = post.likes?.length || 0;
  post.likes = (post.likes || []).filter((id) => id.toString() !== userId);
  await post.save();
  const after = post.likes.length;
  res.json({ message: before !== after ? 'Unliked' : 'Not liked', likes: post.likes.length });
});

module.exports = {
  createPost,
  getPosts,
  createComment,
  getPostById,
  getUserPosts,
  deletePost,
  likePost,
  unlikePost
};
