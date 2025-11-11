'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, AuthResponse, LoginInput, RegisterInput } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (input: LoginInput) => {
    const response = await api.post<AuthResponse>('/api/auth/login', input);

    if (response.success && response.data) {
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
      return { success: true };
    }

    return { success: false, error: response.error?.message || 'Login failed' };
  };

  const register = async (input: RegisterInput) => {
    const response = await api.post<AuthResponse>('/api/auth/register', input);

    if (response.success && response.data) {
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
      return { success: true };
    }

    return { success: false, error: response.error?.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
