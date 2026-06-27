const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/jwt", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }
  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  res.send({ token });
});

module.exports = router;
