import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // optional, for global styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SnackbarProvider } from './context/SnackbarContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
