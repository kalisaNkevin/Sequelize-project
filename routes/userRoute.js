
const express = require("express");
const { login, userProfile, updateUser, logout, protect } = require("../controllers/userController");
const router = express.Router();

router.get("/login", login);
router.get("/profile", protect, userProfile);
router.patch("/profile", protect, updateUser);
router.get("/logout", logout);

module.exports = router;