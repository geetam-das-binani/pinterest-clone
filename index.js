require("dotenv").config();
const connectToDb = require("./connection/database.js");
const express = require("express");
const userRouter = require("./routes/userRoutes.js");
const postRouter = require("./routes/postRoutes.js");
const passport = require("passport");
const session = require("express-session");
const Usermodel=require('./models/userSchema.js')
const flash=require('connect-flash')
const app = express();
const cloudinary = require("cloudinary").v2;
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(express.static("./dist"));
app.set("view engine", "ejs");
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
  })
);
app.use(passport.initialize());

app.use(passport.session());

// Use connect-flash for flash messages
app.use(flash());

passport.serializeUser(Usermodel.serializeUser())
passport.deserializeUser(Usermodel.deserializeUser())

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use("/", userRouter);
app.use("/", postRouter);
// app.use("/", userRouter);

connectToDb()
  .then((_) => {
    console.log("Connected To Database Successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((e) => console.log(e));
