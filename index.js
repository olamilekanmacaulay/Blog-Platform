const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./Routes/user.route");
const postRoute = require("./Routes/post.route");
const commentRoute = require('./Routes/comment.route');



dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.error("Database  connection error:", err.message);
    });

app.use(userRoute);
app.use(postRoute);
app.use(commentRoute);

app.listen(PORT, () => {
        console.log("App is running");
    });
