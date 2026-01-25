import api from './api';

export const staffService = {
  getAllStaff: async () => {
    try {
      const response = await api.get('/staff');
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  createStaff: async (staffData) => {
    try {
      const response = await api.post('/staff', staffData);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  updateStaff: async (id, staffData) => {
    try {
      const response = await api.patch(`/staff/${id}`, staffData);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  deleteStaff: async (id) => {
    try {
      const response = await api.delete(`/staff/${id}`);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }
};
