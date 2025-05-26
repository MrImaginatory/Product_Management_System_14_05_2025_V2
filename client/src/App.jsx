import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import Dashboard from './pages/Dashboard';
import CategoryDetails from './pages/CategoryDetails';
import ProductDetails from './pages/ProductDetails';
import LoginPage from './pages/LoginPage';
import SignupForm from './pages/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />
      </Route>

      {/* Protected Routes */}
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
  );
}

export default App;
