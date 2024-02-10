const express = require("express");
const User = require("../models/user.modle");
const userRoutes = express.Router();
const bcrypt = require("bcrypt");
const validate = require("validator");
const jwt = require("jsonwebtoken");

userRoutes.post("/register", async (req, res) => {
  try {
    const { name, email, gender, password } = req.body;
    const isStrongPassword = validate.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    });
    if (!isStrongPassword) {
      throw new Error("Please enter a strong password");
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const user = new User({
          name,
          email,
          gender,
          password: hash,
        });
        await user
          .save()
          .then(() => {
            res.status(200).json({ msg: "User registered successfully" });
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        res.status(500).json({ msg: err.message });
      } else {
        const authToken = jwt.sign(
          { userID: user._id },
          process.env.AUTH_TOKEN,
          {
            expiresIn: "1h",
          }
        );
        const refreshToken = jwt.sign(
          { userID: user._id },
          process.env.REFRESH_TOKEN,
          {
            expiresIn: "7d",
          }
        );
        res.cookie("authToken", authToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          sameSite: "none",
          secure: true,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
          sameSite: "none",
          secure: true,
        });
        res
          .status(200)
          .json({ msg: "Login successful", user, authToken, refreshToken });
      }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = userRoutes;
