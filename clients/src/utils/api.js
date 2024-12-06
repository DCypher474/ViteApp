import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log outgoing requests
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        // Log detailed error information
        console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.log('Unauthorized access detected, clearing token');
            localStorage.removeItem('token');
            // You might want to redirect to login page here
        }
        return Promise.reject(error);
    }
);

export default api;