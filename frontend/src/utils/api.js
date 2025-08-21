import axios from 'axios';

// Get the API URL from your frontend's .env file.
// This is the correct and modern approach for live deployment.
const API_URL = import.meta.env.VITE_API_URL;

// Retrieve the authentication token from local storage.
const token = localStorage.getItem('canva_token');

// Create an instance of Axios with a base URL and default headers.
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': token ? `Bearer ${token}` : ""
    },
    withCredentials: true
});

// Export the configured Axios instance for use in other files.
export default api;
