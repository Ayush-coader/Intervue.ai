import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})

export const generateInterviewReport = async ({resumeFile,jobDescription,selfDescription})=>{
    const formData= new FormData()
    // Only append resume if it's a valid file — never append undefined
    if (resumeFile instanceof File || resumeFile instanceof Blob) {
        formData.append("resume", resumeFile)
    }
    formData.append("jobDescription",jobDescription)
    formData.append("selfDescription",selfDescription)
    const response= await api.post("/api/interview",formData)
    return response.data
}

export const getInterviewReportById = async (_id)=>{
    const response = await api.get(`/api/interview/report/${_id}`)
    return response.data
}

export const getAllInterviewReport = async ()=>{
    const response = await api.get(`/api/interview`)
    return response.data
}

export const generateInterviewPdf = async({interviewId})=>{
    const response = await api.post(`/api/interview/resume/pdf/${interviewId}`,null,{
        responseType:"blob"
    })
    return response.data
}
