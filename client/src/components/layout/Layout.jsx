// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          ml: sidebarOpen ? '240px' : '64px',
          transition: 'margin-left 0.3s',
        }}
      >
        <Toolbar />
        <Outlet/>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
