const User = require("../model/user");
const bcrypt = require("bcryptjs");
const OTP = require("../model/otp");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports.register = async (req, res) => {
  const { email, name, password, mobileNumber, dateOfBirth } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      email,
      name,
      password: hashedPassword,
      mobileNumber,
      dateOfBirth,
    });
    await user.save();
    res.status(201).send("User registered");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    if (user.isPasswordExpired()) {
      return res.status(400).send("Password expired");
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};



module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).send("Invalid or expired OTP");
    }

    await OTP.deleteOne({ email, otp });

    res.status(200).send("OTP verified successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying OTP");
  }
};

module.exports.generateOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = otpGenerator.generate(6, {
      digits: false,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    await OTP.create({ email, otp });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_APP_PASS,
      },
    });
    await transporter.sendMail({
      from: "kmass8754@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otp}`,
    });

    return res.status(200).send(`OTP sent successfully ${otp}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending OTP");
  }
};

module.exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).send(`Invalid OTP ${otp}`);
    }

    res.status(200).send("OTP verified successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying OTP");
  }
};

module.exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_APP_PASS,
      },
    });
    await transporter.sendMail({
      from: "kmass8754@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${token}`,
    });
    return res.status(200).json({
      status: 200,
      message: `Password reset link sent`,
      data: {
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: `Error sending password reset link`,
      data: [],
    });
  }
};
module.exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({
      status: 200,
      message: "Password reset successfully",
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error resetting password",
      data: {
        error,
      },
    });
  }
};

module.exports.verified = (req, res) => {
  const { token } = req.params;

  jwt.verify(token, "ourSecretKey", function (err, decoded) {
    if (err) {
      console.log(err);
      res
        .status(400)
        .json({
          error:
            "Email verification failed, possibly the link is     invalid or expired",
        });
    } else {
      res.status(200).json({ message: "Email verified successfully" });
    }
  });
};
