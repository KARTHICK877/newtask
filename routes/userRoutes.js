const express = require("express");
const {
  register,
  login,
  generateOTP,
  verifyOTP,
  requestPasswordReset,
  resetPassword,
  
} = require("../controller/usercontoler");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);
router.post('/request-password-reset',requestPasswordReset);
router.post('/reset-password',resetPassword);
module.exports = router;
