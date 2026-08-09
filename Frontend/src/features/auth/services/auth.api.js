import axios from "axios";

const api=axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})

export async function register({username,email, password}){
    try {
        const response= await api.post(
            "/api/auth/register",
            {
                username,
                email,
                password
            }
        );
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export async function login({email,password}){
    try {
        const response=await api.post(
            "/api/auth/login",
            {
                email,
                password
            }          
        );
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export async function logout(){
    try {
        const response=await api.post("/api/auth/logout");
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export async function getuser(){
    try {
        const response=await api.get("/api/auth/getuser");
        return response.data
    } catch (error) {
        if (error.response?.status !== 401) {
            console.log(error)
        }
        throw error;    
    }
}