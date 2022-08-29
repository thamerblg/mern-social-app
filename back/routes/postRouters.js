const express = require("express");
const {
  readPost,
  readUserPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
  commentPost,
  editCommentPost,
  deleteCommentPost,
  sharePost,
  hidePost,
  savePost,
  deleteSavedPost,
  readUserSavedPosts,
} = require("../controllers/postControllers");
const router = express.Router();
const upload = require("../utils/multer");
const isAuth = require("../middelwears/passport");

// REQUEST FOR POST CONFIG
router.get("/all", readPost); // DONE IN FRONTEND
router.get("/userPost/:id", readUserPosts); // DONE IN FRONTEND
router.post("/add", upload("posts").single("file"), isAuth(), createPost); // DONE IN FRONTEND
router.put("/:id", updatePost);
router.delete("/:id", deletePost); // DONE IN FRONTEND

router.patch("/hide-post/:id", isAuth(), hidePost); // DONE IN FRONTEND
router.patch("/save-post/:id", isAuth(), savePost); // DONE IN FRONTEND
router.patch("/delete-saved-post/:id", isAuth(), deleteSavedPost); // DONE IN FRONTEND
router.get("/user-saved-post", isAuth(), readUserSavedPosts); // DONE IN FRONTEND

// REQUEST FOR LIKE/DISLIKE POST
router.patch("/like-post/:id", isAuth(), likePost); // DONE IN FRONTEND
router.patch("/dislike-post/:id", isAuth(), dislikePost); // DONE IN FRONTEND

// REQUEST FOR COMMENT-POST CONFIG
router.patch("/comment-post/:id", isAuth(), commentPost); // DONE IN FRONTENTD
router.patch("/edit-comment-post/:id", editCommentPost); // DONE IN FRONTENTD
router.patch("/delete-comment-post/:id", deleteCommentPost); // DONE IN FRONTENTD

// REQUEST FOR PARTAGE POST
router.post("/sharePost/:id", isAuth(), sharePost);

module.exports = router;
