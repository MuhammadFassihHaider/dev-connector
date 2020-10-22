const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)
router.get("/", auth, async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
  }
});

//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)
router.post(
  "/",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //findOne finds against the given parameter and returns either the matching document in the DB or null if it finds nothing. It is a promise
      //https://docs.mongodb.com/drivers/node/fundamentals/crud/read-operations/retrieve#find
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const secret = config.get("jwtSecret");

      jwt.sign(payload, secret, (error, token) => {
        //you can only send one response back to the client
        if (error) throw error;
        res.json({ token });
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
