const express = require("express");
const router = express.Router();
const upload = require("../multer.js");
const {
  showAddPostPage,
  allFeed,
  addPost,
} = require("../controllers/postController.js");

router.get("/add", isLoggedIn, showAddPostPage);

router.get("/feed", isLoggedIn, allFeed);

router.post("/createpost", isLoggedIn, upload.single("postImage"), addPost);



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/");
}
module.exports = router;
