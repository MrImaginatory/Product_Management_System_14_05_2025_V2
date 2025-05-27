// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
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
          p: 0,            // add some padding if you want
          ml: 0,           // NO margin-left, so content stays full width
          transition: 'all 0.3s ease',
        }}
      >
        <Outlet />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
