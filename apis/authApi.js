import axios from '@/lib/axios';

const baseURI = `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth`;
console.log("Auth base URI:", baseURI);

export const registerUser = async (credential) => {
  try {
    const res = await axios.post(`${baseURI}/register`, credential, {
      headers: {
        'Content-Type': 'multipart/form-data', // if you're uploading files
      },
    });
    return res; // Includes status, data, headers, etc.
  } catch (error) {
    console.error("❌ Error During Registration:", error.response?.data || error.message);
    throw error;
  }
};
// Login User
export const loginUser = async (credential) => {
  try {
    const res = await axios.post(`${baseURI}/login`, credential);
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("Error During Login:", error.response?.data || error.message);
    throw error;
  }
};

// Logout User
export const logOut = async () => {
  try {
    const res = await axios.post('/api/logout');
    return res.data;
  } catch (error) {
    console.error("Error During Logout:", error.response?.data || error.message);
    throw error;
  }
};
