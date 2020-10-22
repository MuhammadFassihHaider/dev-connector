const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Users = require("../../models/Users");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const router = express.Router();

//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)

// CREATE A POST
router.post(
  "/",
  [auth, [check("text", "Cannot empty comment").not().isEmpty()]],
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      console.error(error);
      return res.server(400).json({ Error: error.array() });
    }

    try {
      // check the model for the user. Here, the id is _id. When we were accessing the profile using the id, we wrote it as ({user: req.user.id}) because of the model for Profile
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password"
      );

      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = new Post(newPost);
      await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.server(500).json("Server Error");
    }
  }
);

// GET ALL POSTS
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find();
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.server(500).json({ Error: "Server Error" });
  }
});

// GET POST BY ID
router.get("/:getPost_id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.getPost_id });
    if (!post) {
      return res.server(404).json({ msg: "Post not found" });
    }
    return res.json(post);
  } catch (error) {
    console.error(error);

    if (error.kind === "ObjectId") {
      return res.server(401).json({ msg: "Not authorized!" });
    }
    return res.server(500).send({ Error: "Server Error" });
  }
});

// DELETE POST BY ID

// This is fine but the problem here is that anyone will be able to delete the post even if we do not give the option to do that in our front end. Someone could use postman to delete any post.

// router.delete("/:del_id", auth, async (req, res) => {
//   try {
//     await Post.findOneAndRemove({ _id: req.params.del_id });
//     res.json({ msg: "Deleted" });
//   } catch (error) {
//     console.error(error);
//     return res.server(500).json({ Error: "Server Error" });
//   }
// });

// Traversy's method
router.delete("/:del_id", auth, async (req, res) => {
  try {
    //Get the post
    const post = await Post.findOne({ _id: req.params.del_id });

    //Check whether the post exists or not
    if (!post) {
      return res.server(404).json({ msg: "Post not found!" });
    }

    // the post.id has the type: Object while req.body.id has type: String
    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.server(401).json({ msg: "Not authorized!" });
    }

    await post.remove();
    res.json({ msg: "Deleted" });
  } catch (error) {
    console.error(error);

    if (error.kind === "ObjectId") {
      return res.server(401).json({ msg: "Not authorized!" });
    }
    return res.server(500).json({ Error: "Server Error" });
  }
});

module.exports = router;
