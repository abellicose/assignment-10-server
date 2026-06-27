const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  process.env.DB_URI ||
  (process.env.DB_CLUSTER
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0`
    : null);

if (!uri) {
  throw new Error(
    "Missing MongoDB connection. Set DB_URI to your full Atlas connection string, or set DB_CLUSTER (with DB_USER and DB_PASS)."
  );
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("propertyRental");

const collections = {
  users: db.collection("users"),
  properties: db.collection("properties"),
  bookings: db.collection("bookings"),
  reviews: db.collection("reviews"),
  favorites: db.collection("favorites"),
  payments: db.collection("payments"),
};

async function connectDB() {
  await client.connect();
  await db.command({ ping: 1 });
  console.log("Connected to MongoDB");
}

module.exports = { client, db, collections, connectDB };
