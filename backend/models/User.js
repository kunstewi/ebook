const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlegth: 6,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    isPro: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Password Hashing Middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) {
  }
});
