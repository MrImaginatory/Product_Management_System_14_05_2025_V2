import React from 'react'
import { Button, Container, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const HomePage = () => {
    return (
        <Container maxWidth={false} sx={{ backgroundColor: '#f5f5f5',
                                            py: 4, 
                                            height:'100vh',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap:'20px'
                                            }}>
            <Button variant="contained" color="primary" sx={{ mt: 4 }} startIcon={<AddIcon/>}>Add Category</Button>
            <Button variant="contained" color="primary" sx={{ mt: 4 }}>Add Subcategory</Button>
            <Button variant="contained" color="primary" sx={{ mt: 4 }}>Add Products</Button>
        </Container>
    )
}

export default HomePage