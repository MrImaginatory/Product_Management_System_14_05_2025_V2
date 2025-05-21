import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx'
import ShowCategoryData from './pages/DataDisplayPages/ShowCategoryData.jsx'
import ShowProductData from './pages/DataDisplayPages/ShowProductData.jsx';
import CategoryPage from './pages/SpecificDataPages/CategoryPage.jsx'
import CreateCategoryDialog from './components/CreateCategoryDialog.jsx';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/categories" element={<ShowCategoryData/>}/>
        <Route path="/products" element={<ShowProductData/>}/>
        <Route path="/category/:categoryId" element={<CategoryPage/>}/>
        <Route path="/test" element={<CreateCategoryDialog/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
