// Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  socialMediaLinks: {
    type: [String],
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);

// MongoDB connection string
const mongoURI =
  "mongodb+srv://boxinga41:GyO6SSdhe2Tavz0P@bidcluster.ttnnn.mongodb.net/?retryWrites=true&w=majority&appName=bidcluster";

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    addCompanies();
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Function to add 10 companies
async function addCompanies() {
  const companies = [
    {
      id: "1",
      companyName: "New York Roofing Experts",
      location: "New Jersey",
      description:
        "Expert roofing services for residential and commercial buildings.",
      email: "office@clearskyservices.co",
      address: "New Jersey",
      socialMediaLinks: [
        "https://twitter.com/roofing1",
        "https://facebook.com/roofing1",
      ],
      category: "roofing",
    },
    {
      id: "2",
      companyName: "LA Affordable Roofing",
      location: "New jersey",
      description: "Affordable and durable roofing solutions.",
      email: "okaforv914@gmail.com",
      address: "New jersey",
      socialMediaLinks: [
        "https://twitter.com/roofing2",
        "https://facebook.com/roofing2",
      ],
      category: "roofing",
    },
  ];

  try {
    // Delete all documents in the collection8n
    // const result = await Company.deleteMany({});
    await Company.insertMany(companies);
    const kj = await Company.find({ category: "roofing" });
    console.log("Companies added successfully");
  } catch (err) {
    console.error("Error adding companies", err);
  } finally {
    mongoose.connection.close();
  }
}
