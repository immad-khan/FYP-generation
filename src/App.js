import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import StudentDashboard from './components/Student/Dashboard';
import FacultyDashboard from './components/Faculty/Dashboard';
import StudentProfile from './components/Student/Profile';
import SemesterRecords from './components/Student/SemesterRecords';
import SavedIdeas from './components/Student/SavedIdeas';
import Settings from './components/Student/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProfile />
        </ProtectedRoute>
      } />
      <Route path="/student/records" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SemesterRecords />
        </ProtectedRoute>
      } />
      <Route path="/student/saved" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SavedIdeas />
        </ProtectedRoute>
      } />
      <Route path="/student/settings" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/faculty/dashboard" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
