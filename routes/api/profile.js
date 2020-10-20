const express = require("express")
const router = express.Router()
//router allows us to store the routes in different files so the code does not become cluttered. We use these routes in the server.js file using the express.use (app.use functions)
router.get('/', (req, res)=>res.send("Profile"))

module.exports = router