const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowerCase: true, trim: true },
    password: { type: String, required: true, trim: true },
    bio: { type: String },
    address: { type: String },
    followers: [String],
    following: [String],
    likes: { type: [] },
    picture: {
      type: String,
      required: true,
      default: "http://localhost:5000/uploads/users/default_profil_picture.jpg",
    },
    coverPicture: {
      type: String,
      required: true,
      default: "http://localhost:5000/uploads/users/default_cover_picture.png",
    },
    requestSent: { type: [String] },
    requestReceived: {
      type: [{ userId: String, userUsername: String, userPicture: String }],
    },
    friends: {
      type: [
        { friendId: String, friendUsername: String, friendPicture: String },
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
