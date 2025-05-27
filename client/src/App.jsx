import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy load route components
const Layout = lazy(() => import('./components/layout/Layout'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CategoryDetails = lazy(() => import('./pages/CategoryDetails'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupForm = lazy(() => import('./pages/SignUpPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const PublicRoute = lazy(() => import('./components/PublicRoute'));

function App() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/category/:categoryId" element={<CategoryDetails />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
