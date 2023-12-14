const express = require("express");
const router = express.Router();
const userModel = require("../models/userSchema.js");
const postModel = require("../models/postModel.js");
const passport = require("passport");
const upload = require("../multer.js");
const localStrategy = require("passport-local");
const cloudinary = require("cloudinary");
passport.use(new localStrategy(userModel.authenticate()));
router.get("/", (req, res) => {
  res.render("index", {
    nav: req.isAuthenticated(),
    message: req.flash("error"),
  });
});

router
  .route("/register")
  .get((req, res) => {
    res.render("register", {
      nav: req.isAuthenticated(),
      message: req.flash("error"),
    });
  })
  .post(upload.single("profilePic"), async (req, res) => {
    try {
      const { email, password, name, contact, username } = req.body;
      const mycloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "pinterest profile images",
        width: 150,
        crop: "scale",
      });
      userModel.register(
        new userModel({
          username,
          email,
          contact,
          name,
          profileImg: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
          },
        }),
        password,
        (err, user) => {
          if (err) {
            console.log(err);
          }
          passport.authenticate("local")(req, res, () => {
            res.redirect("/profile");
          });
        }
      );
    } catch (error) {
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect("/register");
    }
  });
router.get("/profile", isLoggedIn, async (req, res, next) => {
  const userData = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("profile", { userData, nav: req.isAuthenticated() });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
    failureFlash: true, // Enable flash messages on failure
  }),
  (req, res, next) => {}
);
router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("profilePic"),
  async (req, res) => {
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });
    const inputId = userData.profileImg.public_id;

    await cloudinary.uploader.destroy(inputId);
    const mycloud = await cloudinary.uploader.upload(req.file.path, {
      folder: "pinterest profile images",
      width: 150,
      crop: "scale",
    });

    userData.profileImg = {
      public_id: mycloud.public_id,
      url: mycloud.url,
    };
    await userData.save();
    res.redirect("/profile");
  }
);
router.get("/add", isLoggedIn, (req, res, next) => {
  res.render("add", { nav: req.isAuthenticated() });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("postImage"),
  async (req, res) => {
    const { title, description } = req.body;
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });

    const mycloud = await cloudinary.uploader.upload(req.file.path, {
      folder: "pinterest profile images",
      width: 150,
      crop: "scale",
    });

    const newPost = await postModel.create({
      title,
      description,
      user: userData._id,
      image: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });

    userData.posts.push(newPost._id);
    await userData.save();
    res.redirect("/profile");
  }
);

router.get("/feed", isLoggedIn, async (req, res) => {
  const allPosts = await postModel.find().populate("user");
  res.render("feed", { allPosts, nav: req.isAuthenticated() });
});

router
  .route("/edit")
  .get(isLoggedIn, async (req, res) => {
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });
    res.render("edit", { userData, nav: req.isAuthenticated() });
  })
  .post(isLoggedIn, async (req, res) => {
    const { email, name, contact, username } = req.body;

    let userData = await userModel.findOne({
      username: req.session.passport.user,
    });
    userData.email = email;
    userData.name = name;
    userData.contact = contact;
    userData.username = username;
    await userData.save();

    res.redirect("/profile");
  });

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/");
}
module.exports = router;
