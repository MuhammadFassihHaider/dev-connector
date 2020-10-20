const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {

    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ ERROR: "No token found! Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        console.log("Decoded user", decoded);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ ERROR: "Not a valid token!" })
    }
}