const express = require("express");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

router.put("/", async (req, res) => {
  const { email, name, photo } = req.body;
  if (!email) return res.status(400).send({ message: "Email is required" });

  const existing = await collections.users.findOne({ email });
  if (existing) {
    await collections.users.updateOne(
      { email },
      { $set: { name, photo, lastLogin: new Date() } }
    );
    return res.send({ ...existing, name, photo });
  }

  const user = {
    email,
    name,
    photo: photo || "",
    role: "Tenant",
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  const result = await collections.users.insertOne(user);
  res.send({ _id: result.insertedId, ...user });
});

router.get("/me", verifyToken, async (req, res) => {
  const user = await collections.users.findOne({ email: req.user.email });
  res.send(user || {});
});

router.patch("/profile", verifyToken, async (req, res) => {
  const { name, photo } = req.body;
  await collections.users.updateOne(
    { email: req.user.email },
    { $set: { name, photo } }
  );
  const updated = await collections.users.findOne({ email: req.user.email });
  res.send(updated);
});

router.get("/", verifyToken, verifyRole("Admin"), async (req, res) => {
  const users = await collections.users.find().sort({ createdAt: -1 }).toArray();
  res.send(users);
});

router.patch("/role/:id", verifyToken, verifyRole("Admin"), async (req, res) => {
  const { ObjectId } = require("mongodb");
  const { role } = req.body;
  if (!["Tenant", "Owner", "Admin"].includes(role)) {
    return res.status(400).send({ message: "Invalid role" });
  }
  await collections.users.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role } }
  );
  res.send({ message: "Role updated", role });
});

module.exports = router;
