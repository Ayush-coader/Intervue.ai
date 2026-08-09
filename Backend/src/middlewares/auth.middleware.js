const jwt = require('jsonwebtoken')
const blacklistModel = require("../models/blacklist.model")

async function authuser(req, res, next) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ message: "Token not provided" })
        }

        const istokenblacklisted = await blacklistModel.findOne({ token })
        if (istokenblacklisted) {
            return res.status(401).json({ message: "Token is invalid" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: "Token is invalid or expired" })
    }
}

module.exports = { authuser }