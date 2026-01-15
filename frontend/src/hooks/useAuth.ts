import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from './useAuthStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    email: string,
    username: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const response = await authService.register(email, username, password);
      const { user, token } = (response.data as any).data;
      login(user, token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { user, token } = (response.data as any).data;
      login(user, token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    authService.logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    isAuthenticated: !!user,
  };
};
