const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const reviews = await collections.reviews
    .find({ rating: { $gte: 4 } })
    .sort({ date: -1 })
    .limit(4)
    .toArray();
  res.send(reviews);
});

router.get("/property/:propertyId", async (req, res) => {
  const reviews = await collections.reviews
    .find({ propertyId: req.params.propertyId })
    .sort({ date: -1 })
    .toArray();
  res.send(reviews);
});

router.post("/", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const { propertyId, rating, comment } = req.body;
  if (!propertyId || !rating) {
    return res.status(400).send({ message: "propertyId and rating are required" });
  }
  const review = {
    propertyId,
    tenantName: req.body.tenantName || "",
    tenantEmail: req.user.email,
    rating: Number(rating),
    comment: comment || "",
    date: new Date(),
  };
  const result = await collections.reviews.insertOne(review);
  res.send({ _id: result.insertedId, ...review });
});

router.delete("/:id", verifyToken, async (req, res) => {
  await collections.reviews.deleteOne({
    _id: new ObjectId(req.params.id),
    tenantEmail: req.user.email,
  });
  res.send({ message: "Review deleted" });
});

module.exports = router;
