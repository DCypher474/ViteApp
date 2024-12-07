import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MessagePopup from './MessagePopup';

const Login = () => {
    const navigate = useNavigate();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });
            
            const { token, user } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            // First show success popup and wait
            setShowSuccessPopup(true);
            setIsLoading(false);

            // Delay the storage and navigation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Store data
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify(user));
            
            // Navigate
            const redirectUrl = localStorage.getItem('redirectUrl') || '/';
            localStorage.removeItem('redirectUrl');
            navigate(redirectUrl);
            
        } catch (error) {
            setIsLoading(false);
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {showSuccessPopup && (
                <MessagePopup
                    type="success"
                    message="Login successful!"
                    onClose={() => setShowSuccessPopup(false)}
                />
            )}
        </div>
    );
};

export default Login; 