import axios from '@/lib/axios'

export const loginUser = async (credential) => {
    try {
        const res = axios.post('/api/auth', credential);
        return res.data;
    } catch (error) {
        console.log(`Error During Authentication ${error}`)
    }
}


export const registerUser = async (credential) => {
    try {
        const res = axios.post('/api/auth', credential);
        return res.data;
    } catch (error) {
        console.log(`Error During Authentication ${error}`)
    }
}



export const logOut = async () => {
    try {
        const res = axios.post('/api/logout');
        res.data;
    } catch (error) {
        console.log(`Error During logout ${error}`)
    }
}