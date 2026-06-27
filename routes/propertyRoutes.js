const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const {
    search = "",
    type = "",
    sort = "",
    page = "1",
    limit = "9",
    status = "Approved",
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) query.location = { $regex: search, $options: "i" };
  if (type) query.type = type;

  const sortOption = {};
  if (sort === "asc") sortOption.rent = 1;
  else if (sort === "desc") sortOption.rent = -1;
  else sortOption.createdAt = -1;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const total = await collections.properties.countDocuments(query);
  const properties = await collections.properties
    .find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .toArray();

  res.send({ properties, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.get("/featured", async (req, res) => {
  const properties = await collections.properties
    .find({ status: "Approved" })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();
  res.send(properties);
});

router.get("/recent", async (req, res) => {
  const properties = await collections.properties
    .find({ status: "Approved" })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();
  res.send(properties);
});

router.get("/stats", async (req, res) => {
  const totalProperties = await collections.properties.countDocuments({ status: "Approved" });
  const totalUsers = await collections.users.countDocuments();
  const totalBookings = await collections.bookings.countDocuments({ paymentStatus: "paid" });
  const totalOwners = await collections.users.countDocuments({ role: "Owner" });
  res.send({ totalProperties, totalUsers, totalBookings, totalOwners });
});

router.get("/mine", verifyToken, verifyRole("Owner"), async (req, res) => {
  const properties = await collections.properties
    .find({ ownerEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(properties);
});

router.get("/all", verifyToken, verifyRole("Admin"), async (req, res) => {
  const properties = await collections.properties.find().sort({ createdAt: -1 }).toArray();
  res.send(properties);
});

router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: "Invalid id" });
  }
  const property = await collections.properties.findOne({ _id: new ObjectId(req.params.id) });
  if (!property) return res.status(404).send({ message: "Property not found" });
  res.send(property);
});

router.post("/", verifyToken, verifyRole("Owner"), async (req, res) => {
  const property = {
    ...req.body,
    ownerEmail: req.user.email,
    status: "Pending",
    rejectionFeedback: "",
    rent: Number(req.body.rent) || 0,
    createdAt: new Date(),
  };
  const result = await collections.properties.insertOne(property);
  res.send({ _id: result.insertedId, ...property });
});

router.patch("/:id", verifyToken, verifyRole("Owner", "Admin"), async (req, res) => {
  const filter = { _id: new ObjectId(req.params.id) };
  if (req.role === "Owner") filter.ownerEmail = req.user.email;
  const update = { ...req.body };
  delete update._id;
  if (update.rent) update.rent = Number(update.rent);
  await collections.properties.updateOne(filter, { $set: update });
  const updated = await collections.properties.findOne({ _id: new ObjectId(req.params.id) });
  res.send(updated);
});

router.patch("/status/:id", verifyToken, verifyRole("Admin"), async (req, res) => {
  const { status, rejectionFeedback = "" } = req.body;
  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).send({ message: "Invalid status" });
  }
  await collections.properties.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status, rejectionFeedback } }
  );
  res.send({ message: "Status updated", status });
});

router.delete("/:id", verifyToken, verifyRole("Owner", "Admin"), async (req, res) => {
  const filter = { _id: new ObjectId(req.params.id) };
  if (req.role === "Owner") filter.ownerEmail = req.user.email;
  await collections.properties.deleteOne(filter);
  res.send({ message: "Property deleted" });
});

module.exports = router;
