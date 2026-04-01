import axios from '../axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data.data;
  },
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data.data;
  },
  getMe: async () => {
    const response = await axios.get('/auth/me');
    return response.data.data;
  },
  updateMe: async (userData) => {
    const response = await axios.patch('/auth/me', userData);
    return response.data.data;
  }
};
