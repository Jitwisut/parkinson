import { useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '../lib/api';
import { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (idToken: string) => Promise<void>;
  register: (data: { firebaseUid: string; email: string; role: string; patientId?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.verify(idToken);
      const userData: User = {
        userId: result.userId,
        role: result.role as User['role'],
        patientId: result.patientId,
      };
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: { firebaseUid: string; email: string; role: string; patientId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.register(data);
      const userData: User = {
        userId: result.userId,
        role: result.role as User['role'],
        patientId: data.patientId,
        email: data.email,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
