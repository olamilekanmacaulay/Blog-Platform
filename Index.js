const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./Routes/user.route");
const blogRoute = require("./Routes/blog.route");
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
        console.log("Something went wrong");
    });

app.use(userRoute);
app.use(blogRoute);
app.use(commentRoute);

app.listen(PORT, () => {
        console.log("App is running");
    });
