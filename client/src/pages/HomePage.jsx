import React from 'react'
import { Button, Container, Typography } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';

const HomePage = () => {
    return (
        <Container maxWidth={false} sx={{ backgroundColor: '#f5f5f5',
                                            py: 4, 
                                            height:'100vh',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap:'20px',
                                            flexDirection: 'column',
                                            }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', 
                                            fontWeight: 'bold', 
                                            color: '#333', 
                                            transition: 'color 0.3s ease-in-out',  
                                                ":hover": { color: '#007bff' } }}>
                                            Welcome to our Store <StoreIcon sx={{ fontSize: '3rem', color: '#333' }} />
                                            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => { window.location.href = '/categories'}} > See Category</Button>
            <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => { window.location.href = '/products'}}>See Products</Button>
        </Container>
    )
}

export default HomePage