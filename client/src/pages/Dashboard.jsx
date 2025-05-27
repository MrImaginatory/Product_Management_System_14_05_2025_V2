import React from 'react';
import { Button, Container, Stack, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const animatedGradient = {
    background: `linear-gradient(270deg, #6a11cb, #2575fc, #6a11cb, #2575fc)`,
    backgroundSize: '800% 800%',
    animation: 'gradientAnimation 20s ease infinite',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
};

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <Box sx={animatedGradient}>
            <style>
                {`
          @keyframes gradientAnimation {
            0% {background-position:0% 50%;}
            50% {background-position:100% 50%;}
            100% {background-position:0% 50%;}
          }
        `}
            </style>

            <Container maxWidth="sm" sx={{}}>
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background:
                            'linear-gradient(135deg,rgb(123, 0, 255) 0%,rgb(3, 68, 182) 100%)',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 8px 24px rgba(37,117,252,0.4)',
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Product Dashboard
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9 }}>
                        Manage your categories and products easily
                    </Typography>

                    <Stack spacing={3} direction="column" alignItems="center">
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => navigate('/categories')}
                            sx={{
                                bgcolor: '#fff',
                                color: '#2575fc',
                                fontWeight: '600',
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#e3e3e3' },
                                boxShadow: '0 4px 10px rgba(37,117,252,0.3)',
                                textTransform: 'none',
                            }}
                            aria-label="Navigate to Categories"
                        >
                            Categories
                        </Button>

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => navigate('/products')}
                            sx={{
                                bgcolor: '#ff4081',
                                color: '#fff',
                                fontWeight: '600',
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#e91e63' },
                                boxShadow: '0 4px 10px rgba(255,64,129,0.3)',
                                textTransform: 'none',
                            }}
                            aria-label="Navigate to Products"
                        >
                            Products
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default Dashboard;
