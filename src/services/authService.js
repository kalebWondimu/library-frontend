import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const loginData = {
        email: credentials.email || credentials.username,
        password: credentials.password
      };
      const response = await api.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
  localStorage.clear();
},

  
  isAuthenticated: () => !!localStorage.getItem('token'),
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
