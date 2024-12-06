const handleLogin = async (credentials) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        const { token, user } = response.data;
        
        if (!token) {
            throw new Error('No token received from server');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('Login successful, token stored:', token);
        
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');
        
        navigate(redirectUrl);
    } catch (error) {
        console.error('Login error:', error);
        // Handle login error (show message to user)
    }
}; 