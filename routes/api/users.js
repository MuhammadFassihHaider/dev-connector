const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'Password needs to be atleast 6 characters long').isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    console.log(req.body)
    res.send("Users")
})

module.exports = router