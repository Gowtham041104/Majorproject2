const express = require('express');
const { signup, login, enableTwoFactorAuth } = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/enable-2fa", protect, enableTwoFactorAuth);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;