require("dotenv").config();
const { client, collections, connectDB } = require("./config/db");

async function run() {
  const email = process.argv[2];
  const role = process.argv[3] || "Admin";

  if (!email || !["Tenant", "Owner", "Admin"].includes(role)) {
    console.log("Usage: node promote.js <email> <Tenant|Owner|Admin>");
    process.exit(1);
  }

  await connectDB();
  const result = await collections.users.updateOne(
    { email },
    { $set: { role } }
  );

  if (result.matchedCount === 0) {
    console.log(`No user found with email ${email}. Register/login once in the app first.`);
  } else {
    console.log(`Updated ${email} -> ${role}`);
  }

  await client.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
