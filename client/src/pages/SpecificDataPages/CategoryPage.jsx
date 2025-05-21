import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Container, Divider, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:3001/api/v2/category/${categoryId}`)
            .then((response) => {
                const data = response.data.category;
                setCategory(data);
            })
            .catch((error) => {
                console.error('Error fetching category data:', error);
            });
    }, [categoryId]);

    if (!category) {
        return <Typography>Loading...</Typography>;
    }
console.log(category);

    return (
        <Container
            maxWidth={false}
            sx={{
                backgroundColor: '#f5f5f5',
                py: 4,
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
            }}
        >
            <Box sx={{background:'#c7b7b7', height:'90%', width:'80%', display:'flex'}}>
                <Box sx={{width:'70%', 
                        background:'#acabb4',
                        display:'flex',
                        justifyContent:'left',
                        flexDirection:'column', 
                        padding:'5%'}}>
                    <Typography sx={{fontSize:'2rem', 
                                    fontWeight:'bold', 
                                    color:'#333', 
                                    transition: 'color 0.3s ease-in-out', ":hover": { color: '#007bff' }}}>
                                    {category.categoryName}
                    </Typography>
                    <Typography>
                        Slug: {category.slug}
                    </Typography>
                    <Typography>{
                            category.subCategoriesName.map((subCategory, index)=> {
                                return(<>
                                    <span>{"  "}{index+1}{"."}</span>
                                        <li style={{listStyle:'none', display:'inline'}}>{subCategory.replace('_'," ")}</li>
                                    </>
                                )
                            })
                        }</Typography>
                    <Divider sx={{width:'100%'}}/>
                    <Typography variant='body1' gutterBottom sx={{overflowY:'auto', WebkitOverflowScrolling:'none', overflowX:'auto'}}>
                        {category.categoryDescription}
                    </Typography>
                    <Box sx={{marginTop:'auto', display:'flex', gap:'2%'}} >
                        <Button variant='contained' color="secondary" ><EditIcon/>Edit</Button>
                        <Button variant='contained' color="error"><DeleteIcon/>Delete</Button>
                    </Box>
                
                </Box>
                <Box sx={{width:'30%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <img src={category.categoryImage} alt="Category Image" style={{height:'90%', width:'90%',padding:'5%'}} />
                </Box>
            </Box>
        </Container>
    );
};

export default CategoryPage;
