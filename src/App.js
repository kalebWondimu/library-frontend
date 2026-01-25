import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LibrarianDashboardPage from './pages/LibrarianDashboardPage';
import BooksPage from './pages/BooksPage';
import BorrowReturnPage from './pages/BorrowReturnPage';
import MembersPage from './pages/MembersPage';
import GenresPage from './pages/GenresPage';
import StaffPage from './pages/StaffPage';
import ReportsPage from './pages/ReportsPage';

import MainLayout from './components/Layout/MainLayout';

const isAuthenticated = () => !!localStorage.getItem('token');

const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr).role;
  } catch {
    return null;
  }
};

const PrivateRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(getUserRole())) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const role = getUserRole();

  return (
    <Router>
      <Routes>

        <Route
          path="/"
          element={
            isAuthenticated() ? (
              role === 'admin'
                ? <Navigate to="/admin/dashboard" />
                : <Navigate to="/librarian/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="borrow-return" element={<BorrowReturnPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="genres" element={<GenresPage />} />
        </Route>

        
        <Route
          path="/librarian"
          element={
            <PrivateRoute allowedRoles={['librarian']}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<LibrarianDashboardPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="borrow-return" element={<BorrowReturnPage />} />
        </Route>

       
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
