const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "user" }
  },
  { timestamps: true }
);


module.exports = model("User", UserSchema);
