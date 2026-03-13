// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CropListingPage from './pages/CropListingPage';
import CropDetailPage from './pages/CropDetailPage';
import AddCropPage from './pages/AddCropPage';
import EditCropPage from './pages/EditCropPage';
import ProfilePage from './pages/ProfilePage';
import FarmerContactPage from './pages/FarmerContactPage';

// Protected Route
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/crops" element={<CropListingPage />} />
          <Route path="/crops/:id" element={<CropDetailPage />} />
          <Route path="/farmer/:id/contact" element={<FarmerContactPage />} />

          {/* Farmer-only routes */}
          <Route path="/dashboard/farmer" element={
            <ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>
          } />
          <Route path="/crops/add" element={
            <ProtectedRoute role="farmer"><AddCropPage /></ProtectedRoute>
          } />
          <Route path="/crops/:id/edit" element={
            <ProtectedRoute role="farmer"><EditCropPage /></ProtectedRoute>
          } />

          {/* Customer-only routes */}
          <Route path="/dashboard/customer" element={
            <ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>
          } />

          {/* Shared */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
