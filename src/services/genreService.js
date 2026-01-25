import api from './api';

export const genreService = {
  getAllGenres: async () => {
    try {
      const response = await api.get('/genres');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      else if (response.data && Array.isArray(response.data.genres)) {
        return response.data.genres;
      }
      else {
        return [];
      }
    } catch (error) {
       return [];
    }
  },
  
  createGenre: async (genreData) => {
    try {
      const response = await api.post('/genres', genreData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateGenre: async (id, genreData) => {
    try {
      const response = await api.patch(`/genres/${id}`, genreData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteGenre: async (id) => {
    try {
      const response = await api.delete(`/genres/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};