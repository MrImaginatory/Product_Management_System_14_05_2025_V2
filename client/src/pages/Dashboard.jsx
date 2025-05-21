import React from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Stack spacing={2} direction="column" alignItems="center">
                <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/categories')}>
                    Categories
                </Button>
                <Button variant="contained" color="secondary" fullWidth onClick={() => navigate('/products')}>
                    Products
                </Button>
            </Stack>
        </Container>
    );
};

export default Dashboard;
