import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; // 👈 automatically picks correct value

const token = localStorage.getItem('canva_token');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': token ? `Bearer ${token}` : ""
    },
    withCredentials: true
});

export default api;
