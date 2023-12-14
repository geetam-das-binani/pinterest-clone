const express = require("express");
const router = express.Router();
const upload = require("../multer.js");
const passport=require('passport')
const {
  showHomePage,
  showRegister,
  registerUser,
  logout,
  fileUploadforPic,
  goToEditDetailsPage,
  editDetails,
  goToProfile,
} = require("../controllers/userController");

router.get("/", showHomePage);
router.get("/profile", isLoggedIn, goToProfile);
router.get("/logout", logout);
router
  .route("/register")
  .get(showRegister)
  .post(upload.single("profilePic"), registerUser);

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("profilePic"),

  fileUploadforPic
);

router.route("/edit").get(isLoggedIn, goToEditDetailsPage);
router.route("/editDetails").post(isLoggedIn, editDetails);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
    failureFlash: true, // Enable flash messages on failure
  }),
  (req, res, next) => {}
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
 
  return res.redirect("/");
}
module.exports = router;
