import axios from 'axios';

const instance = axios.create(
    {
        baseURL:process.env.BACKEND_URL,
        withCredentials:true //For Cookies
    }
);

export default instance;