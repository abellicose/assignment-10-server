require("dotenv").config();
const { client, collections, connectDB } = require("./config/db");

const ownerEmail = "owner@nestify.demo";

const properties = [
  {
    title: "Sunlit Downtown Loft",
    location: "New York",
    type: "Apartment",
    rent: 2400, rentType: "Monthly", bedrooms: 2, bathrooms: 2, size: "1100",
    description: "A bright open-plan loft in the heart of downtown with floor-to-ceiling windows, modern finishes and a private balcony.",
    amenities: ["WiFi", "Parking", "Gym", "Elevator"],
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Coastal Villa Retreat",
    location: "Miami",
    type: "Villa",
    rent: 5200, rentType: "Monthly", bedrooms: 4, bathrooms: 3, size: "2600",
    description: "Luxurious beachfront villa with a private pool, sun deck and panoramic ocean views. Perfect for families.",
    amenities: ["Pool", "WiFi", "Parking", "Air Conditioning"],
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Cozy Studio Near Campus",
    location: "Chicago",
    type: "Studio",
    rent: 950, rentType: "Monthly", bedrooms: 1, bathrooms: 1, size: "480",
    description: "Efficient and affordable studio within walking distance of the university, cafes and public transit.",
    amenities: ["WiFi", "Heating", "Laundry"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Modern Family House",
    location: "Los Angeles",
    type: "House",
    rent: 3800, rentType: "Monthly", bedrooms: 3, bathrooms: 2, size: "1900",
    description: "Spacious family home with a landscaped backyard, two-car garage and a fully equipped modern kitchen.",
    amenities: ["Garden", "Parking", "WiFi", "Fireplace"],
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Skyline Condo with View",
    location: "New York",
    type: "Condo",
    rent: 3100, rentType: "Monthly", bedrooms: 2, bathrooms: 2, size: "1250",
    description: "High-rise condo offering breathtaking skyline views, concierge service and a rooftop lounge.",
    amenities: ["Concierge", "Gym", "Rooftop", "WiFi"],
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Charming Garden Apartment",
    location: "Chicago",
    type: "Apartment",
    rent: 1650, rentType: "Monthly", bedrooms: 2, bathrooms: 1, size: "900",
    description: "Quiet ground-floor apartment with private garden access, hardwood floors and plenty of natural light.",
    amenities: ["Garden", "WiFi", "Heating", "Pet Friendly"],
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Lakeside Weekend Cabin",
    location: "Miami",
    type: "House",
    rent: 220, rentType: "Daily", bedrooms: 2, bathrooms: 1, size: "780",
    description: "Rustic-modern cabin steps from the lake. Ideal for short getaways with a fire pit and kayak access.",
    amenities: ["Lake Access", "WiFi", "Fire Pit", "Parking"],
    images: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=70"],
  },
  {
    title: "Penthouse Suite Deluxe",
    location: "Los Angeles",
    type: "Condo",
    rent: 6800, rentType: "Monthly", bedrooms: 3, bathrooms: 3, size: "2400",
    description: "Top-floor penthouse with private elevator, wraparound terrace, and premium designer interiors.",
    amenities: ["Private Elevator", "Terrace", "Gym", "Pool", "WiFi"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=70"],
  },
];

const reviews = [
  { tenantName: "Amelia Carter", tenantEmail: "amelia@example.com", rating: 5, comment: "Smooth booking and a beautiful place. Highly recommend Nestify!" },
  { tenantName: "Daniel Osei", tenantEmail: "daniel@example.com", rating: 5, comment: "Transparent pricing and verified owners. Felt safe the whole way." },
  { tenantName: "Priya Nair", tenantEmail: "priya@example.com", rating: 4, comment: "Great selection and the favorites feature made comparing easy." },
  { tenantName: "Marco Rossi", tenantEmail: "marco@example.com", rating: 5, comment: "The dashboard analytics are fantastic as an owner." },
];

async function run() {
  await connectDB();

  await collections.properties.deleteMany({ seed: true });
  const docs = properties.map((p) => ({
    ...p,
    ownerEmail,
    status: "Approved",
    rejectionFeedback: "",
    seed: true,
    createdAt: new Date(),
  }));
  const res = await collections.properties.insertMany(docs);
  const ids = Object.values(res.insertedIds);

  await collections.reviews.deleteMany({ seed: true });
  await collections.reviews.insertMany(
    reviews.map((r, i) => ({
      ...r,
      propertyId: ids[i % ids.length].toString(),
      seed: true,
      date: new Date(),
    }))
  );

  await collections.users.updateOne(
    { email: ownerEmail },
    { $set: { email: ownerEmail, name: "Demo Owner", role: "Owner", photo: "", seed: true, createdAt: new Date() } },
    { upsert: true }
  );

  console.log(`Seeded ${docs.length} properties and ${reviews.length} reviews.`);
  await client.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
