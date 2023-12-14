const userModel = require("../models/userSchema");
const passport = require("passport");
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
    console.log(req.file);
    userModel.register(
      new userModel({
        username,
        email,
        contact,
        name,
        profileImg: req.file.filename,
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
  try {
    req.logOut((_) => {
      res.redirect("/");
    });
  } catch (err) {
    res.redirect("/profile");
  }
};

exports.fileUploadforPic = async (req, res) => {
  try {
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });

    userData.profileImg = req.file.filename;
    await userData.save();
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};

exports.goToEditDetailsPage = async (req, res) => {
  try {
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });
    res.render("edit", { userData, nav: req.isAuthenticated() });
  } catch (error) {
    console.log(error);
  }
};

exports.editDetails = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};
exports.goToProfile = async (req, res, next) => {
  try {
    const userData = await userModel
      .findOne({
        username: req.session.passport.user,
      })
      .populate("posts");

    res.render("profile", { userData, nav: req.isAuthenticated() });
  } catch (error) {
    console.log(error);
  }
};
