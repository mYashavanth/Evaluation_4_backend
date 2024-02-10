const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const DataBase = require("./db");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      "*",
      `http://localhost:${PORT}`,
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

// Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  try {
    res.status(200).json({ msg: "Welcome to Social Media App" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  try {
    res.status(404).json({ msg: "404 page not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  try {
    await DataBase();
    console.log(`server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.log({ error: error.message });
  }
});
