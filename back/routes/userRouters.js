const express = require("express");
const router = express.Router();
const {
  signUp,
  getAllUsers,
  getusersExeptLoged,
  getUser,
  deleteUser,
  updateUser,
  followUser,
  unFollowUser,
  signIn,
  currentUser,
  logout,
  updateProfilPicture,
  getRandomUsers,
  sendRequest,
  ignoreRequest,
  acceptRequest,
  deleteRequest,
} = require("../controllers/userControllers");
const {
  registerRules,
  validator,
  loginRules,
} = require("../middelwears/validators");
const upload = require("../utils/multer");
const isAuth = require("../middelwears/passport");

// REQUEST FOR USER-AUTH
router.post("/register", registerRules(), validator, signUp); //DONE IN FRONTEND
router.post("/login", loginRules(), validator, signIn); //DONE IN FRONTEND
router.get("/current", isAuth(), currentUser); //DONE IN FRONTEND
router.post("/logout", logout); //DONE IN FRONTEND

// GIVE ME 3 RANDOM USERS
router.get("/random", isAuth(), getRandomUsers); //DONE IN FRONTEND

// REQUEST FOR USER-CONFIG
router.get("/allUsers", getAllUsers);
router.get("/usersExeptLoged", isAuth(), getusersExeptLoged); //DONE IN FRONTEND
router.get("/:id", getUser); //DONE IN FRONTEND
router.delete("/delete-user", isAuth(), deleteUser); //DONE IN FRONTEND
router.put("/:id", updateUser);
router.patch("/follow", isAuth(), followUser); //DONE IN FRONTEND
router.patch("/unfollow", isAuth(), unFollowUser); //DONE IN FRONTEND

// REQUEST FOR USER-COMPTE-CONFIG
router.post(
  "/updateProfPic",
  upload("users").single("file"),
  isAuth(),
  updateProfilPicture
);

router.patch("/send-request", isAuth(), sendRequest); //DONE IN FRONTEND
router.patch("/remove-request", isAuth(), ignoreRequest); //DONE IN FRONTEND
router.patch("/accept-request", isAuth(), acceptRequest); //DONE IN FRONTEND
router.patch("/delete-request", isAuth(), deleteRequest); //DONE IN FRONTEND

module.exports = router;
