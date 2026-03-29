const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // password optional (Google users don't have password)
    password: {
      type: String,
      default: null,
    },

    // Google Authentication fields
    googleId: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);