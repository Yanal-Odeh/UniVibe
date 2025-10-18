import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

// Authorized admins
const AUTHORIZED_ADMINS = [
  {
    id: 1,
    email: 'yanal@univibe.edu',
    password: 'yanal1234', // In production, this should be hashed
    name: 'Yanal Oudeh',
    role: 'Super Admin'
  },
  {
    id: 2,
    email: 'younis@univibe.edu',
    password: 'younis1234', // In production, this should be hashed
    name: 'Younis Masri',
    role: 'Admin'
  }
];

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in (from localStorage)
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (storedAdmin) {
      setCurrentAdmin(JSON.parse(storedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const admin = AUTHORIZED_ADMINS.find(
      a => a.email === email && a.password === password
    );

    if (admin) {
      const adminData = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      };
      setCurrentAdmin(adminData);
      localStorage.setItem('currentAdmin', JSON.stringify(adminData));
      return { success: true, admin: adminData };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('currentAdmin');
  };

  const value = {
    currentAdmin,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
