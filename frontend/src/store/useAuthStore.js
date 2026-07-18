import { create } from 'zustand';
import axios from 'axios';

// Configure default axios base URL
axios.defaults.baseURL = '';

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('devora_token');
  }
  return null;
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: false,
  loading: true,
  error: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('devora_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('devora_token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, isAuthenticated: false, user: null });
    }
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ loading: false, isAuthenticated: false });
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/me');
      set({ user: response.data, isAuthenticated: true, loading: false, error: null });
    } catch (err) {
      console.error('Auth verification failed:', err);
      get().logout();
      set({ loading: false, error: 'Session expired' });
    }
  },

  register: async (fullName, username, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/register', { fullName, username, email, password });
      const { token, user } = response.data;
      get().setToken(token);
      set({ user, loading: false, error: null });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  login: async (emailOrUsername, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', { emailOrUsername, password });
      const { token, user } = response.data;
      get().setToken(token);
      set({ user, loading: false, error: null });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  googleLogin: async (googleToken, profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/google', { token: googleToken, profile: profileData });
      const { token, user } = response.data;
      get().setToken(token);
      set({ user, loading: false, error: null });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Google login failed';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put('/api/auth/update-profile', profileData);
      set({ user: response.data, loading: false });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      set({ loading: false });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update password';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  deleteAccount: async () => {
    set({ loading: true });
    try {
      await axios.delete('/api/auth/delete-account');
      get().logout();
      set({ loading: false });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete account';
      set({ loading: false, error: errorMsg });
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout request failed, cleaning local state anyway');
    }
    get().setToken(null);
  },

  clearError: () => set({ error: null })
}));
