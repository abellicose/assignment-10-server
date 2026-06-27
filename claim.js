require("dotenv").config();
const { client, collections, connectDB } = require("./config/db");

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node claim.js <owner-email>");
    process.exit(1);
  }

  await connectDB();
  const result = await collections.properties.updateMany(
    { seed: true },
    { $set: { ownerEmail: email } }
  );
  console.log(`Reassigned ${result.modifiedCount} seeded properties to ${email}`);

  await client.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
