import { createContext, useContext, useState, useEffect } from 'react';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                if (decodedUser.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser(decodedUser);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    }, []);

    // Login function saves token and user info in state
    const login = (userData, token) => {
        setUser(userData);
        if (token) localStorage.setItem('token', token);
    };

    // Logout clears user and token
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
