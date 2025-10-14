import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/layouts/Layout';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Categories from '@/pages/Categories';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Suppliers from '@/pages/Suppliers';
import Sales from '@/pages/Sales';
import Purchases from '@/pages/Purchases';
import AuthPage from '@/pages/AuthPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';

// Component to wrap protected routes
const ProtectedRoutes = () => (
  <ProtectedRoute>
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
      </Routes>
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected routes */}
            <Route path="/*" element={<ProtectedRoutes />} />
            
            {/* Change password route (protected but outside layout) */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;