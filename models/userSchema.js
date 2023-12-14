const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  profileImg: {
    
      type: String,
      required: true,
    
  },
  contact: {
    type: Number,
    required: true,
  },
  
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
});
userSchema.plugin(plm);
module.exports = mongoose.model("users", userSchema);
