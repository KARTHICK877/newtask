const express = require("express");
const {
  register,
  login,

  generateOTP,
  verifyOTP,
  
} = require("../controller/usercontoler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
