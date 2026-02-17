import api from './api';

export const memberService = {
  getAllMembers: () => api.get('/members'),
  getMemberById: (id) => api.get(`/members/${id}`),
  getMemberBorrowingHistory: (id) => api.get(`/members/${id}/borrowing-history`),
  createMember: (memberData) => api.post('/members', memberData),
  updateMember: (id, memberData) => api.patch(`/members/${id}`, memberData),
  deleteMember: (id) => api.delete(`/members/${id}`),
  
};