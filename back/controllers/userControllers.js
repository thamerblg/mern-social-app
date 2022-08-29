const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER A NEW USER IN THE DATABASE
const signUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(400)
        .send({ email: { msg: "User is already exist with this email !" } });
    }
    const newUser = new User({ ...req.body });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(newUser.password, salt);
    newUser.password = hashedPassword;
    await newUser.save();
    //newUser.password = undefined;
    res.status(200).send({ user: newUser });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// GET ALL USERS FROM DATABASE
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};
// GET ALL USERS EXEPT THE LOGER ONE FROM DATABASE
const getusersExeptLoged = async (req, res) => {
  try {
    const usersExeptLoger = await User.find({
      _id: { $nin: req.user._id },
    }).select("username email picture followers requestSent requestReceived");
    res.status(200).send(usersExeptLoger);
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// GET ONE USER FROM ID
const getUser = async (req, res) => {
  try {
    const oneUser = await User.findOne({ _id: req.params.id }).select(
      "-password"
    );
    res.status(200).send(oneUser);
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// DELETE ONE USER FROM DATABASE
const deleteUser = async (req, res) => {
  try {
    const match = await bcrypt.compare(req.body.password, req.user.password);
    if (!match) {
      return res
        .status(400)
        .send({ password: { msg: "Incorrect password !" } });
    }
    const resultOfDelete = await User.deleteOne({ _id: req.user._id });
    if (!resultOfDelete.deletedCount) {
      return res.status(500).send({ msg: "User already deleted" });
    }
    res.status(200).send({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// UPDATE ONE USER
const updateUser = async (req, res) => {
  try {
    const resultOfUpdate = await User.updateOne(
      { _id: req.params.id },
      { $set: { ...req.body } }
    );
    if (!resultOfUpdate.modifiedCount) {
      return res.status(500).send({ msg: "No infos to update" });
    }
    res.status(200).send({ msg: "User updated successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// FOLLOW A USER
const followUser = async (req, res) => {
  try {
    // ADD TO THE FOLLOWER LIST
    const result1 = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { following: req.body.idToFollow } }
    );
    // ADD TO THE FOLLOWING LIST
    const result2 = await User.updateOne(
      { _id: req.body.idToFollow },
      { $addToSet: { followers: req.user._id } }
    );
    if (!result1.modifiedCount || !result2.modifiedCount) {
      return res.status(400).send({ msg: "No follow has been updated" });
    }
    res.status(201).send({ msg: "follow added successfully" });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// UNFOLLOW USER
const unFollowUser = async (req, res) => {
  try {
    // DELETE FROM THE FOLLOWER LIST
    const result1 = await User.updateOne(
      { _id: req.user._id },
      { $pull: { following: req.body.idToUnFollow } }
    );

    // DELETE FROM THE FOLLOWING LIST
    const result2 = await User.updateOne(
      { _id: req.body.idToUnFollow },
      { $pull: { followers: req.user._id } }
    );
    if (!result1.modifiedCount || !result2.modifiedCount) {
      return res.status(500).send({ msg: "No unFollow has been updated" });
    }
    res.status(201).send({ msg: "unFollow added successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// LOGIN USER
const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(400)
        .send({ email: { msg: "There is no user with this email !" } });
    }
    const match = await bcrypt.compare(password, existUser.password);
    if (!match) {
      return res
        .status(400)
        .send({ password: { msg: "Incorrect password !" } });
    }

    const payload = { _id: existUser._id };
    const token = await jwt.sign(payload, process.env.TOKEN_SECRET);
    existUser.password = undefined;
    res.status(200).send({ existUser, token });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// GET CURRENT USER
const currentUser = async (req, res) => {
  res.send(req.user);
};

// LOGOUT USER
const logout = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// UPLOAD USER PICTURE
const updateProfilPicture = async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}`;
  const { file } = req;
  try {
    const uploadPic = await User.updateOne(
      { _id: req.user._id },
      { $set: { picture: `${url}/${file.path}` } }
    );
    if (!uploadPic.modifiedCount) {
      return res
        .status(500)
        .send({ msg: "Error while uploading profil picture" });
    }
    res.status(200).send({ msg: "Profil picture updated successfully" });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

const getRandomUsers = async (req, res) => {
  try {
    const users = await User.find({
      $and: [{ _id: { $ne: req.user._id }, followers: { $ne: req.user._id } }],
    })
      .limit(3)
      .select("_id username picture followers");
    //.find({$match: { followers: { $ne: req.user._id } }}).aggregate([{ $sample: { size: 3 } }]);
    res.status(200).send(users);
  } catch (error) {
    return res.status(500).send(error);
  }
};

// SEND REQUEST TO A NEW USER
const sendRequest = async (req, res) => {
  try {
    // TEST IF THE REQUEST IS ALREADY SENT TO THE USER SELECTED

    // ADD TO THE REQUEST_SENT LIST
    const sendARequest = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { requestSent: req.body.idToAdd } }
    );
    // ADD TO THE REQUEST_RECIVED LIST
    const receiveARequest = await User.updateOne(
      { _id: req.body.idToAdd },
      {
        $addToSet: {
          requestReceived: {
            userId: req.user._id,
            userUsername: req.user.username,
            userPicture: req.user.picture,
          },
        },
      }
    );
    if (!sendARequest.modifiedCount || !receiveARequest.modifiedCount) {
      return res.status(400).send({ msg: "No request has been sent" });
    }
    res.status(201).send({ msg: "Request sent successfully" });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// IGNORE REQUEST
const ignoreRequest = async (req, res) => {
  try {
    // DELETE FROM THE REQUEST_SENT LIST
    const result1 = await User.updateOne(
      { _id: req.user._id },
      { $pull: { requestSent: req.body.idToRemove } }
    );

    // DELETE FROM THE REQUEST_RECIVED LIST
    const result2 = await User.updateOne(
      { _id: req.body.idToRemove },
      { $pull: { requestReceived: { _id: req.body.requestId } } }
    );
    if (!result1.modifiedCount || !result2.modifiedCount) {
      return res.status(500).send({ msg: "No request has been removed" });
    }
    res.status(201).send({ msg: "Request removed successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// ACCEPT REQUEST
const acceptRequest = async (req, res) => {
  try {
    // ADD TO THE FRIEND LIST TO THE CURRENT USER COMPTE
    const pushFriend1 = await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: {
          friends: {
            friendId: req.body.idNewFriend,
            friendUsername: req.body.username,
            friendPicture: req.body.picture,
          },
        },
      }
    );

    // ADD TO THE FRIEND LIST TO THE REQUEST_SENDER USER COMPTE
    const pushFriend2 = await User.updateOne(
      { _id: req.body.idNewFriend },
      {
        $addToSet: {
          friends: {
            friendId: req.user._id,
            friendUsername: req.user.username,
            friendPicture: req.user.picture,
          },
        },
      }
    );

    // DELETE FROM THE REQUEST_SENT LIST IN THE OBJECT USER WHO SENT THE REQUEST
    const reqSent = await User.updateOne(
      { _id: req.body.idNewFriend },
      { $pull: { requestSent: req.user._id } }
    );

    // DELETE FROM THE REQUEST_RECIVED LIST
    const reqReceived = await User.updateOne(
      { _id: req.user._id },
      { $pull: { requestReceived: { _id: req.body.idToRemove } } }
    );

    if (
      !reqSent.modifiedCount ||
      !reqReceived.modifiedCount ||
      !pushFriend1.modifiedCount ||
      !pushFriend2.modifiedCount
    ) {
      return res.status(500).send({ msg: "No request has been added" });
    }
    res.status(201).send({ msg: "This friend added successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    // DELETE FROM THE REQUEST_SENT LIST IN THE OBJECT USER WHO SENT THE REQUEST
    const reqSent = await User.updateOne(
      { _id: req.body.idNewFriend },
      { $pull: { requestSent: req.user._id } }
    );
    // DELETE FROM THE REQUEST_RECIVED LIST
    const reqReceived = await User.updateOne(
      { _id: req.user._id },
      { $pull: { requestReceived: { _id: req.body.idToRemove } } }
    );
    if (!reqSent.modifiedCount || !reqReceived.modifiedCount) {
      return res
        .status(500)
        .send({ msg: "No friend request has been deleted" });
    }
    res
      .status(201)
      .send({ msg: "This friend request has been deleted successfully" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

module.exports = {
  signUp,
  currentUser,
  getAllUsers,
  getusersExeptLoged,
  getUser,
  deleteUser,
  updateUser,
  followUser,
  unFollowUser,
  signIn,
  logout,
  updateProfilPicture,
  getRandomUsers,
  sendRequest,
  ignoreRequest,
  acceptRequest,
  deleteRequest,
  //0113 224 2121.
};
