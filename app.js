require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errorMiddleware } = require("./middleware/errorHandler");
const AdExprie = require('./util/node-corn')

const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

AdExprie()

const user = require("./routes/user");
const blog = require("./routes/Blog");
const admin = require("./routes/admin")
const advertisement = require("./routes/advertisement")

app.use(user);
app.use(blog);
app.use(admin);
app.use(advertisement);


app.use(errorMiddleware);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database Connected!");
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
