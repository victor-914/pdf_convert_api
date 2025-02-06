const mongoose = require("mongoose");

// Define Mongoose schema and model for past contracts
const pastLinkSchema = new mongoose.Schema({
  contractLink: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});
const Link = mongoose.model("Links", pastLinkSchema);

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://boxinga41:ApgEv5YjA7PKVB9R@bidcluster.ttnnn.mongodb.net/?retryWrites=true&w=majority&appName=bidcluster",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => {
  console.log("Connected to MongoDB");
  // Call the function to save contract IDs after successful connection
  saveContractIds(contractData);
})
.catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

// Array of contract IDs
const contractData = [
  "https://sam.gov/opp/deb7640840344b3f90f8fce9a52fa726/view",
  "https://sam.gov/opp/6d45294e09314847bcd2313163b025a8/view",
  "https://sam.gov/opp/ef245ba3f58340d5bd79f100d683e39c/view",
  "https://sam.gov/opp/84dd211bd7a146df8bdb1d058c2e2d8b/view",
  "https://sam.gov/opp/d418af84a21c465fb548357bd957cb91/view",
  "https://sam.gov/opp/9ae4d0766889452ab328c30afcd2aa7f/view",
  "https://sam.gov/opp/602a9f9c106942119efb9953b1488c0f/view",
  "https://sam.gov/opp/4e6e623af7e64c0990e04e79a5ec695d/view",
  "https://sam.gov/opp/1e5b52e556cc475aadb3084529edc057/view",
  "https://sam.gov/opp/255ae0f314dc48f1ba1cffa8b395ab0f/view",
  "https://sam.gov/opp/cf4e99911423441cb6ab1590443d9061/view",
  "https://sam.gov/opp/efc03a481c1e46f1b6c4b4af43aa530d/view",
  "https://sam.gov/opp/e6352ef29e6b427a8a092c5c5db3293f/view",
];

// Function to save contract IDs to MongoDB
const saveContractIds = async (contractData) => {
  try {
    // Loop through the array and save each contract ID
    for (const item of contractData) {
      console.log("🚀 ~ saveContractIds ~ item:", item);

      if (!item) return;

      const newContract = new Link({ contractLink: item }); // Corrected this line
      await newContract.save();
      console.log(`Saved contractId: ${item}`);
    }

    console.log("All contract IDs processed.");
  } catch (error) {
    console.error("Error saving contract IDs:", error);
  }
};