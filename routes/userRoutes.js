const express = require("express");
const {
  register,
  login,
  alluser,
  requestPasswordReset,
  resetPassword,
generateOTP,
verifyOTP
  
} = require("../controller/usercontoler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/alluser", alluser);
router.post('/generate-otp', generateOTP);
router.post('/verify-otp', verifyOTP);
router.post('/request-password-reset',requestPasswordReset);
router.post('/reset-password',resetPassword);
module.exports = router;
