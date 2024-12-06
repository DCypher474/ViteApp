const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    
    // Study endpoints
    STUDY_SESSIONS: `${API_BASE_URL}/study`,
    
    // Goals endpoints
    GOALS: `${API_BASE_URL}/goals`,
    
    // Reminders endpoints
    REMINDERS: `${API_BASE_URL}/reminders`,
    
    // Analytics endpoints
    ANALYTICS: {
        STUDY_STATS: `${API_BASE_URL}/analytics/study-stats`,
        DAILY_PROGRESS: `${API_BASE_URL}/analytics/daily-progress`
    }
};

export const createApiClient = (token = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['x-auth-token'] = token;
    }

    const handleResponse = async (response) => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        return data;
    };

    return {
        get: async (url) => {
            const response = await fetch(url, { headers });
            return handleResponse(response);
        },
        
        post: async (url, body) => {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },
        
        put: async (url, body) => {
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },
        
        patch: async (url, body) => {
            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },
        
        delete: async (url) => {
            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });
            return handleResponse(response);
        }
    };
};
