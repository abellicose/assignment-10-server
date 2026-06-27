const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const { propertyId } = req.body;
  if (!ObjectId.isValid(propertyId)) {
    return res.status(400).send({ message: "Invalid property id" });
  }
  const property = await collections.properties.findOne({ _id: new ObjectId(propertyId) });
  if (!property) return res.status(404).send({ message: "Property not found" });

  const booking = {
    propertyId,
    propertyTitle: property.title,
    propertyImage: property.images?.[0] || "",
    ownerEmail: property.ownerEmail,
    tenantEmail: req.user.email,
    tenantName: req.body.tenantName || "",
    moveInDate: req.body.moveInDate,
    contact: req.body.contact,
    notes: req.body.notes || "",
    amount: property.rent,
    bookingStatus: "Pending",
    paymentStatus: "unpaid",
    transactionId: "",
    createdAt: new Date(),
  };
  const result = await collections.bookings.insertOne(booking);
  res.send({ _id: result.insertedId, ...booking });
});

router.get("/mine", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const bookings = await collections.bookings
    .find({ tenantEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(bookings);
});

router.get("/requests", verifyToken, verifyRole("Owner"), async (req, res) => {
  const bookings = await collections.bookings
    .find({ ownerEmail: req.user.email, paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(bookings);
});

router.get("/all", verifyToken, verifyRole("Admin"), async (req, res) => {
  const bookings = await collections.bookings.find().sort({ createdAt: -1 }).toArray();
  res.send(bookings);
});

router.get("/:id", verifyToken, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: "Invalid id" });
  }
  const booking = await collections.bookings.findOne({ _id: new ObjectId(req.params.id) });
  if (!booking) return res.status(404).send({ message: "Booking not found" });
  res.send(booking);
});

router.patch("/status/:id", verifyToken, verifyRole("Owner"), async (req, res) => {
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).send({ message: "Invalid status" });
  }
  await collections.bookings.updateOne(
    { _id: new ObjectId(req.params.id), ownerEmail: req.user.email },
    { $set: { bookingStatus: status } }
  );
  res.send({ message: "Booking status updated", status });
});

module.exports = router;
