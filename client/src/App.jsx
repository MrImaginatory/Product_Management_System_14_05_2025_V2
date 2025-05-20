import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx'
import ShowCategoryData from './pages/DataDisplayPages/ShowCategoryData.jsx'
import ShowProductData from './pages/DataDisplayPages/ShowProductData.jsx';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/categories" element={<ShowCategoryData/>}/>
        <Route path="/products" element={<ShowProductData/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
