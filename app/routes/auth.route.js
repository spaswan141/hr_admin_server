const express = require("express");
const router = express.Router();
const controller=require("../controllers/auth")
// Register
router.post("/register", controller.registerUser);

// Login
router.post("/login", controller.loginUser);

module.exports = router;