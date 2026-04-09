import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkLoggedIn = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/current-user');
            // Extract user object regardless of how backend nests it 
            const userData = res.data?.data?.user || res.data?.data || res.data;
            
            if (userData && (userData._id || userData.id)) {
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);