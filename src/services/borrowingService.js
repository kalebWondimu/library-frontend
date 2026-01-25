import api from './api';

export const borrowingService = {
  
  getAllBorrowRecords: () => api.get('/borrow-records'),
  borrowBook: (borrowData) => api.post('/borrow-records/borrow', borrowData),
  returnBook: (returnData) => api.post('/borrow-records/return', returnData),
  getOverdueBooks: () => api.get('/borrow-records/reports/overdue'),
  getPopularGenres: () => api.get('/borrow-records/reports/popular-genres'),
  getSummary: () => api.get('/borrow-records/reports/summary'),
};