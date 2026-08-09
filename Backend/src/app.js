const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require("cors")
const rateLimit = require('express-rate-limit')

const app = express()

// Enable trust proxy to correctly identify client IPs behind reverse proxies (Render/Vercel)
app.set('trust proxy', 1)

const allowedOrigins = [
    "https://intervue-ai-theta.vercel.app",
    "https://intervue-ai-0uk6.onrender.com"
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, true)
        }
    },
    credentials: true
}))

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes."
    }
}))

app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routes/auth.route")
const interviewRouter = require("./routes/interview.route")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err)
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err : {}
    })
})

module.exports = app
