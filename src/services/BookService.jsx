import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';

export const getBooks = async () => {
    const response = await apiClient.get('books', {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return response.data;
}

export const getCategories = async () => {
    const response = await apiClient.get('category', {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return response.data;
}
