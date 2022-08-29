const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    text: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);
