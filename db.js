const mongoose = require("mongoose");

const DataBase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB not connected");
  }
};

module.exports = DataBase;
