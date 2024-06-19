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

module.exports.alluser = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
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
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });

    await OTP.create({ email, otp });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_APP_PASS
      }
    });

    await transporter.sendMail({
      from: 'kmass8754@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for verification is: ${otp}`
    });

    res.status(200).send('OTP sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending OTP');
  }
};
module.exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).send('Invalid OTP');
    }

    // OTP is valid, you can proceed with the desired action here
    res.status(200).send('OTP verified successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error verifying OTP');
  }
};



