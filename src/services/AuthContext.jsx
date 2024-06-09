import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken, isUserAuthenticated } from 'src/services/userService';

export const AuthContext = createContext();

export function useAuth(){
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState("");

    useEffect(() => {
        const checkUser = async () => {
            const userObj = await isUserAuthenticated();
            if (userObj) {
                setUser(userObj);
            } else {
                logoutUser();
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    const loginUser = async (token) => {
        try {
            if (token) {
                const userObj = decodeToken(token);
                localStorage.setItem('token', token);
                setUser(userObj);
                return { token, userObj };
            }
            else {
                throw new Error('Token is missing or empty');
            }
        } catch (error) {
            throw error;
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoading, user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};