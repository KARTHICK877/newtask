const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  passwordChangedAt: { type: Date, default: Date.now },

});




userSchema.methods.isPasswordExpired = function () {
  const now = new Date();
  const passwordAge = (now - this.passwordChangedAt) / (1000 * 60 * 60 * 24); //90 days
  return passwordAge > 90;
};

userSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, email: this.email };
  return jwt.sign(payload, process.env.JWTSECRET, { expiresIn: "1h" });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
