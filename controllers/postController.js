const postModel=require('../models/postModel')
const userModel=require('../models/userSchema')


exports.showAddPostPage = (req, res) => {
  res.render("add", { nav: req.isAuthenticated() });
};
exports.addPost = async (req, res) => {
  
try {
    const { title, description } = req.body;
    const userData = await userModel.findOne({
      username: req.session.passport.user, 
    }); 
  
 
  
    const newPost = await postModel.create({
      title,
      description,
      user: userData._id,
      image: req.file.filename
    });
  
    userData.posts.push(newPost._id);
    await userData.save();
    res.redirect("/profile");
} catch (error) {
 console.log(error); 
}
};

exports.allFeed = async (req, res) => {
 try {
   const allPosts = await postModel.find().populate("user");
   res.render("feed", { allPosts, nav: req.isAuthenticated() });
 } catch (error) {
  console.log(error);
 }
};
