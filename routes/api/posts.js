const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Users = require("../../models/Users");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const router = express.Router();

//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)

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

module.exports = router;
