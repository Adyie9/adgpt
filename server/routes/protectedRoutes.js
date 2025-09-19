// backend/routes/protectedRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, you are authorized 🚀` });
});

module.exports = router;
