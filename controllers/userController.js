const userModel = require("../models/userSchema");
const passport = require("passport");
const cloudinary = require("cloudinary");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

exports.showHomePage = async (req, res) => {
  res.render("index", {
    nav: req.isAuthenticated(),
    message: req.flash("error"),
  });
};

exports.showRegister = async (req, res) => {
  res.render("register", {
    nav: req.isAuthenticated(),
    message: req.flash("error"),
  });
};
exports.registerUser = async (req, res) => {
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
};

exports.logout = async (req, res) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.fileUploadforPic = async (req, res) => {
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
};

exports.goToEditDetailsPage = async (req, res) => {
  const userData = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("edit", { userData, nav: req.isAuthenticated() });
};

exports.editDetails = async (req, res) => {
  const { email, name, contact, username } = req.body;

  const userData = await userModel.findOne({
    username: req.session.passport.user,
  });
  userData.email = email;
  userData.name = name;
  userData.contact = contact;
  userData.username = username;
  // Update the session with the new username
  req.session.passport.user = username;

  // Save changes to the database
  await userData.save();

  // Save the session to ensure changes take effect
  await req.session.save();

 

  res.redirect("/profile");
};
exports.goToProfile = async (req, res, next) => {
  const userData = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("profile", { userData, nav: req.isAuthenticated() });
};
