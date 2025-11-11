const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");

const PORT = process.env.PORT || 5000;

dotenv.config();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Madrasha Deen server open ");
});

app.listen(PORT, () => {
  console.log(`Madarasha Deen Server Running ${PORT}`);
});
