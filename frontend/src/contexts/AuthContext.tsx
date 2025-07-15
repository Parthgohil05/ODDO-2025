import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  skillsOffered?: string[]; // Added
  skillsWanted?: string[]; // Added
  bio?: string;
  profilePicture?: string;
  contactInfo?: string;
  location?: string; // Added
  availability?: string; // Added
  isPublic?: boolean; // Added
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void; // Add updateUser function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  });

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Logged in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/users/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Registration successful! You are now logged in.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    queryClient.clear(); // Clear all queries on logout
    toast.info('Logged out successfully.');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const updated = { ...prevUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      }
      return null;
    });
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
    updateUser, // Add updateUser to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 