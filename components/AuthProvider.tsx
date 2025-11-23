'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const result = await response.json();
      setIsAuthenticated(result.authenticated);

      // Redirect to login if not authenticated and not on login page
      if (!result.authenticated && pathname !== '/login') {
        router.push('/login');
      }
      // Redirect to admin if authenticated and on login page
      if (result.authenticated && pathname === '/login') {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

