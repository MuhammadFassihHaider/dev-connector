const express = require("express");
const router = express.Router();
const config = require("config");
const request = require("request");
const auth = require("../../middleware/auth");
const Users = require("../../models/Users");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");

//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)

//GET PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user!" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//CREATE & UPDATE PROFILE
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    // creating an empty object that will be populated after verifying if the data exists.
    // this object is then used for creating a new profile or updating a profile if the profile exists
    const profileFields = {};

    // taking the data that the user sends and de-structuring it
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // we get the id from the request
    profileFields.user = req.user.id;
    // populating the object if the data exists
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // skill is sent as comma seperated values. The values are split along the comma and if there is any blank space around the skill, it is removed and then stored in the object as a string array e.g ["PHP", "Python", "Java"].
    // check skill in the profile model
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // the social links are objects of social in the model. Without initializing, it will give the error: cannot set value of undefined.
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // UPDATE
        // https://docs.mongodb.com/manual/reference/operator/update/set/#up._S_set
        // Behaviour: If the field does not exist, $set will add a new field with the specified value, provided that the new field does not violate a type constraint.
        // findOneAndUpdate updates the documents according to the query applied and returns the document as it was before the update.
        // in order to return the updated document, add the new parameter as true
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // NEW PROFILE
      profile = new Profile(profileFields);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
       res.status(500).send({ Error: "Server Error" });
    }
  }
);

// GET ALL PROFILES
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"]);

    res.json(profile);
  } catch (error) {
    console.error(error.message);
     res.status(500).json({ error: error.array() });
  }
});

// GET PROFILE THROUGHT USER ID
router.get("/profile/:user_id", async (req, res) => {
  const profile = await Profile.findOne({
    user: req.params.user_id,
  }).populate("user", ["name", "avatar"]);

  if (!profile)
    return res.status(400).json({ error: "Profile does not exist" });
  res.json(profile);
});

// DELETE PROFILE, USER & POSTS
router.delete("/", auth, async (req, res) => {
  try {
    //TODO Find the difference between findOneAndRemove & findOneAndDelete
    await Profile.findOneAndRemove({ user: req.user.id });
    await Users.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User Removed" });
  } catch (error) {
    console.error(error.message);
     res.status(500).json({ error: error.array() });
  }
});

// ADD EXPERIENCE
router.post(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ Error: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // setting values of the destructured variables to the variables in the object. We are going to update the data using the newExperience object
    // title: title is same as title,
    // this is because the variables that we are destructuring and the variables in the newExperience have the same name
    const newExperience = {
      title: title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.push(newExperience);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error.message);
       res.status(500).json({ error: error.array() });
    }
  }
);

// DELETE EXPERIENCE THOUGHT ID
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const expIndex = profile.experience.map((item) => {
      // it takes the id of the current item in the iteration.
      //It then sees if the id matches with the parameter of the indexOf.
      //If it does, it returns the index, otherwise, it continues to loop through all the experiences
      return item.id.indexOf(req.params.exp_id);
    });

    // splice(index, howmany)
    // where index = index of the item to be removed
    // howmany = the number of items that are to be removed. 0 means no item will be removed
    profile.experience.splice(expIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
     res.status(500).json({ error: error.array() });
  }
});

// ADD EDUCATION
router.post(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ Error: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    // setting values of the destructured variables to the variables in the object. We are going to update the data using the newEducation object
    // title: title is same as title,
    // this is because the variables that we are destructuring and the variables in the newEducation have the same name
    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.push(newEducation);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error.message);
       res.status(500).json({ error: error.array() });
    }
  }
);

// DELETE EDUCATION THOUGHT ID
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const eduIndex = profile.education.map((item) => {
      // it takes the id of the current item in the iteration.
      //It then sees if the id matches with the parameter of the indexOf.
      //If it does, it returns the index, otherwise, it continues to loop through all the education values
      return item.id.indexOf(req.params.edu_id);
    });

    // splice(index, howmany)
    // where index = index of the item to be removed
    // howmany = the number of items that are to be removed. 0 means no item will be removed
    profile.education.splice(eduIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
     res.status(500).json({ error: error.array() });
  }
});

//GITHUB
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error.message);
      
      if (response.statusCode !== 200) {
       return res.status(404).json({ msg: "No Github profile found" });
      }
      
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
     res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;
