const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });
const app = express();
const connectDB = require("./config/connectDB");

app.use("/uploads", express.static(__dirname + "/uploads"));

//CONNECT TO THE DATABASE
connectDB();

// MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use("/users", require("./routes/userRouters"));
app.use("/posts", require("./routes/postRouters"));

const PORT = process.env.PORT;

// RUN THE SERVER
app.listen(PORT, (error) =>
  error ? console.log(error) : console.log(`App listening on port ${PORT}!`)
);
