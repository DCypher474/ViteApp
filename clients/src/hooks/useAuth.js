import { useState, useEffect } from 'react';
import { API_ENDPOINTS, createApiClient } from '../config/api';

export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (email, password) => {
        const apiClient = createApiClient();
        try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
                email,
                password
            });
            setToken(response.token);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (fullName, email, password) => {
        const apiClient = createApiClient();
        try {
            const response = await apiClient.post(API_ENDPOINTS.REGISTER, {
                fullName,
                email,
                password
            });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return {
        token,
        user,
        loading,
        login,
        register,
        logout
    };
};
