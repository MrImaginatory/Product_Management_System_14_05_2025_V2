import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import Dashboard from './pages/Dashboard';
import CategoryDetails from './pages/CategoryDetails';
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetails />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
