import { jwtDecode } from 'jwt-decode';
import apiClient from 'src/utils/apiClient';

export const getToken = () => {
    return localStorage.getItem('token') || null;
};

export const decodeToken = (token) => {
    return jwtDecode(token);
};

export const isUserAuthenticated = async () => {
    const token = getToken();
    if (!token) {
        return false;
    }
    try {
        const response = await apiClient.post('token/verify', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status !== 200) {
            return false;
        }
        return decodeToken(token);
    } catch (error) {
        return false;
    }
};
