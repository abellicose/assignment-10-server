const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const favorites = await collections.favorites
    .find({ tenantEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(favorites);
});

router.post("/", verifyToken, verifyRole("Tenant"), async (req, res) => {
  const { propertyId } = req.body;
  if (!ObjectId.isValid(propertyId)) {
    return res.status(400).send({ message: "Invalid property id" });
  }
  const exists = await collections.favorites.findOne({
    propertyId,
    tenantEmail: req.user.email,
  });
  if (exists) return res.status(409).send({ message: "Already in favorites" });

  const property = await collections.properties.findOne({ _id: new ObjectId(propertyId) });
  if (!property) return res.status(404).send({ message: "Property not found" });

  const favorite = {
    propertyId,
    tenantEmail: req.user.email,
    propertyTitle: property.title,
    propertyImage: property.images?.[0] || "",
    location: property.location,
    rent: property.rent,
    rentType: property.rentType,
    createdAt: new Date(),
  };
  const result = await collections.favorites.insertOne(favorite);
  res.send({ _id: result.insertedId, ...favorite });
});

router.delete("/:id", verifyToken, verifyRole("Tenant"), async (req, res) => {
  await collections.favorites.deleteOne({
    _id: new ObjectId(req.params.id),
    tenantEmail: req.user.email,
  });
  res.send({ message: "Removed from favorites" });
});

module.exports = router;
