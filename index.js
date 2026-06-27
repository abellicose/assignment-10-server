require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/properties", require("./routes/propertyRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/favorites", require("./routes/favoriteRoutes"));
app.use("/payments", require("./routes/paymentRoutes"));

app.get("/", (req, res) => {
  res.send({ status: "ok", service: "Property Rental API" });
});

app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: "Internal server error" });
});

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });
