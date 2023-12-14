const postModel=require('../models/postModel')
const userModel=require('../models/userSchema')
const cloudinary=require('cloudinary')

exports.showAddPostPage = (req, res) => {
  res.render("add", { nav: req.isAuthenticated() });
};
exports.addPost = async (req, res) => {
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
};

exports.allFeed = async (req, res) => {
  const allPosts = await postModel.find().populate("user");
  res.render("feed", { allPosts, nav: req.isAuthenticated() });
};
