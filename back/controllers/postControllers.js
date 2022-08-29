const User = require("../models/User");
const Post = require("../models/Post");

// VIEW ALL POSTS
const readPost = async (req, res) => {
  try {
    const allPosts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username picture" });
    //.populate("user", "username", "picture");
    res.status(200).send(allPosts);
  } catch (error) {
    res.status(400).send(error);
  }
};

// VIEW POSTS BY USER
const readUserPosts = async (req, res) => {
  try {
    const userPosts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate({ path: "user" });

    return res.status(200).send(userPosts);
  } catch (error) {
    res.status(400).send(error);
  }
};

// CREATE A NEW POST
const createPost = async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}`;
  const { file } = req;
  try {
    if (file == null) {
      const newPostMsg = new Post({
        message: req.body.message,
        user: req.user._id,
      });
      await newPostMsg.save();
      return res.status(200).send({ msg: "Post added without picture" });
    }
    const newPost = new Post({ ...req.body, user: req.user._id });
    newPost.picture = `${url}/${file.path}`;
    await newPost.save();
    res.status(200).send({ msg: "Post added" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// UPDATE A POST
const updatePost = async (req, res) => {
  //const { message } = req.body;
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.id },
      { $set: { message: req.body.message } }
    );
    if (!updatedPost.modifiedCount) {
      return res.status(500).send({ msg: "No infos to update" });
    }
    res.status(200).send({ msg: "Post updated successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// DELETE A POST
const deletePost = async (req, res) => {
  try {
    const resultOfDelete = await Post.deleteOne({ _id: req.params.id });
    if (!resultOfDelete.deletedCount) {
      return res.status(500).send({ msg: "Post unfounded" });
    }
    res.status(200).send({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// LIKE A POST
const likePost = async (req, res) => {
  try {
    // ADD A LIKE TO THE TABLE "likers" OF POST
    const result1 = await Post.updateOne(
      { _id: req.params.id },
      {
        $addToSet: {
          likers: { id: req.user._id, username: req.user.username },
        },
      }
    );
    // ADD A LIKE TO THE TABLE "likes" OF USER
    const result2 = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { likes: { id: req.params.id } } }
    );
    if (!result1.modifiedCount || !result2.modifiedCount) {
      return res.status(400).send({ msg: "No likes has been addded" });
    }
    res.status(201).send({ msg: "like added successfully" });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// DISLIKE A POST
const dislikePost = async (req, res) => {
  try {
    // MAKE A DISLIKE TO THE TABLE "likers" OF POST
    const result1 = await Post.updateOne(
      { _id: req.params.id },
      { $pull: { likers: { id: req.user._id } } }
    );
    // MAKE A DISLIKE TO THE TABLE "likes" OF USER
    const result2 = await User.updateOne(
      { _id: req.user._id },
      { $pull: { likes: { id: req.params.id } } }
    );
    if (!result1.modifiedCount || !result2.modifiedCount) {
      return res.status(400).send({ msg: "No dislikes has been addded" });
    }
    res.status(201).send({ msg: "Dislike added successfully" });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// ADD A COMMENT TO THE POST
const commentPost = async (req, res) => {
  try {
    const newComment = await Post.updateOne(
      { _id: req.params.id },
      {
        $push: {
          comments: {
            commenterId: req.user._id,
            commenterUsername: req.user.username,
            commenterPicture: req.user.picture,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      }
    );
    if (!newComment.modifiedCount) {
      return res.status(400).send({ msg: "No comment has been addded" });
    }
    res.status(201).send({ msg: "comment added successfully" });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// EDIT A COMMENT TO THE POST
const editCommentPost = async (req, res) => {
  try {
    return Post.findById(req.params.id, (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );

      if (!theComment)
        return res.status(404).send({ msg: "Comment not found" });
      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send({ msg: err.message });
  }
};

// DELETE A COMMENT FROM THE POST
const deleteCommentPost = async (req, res) => {
  try {
    const pullComment = await Post.updateOne(
      { _id: req.params.id },
      { $pull: { comments: { _id: req.body.commentId } } }
    );
    if (!pullComment.modifiedCount) {
      return res.status(400).send({ msg: "No comment has been deleted" });
    }
    res.status(201).send({ msg: "there is a comment deleted successfully" });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// SHARE A POST
const sharePost = async (req, res) => {
  const { message, picture, ownerId, ownerUsername } = req.body;
  try {
    // ADD THE NEW POST SHARED
    const newPost = new Post({
      message,
      picture,
      user: req.user._id,
      sharedFrom: {
        post: { id: req.params.id },
        owner: { ownerId, ownerUsername },
      },
    });
    const sharedFrom = await newPost.save();

    // ADD THE ID OF USER WHO SHARE THE POST IN TABLE SHARES OF THE ORIGINAL POST
    const shares = await Post.updateOne(
      { _id: req.params.id },
      { $push: { shares: { sharedId: req.user._id } } }
    );
    if (!sharedFrom.modifiedCount || !shares.modifiedCount) {
      return res.status(400).send({ msg: "No share has been addded" });
    }
    res.status(200).send({ msg: "Post added" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// HIDE A POST FOR A USER
const hidePost = async (req, res) => {
  try {
    const addHide = await Post.updateOne(
      { _id: req.params.id },
      { $push: { hideFor: { userId: req.user._id } } }
    );

    if (!addHide.modifiedCount) {
      return res.status(400).send({ msg: "There is no post to hide" });
    }
    res.status(201).send({ msg: "Post hide successfully" });
  } catch (error) {
    //console.log(error);
    res.send(error);
  }
};

// SAVE A POST
const savePost = async (req, res) => {
  try {
    const registerPost = await Post.updateOne(
      { _id: req.params.id },
      { $push: { savedFor: req.user._id } }
    );

    if (!registerPost.modifiedCount) {
      return res.status(400).send({ msg: "There is no post to be saved" });
    }
    res.status(201).send({ msg: "Post saved successfully" });
  } catch (error) {
    res.send(error);
  }
};

// DELETE A SAVED POST
const deleteSavedPost = async (req, res) => {
  try {
    const delRegPost = await Post.updateOne(
      { _id: req.params.id },
      { $pull: { savedFor: req.user._id } }
    );

    if (!delRegPost.modifiedCount) {
      return res
        .status(400)
        .send({ msg: "There is no post to be deleted from registrations" });
    }
    res.status(201).send({ msg: "A saved post deleted successfully" });
  } catch (error) {
    res.send(error);
  }
};

// VIEW SAVED POSTS BY USER
const readUserSavedPosts = async (req, res) => {
  try {
    const userSavedPosts = await Post.find({
      savedFor: { $in: req.user._id },
    })
      .sort({ createdAt: -1 })
      .populate({ path: "user" });

    return res.status(200).send(userSavedPosts);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = {
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
};
