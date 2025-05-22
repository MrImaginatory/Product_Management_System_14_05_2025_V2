import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Stack,
  Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import Slider from 'react-slick';
import ProductUpdateForm from '../components/products/ProductUpdateForm';
import {  useSnackbar } from '../context/SnackbarContext'

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {  showSnackbar } = useSnackbar();  

  const [product, setProduct] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await axiosClient.get(`/getProduct/${productId}`);
      setProduct(res.data.product);
    } catch (err) {
      console.error('Error fetching product:', err.message);
        showSnackbar('Product Fetched failed!', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/deleteProduct/${productId}`);
        showSnackbar('Product Deleted successfully!', 'success');
      navigate('/products');
    } catch (err) {
        showSnackbar(err?.response?.data?.message || 'Delete failed', 'error');
      console.error('Error deleting product:', err.message);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (!product) return <Typography>Loading...</Typography>;

  const images = [product.productDisplayImage, ...product.productImages.filter(img => img !== product.productDisplayImage)];


  const carouselSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,         
    autoplaySpeed: 2000,  
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Product Details</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => setOpenEdit(true)}>Edit</Button>
          <Button color="error" variant="contained" onClick={() => setConfirmDelete(true)}>Delete</Button>
        </Stack>
      </Stack>

      <Paper sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3, gap: 3 }}>
        <Box flex={2}>
          <Typography><strong>Name:</strong> {product.productName}</Typography>
          <Typography><strong>Category:</strong> {product.categoryName?.categoryName}</Typography>
          <Typography><strong>Subcategories:</strong> {product.subCategoryName?.join(', ')}</Typography>
          <Typography><strong>Price:</strong> ₹{product.productPrice}</Typography>
          <Typography><strong>Sale Price:</strong> ₹{product.productSalePrice}</Typography>
          <Typography><strong>Stock:</strong> {product.stock}</Typography>
          <Typography><strong>Weight:</strong> {product.weight}kg</Typography>
          <Typography><strong>Availability:</strong> {product.availability}</Typography>
          <Typography><strong>Type:</strong> {product.productType?.join(', ')}</Typography>
          <Typography><strong>Description:</strong></Typography>
          <Box dangerouslySetInnerHTML={{ __html: product.productDescription }} />
        </Box>

        <Box flex={1} minWidth="300px">
          <Slider {...carouselSettings}>
            {images.map((img, idx) => (
              <Box key={idx}>
                <img src={img} alt={`product-${idx}`} style={{ width: '100%', borderRadius: 8 }} />
              </Box>
            ))}
          </Slider>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <ProductUpdateForm
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        initialData={product}
        onSuccess={fetchProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{product.productName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetails;
