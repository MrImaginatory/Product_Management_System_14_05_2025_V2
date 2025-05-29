import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box> )

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
