const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-intent", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const { amount } = req.body;
  const value = Math.round(Number(amount) * 100);
  if (!value || value < 50) {
    return res.status(400).send({ message: "Invalid amount" });
  }
  const intent = await stripe.paymentIntents.create({
    amount: value,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({ clientSecret: intent.client_secret });
});

router.post("/confirm", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const { bookingId, transactionId } = req.body;
  if (!ObjectId.isValid(bookingId)) {
    return res.status(400).send({ message: "Invalid booking id" });
  }
  const booking = await collections.bookings.findOne({ _id: new ObjectId(bookingId) });
  if (!booking) return res.status(404).send({ message: "Booking not found" });

  await collections.bookings.updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { paymentStatus: "paid", transactionId, paidAt: new Date() } }
  );

  const payment = {
    bookingId,
    transactionId,
    propertyTitle: booking.propertyTitle,
    tenantEmail: booking.tenantEmail,
    tenantName: booking.tenantName,
    ownerEmail: booking.ownerEmail,
    amount: booking.amount,
    date: new Date(),
  };
  await collections.payments.insertOne(payment);
  res.send({ message: "Payment confirmed", transactionId });
});

router.get("/transactions", verifyToken, verifyRole("Admin"), async (req, res) => {
  const payments = await collections.payments.find().sort({ date: -1 }).toArray();
  res.send(payments);
});

router.get("/owner-stats", verifyToken, verifyRole("Owner"), async (req, res) => {
  const email = req.user.email;
  const payments = await collections.payments.find({ ownerEmail: email }).toArray();
  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalProperties = await collections.properties.countDocuments({ ownerEmail: email });
  const totalBookings = await collections.bookings.countDocuments({
    ownerEmail: email,
    paymentStatus: "paid",
  });

  const months = [];
  const base = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      earnings: 0,
    });
  }
  for (const p of payments) {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.earnings += p.amount || 0;
  }

  res.send({
    totalEarnings,
    totalProperties,
    totalBookings,
    monthly: months.map(({ label, earnings }) => ({ month: label, earnings })),
  });
});

module.exports = router;
