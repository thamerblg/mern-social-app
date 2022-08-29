const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    message: { type: String, trim: true },
    picture: { type: String },
    video: String,
    likers: { type: [], required: true },
    comments: {
      type: [
        {
          commenterId: String,
          commenterUsername: String,
          commenterPicture: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
    sharedFrom: { type: [], required: true },
    shares: { type: [], required: true },
    hideFor: { type: [] },
    savedFor: { type: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
