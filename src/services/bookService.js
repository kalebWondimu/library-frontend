import api from './api';

export const bookService = {
  getAllBooks: async () => {
    try {
      const response = await api.get('/books');
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  createBook: async (bookData) => {
    try {
      const response = await api.post('/books', bookData);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  updateBook: async (id, bookData) => {
    try {
      const response = await api.patch(`/books/${id}`, bookData);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  searchBooks: async (query) => {
    try {
      const response = await api.get(`/books?search=${query}`);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }
};
