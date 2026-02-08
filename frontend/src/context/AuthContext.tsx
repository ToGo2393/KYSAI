import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'editor';

interface User {
    username: string;
    role: UserRole;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem('kysai_user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });

    // Remove useEffect since we initialized lazily


    const login = (username: string, role: UserRole) => {
        const newUser = {
            username,
            role,
            name: username === 'admin' ? 'Quality Manager' : 'Process Engineer',
            email: username === 'admin' ? 'admin@kysai.com' : 'engineer@kysai.com'
        };
        setUser(newUser);
        localStorage.setItem('kysai_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('kysai_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
