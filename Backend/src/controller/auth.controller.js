const userModel = require("../models/user.model")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const blacklistModel = require("../models/blacklist.model")

// Standard cookie configuration based on environment
const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production"
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}

/**
 * @name registerusercontroller
 * @description register new user
 * @access public
 */
async function registerusercontroller(req, res) {
    const { username, email, password } = req.body
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const cleanEmail = email.trim().toLowerCase()
        const cleanUsername = username.trim()

        const isUserAlreadyExist = await userModel.findOne({
            $or: [{ email: cleanEmail }, { username: cleanUsername }]
        })

        if (isUserAlreadyExist) {
            return res.status(400).json({ message: "User or email already exists" })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username: cleanUsername,
            email: cleanEmail,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error in registerusercontroller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name loginusercontroller
 * @description login user
 * @access public
 */
async function loginusercontroller(req, res) {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const cleanEmail = email.trim().toLowerCase()
        const user = await userModel.findOne({ email: cleanEmail })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error in loginusercontroller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name logoutusercontroller
 * @description logout user
 * @access public
 */
async function logoutusercontroller(req, res) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]
        if (token) {
            await blacklistModel.create({ token })
            res.clearCookie("token", getCookieOptions())
        }
        res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        console.error("Error in logoutusercontroller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name getusercontroller
 * @description get user profile
 * @access private
 */
async function getusercontroller(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error in getusercontroller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    registerusercontroller,
    loginusercontroller,
    logoutusercontroller,
    getusercontroller
}
