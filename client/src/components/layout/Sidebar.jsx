import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, IconButton, Divider, Toolbar, Box, Tooltip
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path if needed

const drawerWidth = 240;
const collapsedWidth = 64;

const Sidebar = ({ open, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
    { label: 'Products', path: '/products', icon: <ShoppingCartIcon /> },
  ];

  const handleLogout = () => {
    logout(); // context logout
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          position: 'fixed',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={toggleSidebar}>
            {open ? <ChevronLeftIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map((item) => (
            <Tooltip title={open ? '' : item.label} placement="right" arrow key={item.label}>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                sx={{ justifyContent: open ? 'flex-start' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Logout styled like navItems */}
      <Box>
        <Tooltip title={open ? '' : 'Logout'} placement="right" arrow>
          <ListItemButton onClick={handleLogout} sx={{ justifyContent: open ? 'flex-start' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
              <LogoutIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
