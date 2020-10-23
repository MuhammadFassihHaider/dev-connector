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
      console.error(error.message);
      return res.status(400).json({ Error: error.array() });
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
      console.error(error.message);
      res.status(500).json("Server Error");
    }
  }
);

// GET ALL POSTS
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find();
    return res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ Error: "Server Error" });
  }
});

// GET POST BY ID
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    return res.json(post);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(401).json({ msg: "Not authorized!" });
    }
    res.status(500).send({ Error: "Server Error" });
  }
});

// DELETE POST BY ID

// This is fine but the problem here is that anyone will be able to delete the post even if we do not give the option to do that in our front end. Someone could use postman to delete any post.

// router.delete("/:id", auth, async (req, res) => {
//   try {
//     await Post.findOneAndRemove({ _id: req.params.id });
//     res.json({ msg: "Deleted" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ Error: "Server Error" });
//   }
// });

// Traversy's method
router.delete("/:id", auth, async (req, res) => {
  try {
    //Get the post
    const post = await Post.findOne({ _id: req.params.id });

    //Check whether the post exists or not
    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }

    // the post.id has the type: Object while req.body.id has type: String
    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized!" });
    }

    await post.remove();
    res.json({ msg: "Deleted" });
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(401).json({ msg: "Not authorized!" });
    }
    res.status(500).json({ Error: "Server Error" });
  }
});

// LIKE A POST
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    // from the likes, take each like.
    // take the user in like, convert it to string and see if it is equal to the id of the user that sent the like request.
    // see if the length of the number of likes from the user that is sending the request is greater than 0 i.e the has the user liked the post or not!
    // if so, send a bad request
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      console.error("Post already liked");
      return res.status(400).json({ msg: "Post already liked!" });
    }

    // otherwise add a like from the user by adding the userid in the post like object
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// UNLIKE A POST
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    // same as like but instead, we are seeing if the post has been liked before. If so, we are sending back a bad request
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not been liked yet!" });
    }

    // otherwise, we are mapping through all the likes. We are converting the user_ids of the like to string and we are seeing if the processed user_id(toString) matches with the user_id of the user that sent the unlike request.
    // If so, we are getting back the index
    const removeLikeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    // We are again taking the whole likes object for that particular post and we are splicing at splice(index of item to be removed, and removing only one item)
    post.likes.splice(removeLikeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ADD A COMMENT
router.post(
  "/comment/:id",
  [auth, [check("text", "Cannot empty comment").not().isEmpty()]],
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      console.error(error.message);
      return res.status(400).json({ Error: error.array() });
    }

    try {
      // check the model for the user. Here, the id is _id. When we were accessing the profile using the id, we wrote it as ({user: req.user.id}) because of the model for Profile
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password"
      );
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server Error");
    }
  }
);

// DELETE A COMMENT
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ Error: "Comment not found!" });
    }

    if (req.user.id !== comment.user.toString()) {
      return res.status(401).json({ Error: "Not Authorized!" });
    }

    const removeCommentIndex = post.comments
      .map((comment) => comment._id.toString() )
      .indexOf(req.params.comment_id);

    post.comments.splice(removeCommentIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server Error");
  }
});
module.exports = router;
