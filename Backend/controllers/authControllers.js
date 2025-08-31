const User = require('../models/users');
const generateToken = require('../utils/generateToken');
const { generateSecret, verifyToken } = require('../utils/twoFactorAuth');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExistsEmail = await User.findOne({ email });
    const userExistsUsername = await User.findOne({ username });
    
    if (userExistsEmail || userExistsUsername) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    
    const user = await User.create({
      username,
      email,
      password,
    });
    
    res.status(201).json({
      _id: user._id,  // ✅ Fixed: was *id: user.*id
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      secret: user.twoFactorAuth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      if (user.twoFactorAuth) {
        if (verifyToken(user.twoFactorAuthSecret, token)) {
          return res.json({
            _id: user._id,  // ✅ Fixed: was *id: user.*id
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            secret: user.twoFactorAuth,
          });
        } else {
          return res.status(401).json({ message: "Invalid 2FA token" });
        }
      }
      
      // If 2FA is not enabled
      res.json({
        _id: user._id,  // ✅ Fixed: was *id: user.*id
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        secret: user.twoFactorAuth,
      });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enableTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const secret = generateSecret();
    user.twoFactorAuth = true;
    user.twoFactorAuthSecret = secret.base32;
    await user.save();
    
    res.json({
      message: "Two-factor authentication is enabled",
      secret: secret.otpauth_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};