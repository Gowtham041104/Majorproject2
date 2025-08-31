const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  createComment,
  getPostById,
  getUserPosts,
  deletePost,
  likePost,
  unlikePost,
} = require('../controllers/postController');
const router = express.Router();

// "api/posts/"
router.route('/').post(protect, createPost).get(protect, getPosts);
router.route('/:id').get(protect, getPostById).delete(protect, deletePost);
router.route('/:id/like').post(protect, likePost);
router.route('/:id/unlike').post(protect, unlikePost);
router.route('/:id/comments').post(protect, createComment);
router.route('/user/:userId').get(protect, getUserPosts);

module.exports = router;