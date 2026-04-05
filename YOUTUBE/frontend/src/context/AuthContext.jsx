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
            
            // FIX: Bulletproof data extraction
            const userData = res.data?.data?.user || res.data?.data || res.data;
            
            if (userData && Object.keys(userData).length > 0) {
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