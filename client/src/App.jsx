import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import CategoryDetails from './pages/CategoryDetails';
import ProductPage from './pages/ProductPage';
import ProductDetails from './pages/ProductDetails';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/category/:categoryId" element={<CategoryDetails />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
    </Routes>
  );
};

export default App;
