const express=require("express")
const authmiddleware = require("../middlewares/auth.middleware")
const interviewcontroller=require("../controller/interview.controller")
const upload= require("../middlewares/pdf.middleware")

const interviewRouter= express.Router()

/**
 * @route POST/api/interview
 * @description generate new interview report on the basis of user selfdescription, resume pdf and jobdescription
 * @access private
 */

const multer = require("multer")

/**
 * Wraps multer upload to catch file validation errors (wrong type, size exceeded)
 * and return a proper 400 response instead of silently dropping req.file.
 */
function handleResumeUpload(req, res, next) {
    upload.single("resume")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // e.g. LIMIT_FILE_SIZE
            return res.status(400).json({ message: `File upload error: ${err.message}` })
        } else if (err) {
            // e.g. "Only PDF files are allowed"
            return res.status(400).json({ message: err.message })
        }
        next()
    })
}

interviewRouter.post("/", authmiddleware.authuser, handleResumeUpload, interviewcontroller.generateInterViewReportController)

/**
 * @route GET/api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @access private
 */

interviewRouter.get("/report/:interviewId",authmiddleware.authuser,interviewcontroller.getInterviewReportByIdController)

/**
 * @route GET/api/interview
 * @description get all the reports of the user
 * @access private
 */

interviewRouter.get("/",authmiddleware.authuser,interviewcontroller.getAllInterviewReportsController)


/**
 * @route POST/api/interview/resume/pdf/:interviewId
 * @description generate new resume pdf of a specific interview on the basis of user selfdescription, resume pdf and jobdescription
 * @access private
 */

interviewRouter.post("/resume/pdf/:interviewId",authmiddleware.authuser,interviewcontroller.generateResumePdfController)






module.exports=interviewRouter