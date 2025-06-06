import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import Slider from 'react-slick';
import ProductUpdateForm from '../components/products/ProductUpdateForm';
import { useSnackbar } from '../context/SnackbarContext';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [product, setProduct] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await axiosClient.get(`/product/getProduct/${productId}`);
      setProduct(res.data.product);
    } catch (err) {
      console.error('Error fetching product:', err.message);
      showSnackbar('Product Fetch failed!', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/product/deleteProduct/${productId}`);
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

  if (!product) return (<Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>);

  const images = [
    product.productDisplayImage,
    ...product.productImages.filter((img) => img !== product.productDisplayImage),
  ];

  const carouselSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    dots: true,
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Product Details
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => setOpenEdit(true)}>
            Edit
          </Button>
          <Button color="error" variant="contained" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          p: 4,
          gap: 4,
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        {/* Left Info Section */}
        <Box flex={2} minWidth={{ xs: '100%', md: '60%' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {product.productName}
          </Typography>

          <Stack spacing={1} mb={2}>
            <Typography>
              <strong>Category:</strong> {product.categoryName?.categoryName || 'N/A'}
            </Typography>
            <Typography>
              <strong>Subcategories:</strong> {product.subCategoryName?.join(', ') || 'N/A'}
            </Typography>
            <Typography>
              <strong>Price:</strong> ₹{product.productPrice}
            </Typography>
            <Typography>
              <strong>Sale Price:</strong>{' '}
              <Box component="span" color="success.main" fontWeight="bold">
                ₹{product.productSalePrice}
              </Box>
            </Typography>
            <Typography>
              <strong>Stock:</strong> {product.stock}
            </Typography>
            <Typography>
              <strong>Weight:</strong> {product.weight} kg
            </Typography>
            <Typography>
              <strong>Availability:</strong> {product.availability}
            </Typography>
            <Typography>
              <strong>Type:</strong> {product.productType?.join(', ') || 'N/A'}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" fontWeight={600} gutterBottom>
            Description
          </Typography>
          <Box
            sx={{
              typography: 'body1',
              color: 'text.primary',
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: product.productDescription }}
          />
        </Box>

        {/* Right Image Carousel */}
        <Box flex={1} minWidth={{ xs: '100%', md: '35%' }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              maxHeight: 450,
              '& img': {
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
              },
            }}
          >
            <Slider {...carouselSettings}>
              {images.map((img, idx) => (
                <Box key={idx} sx={{ width: '100%', height: 450,  }}>
                  <img src={img} alt={`product-${idx}`} loading="lazy" />
                </Box>
              ))}
            </Slider>
          </Paper>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <ProductUpdateForm
        open={openEdit}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') setOpenEdit(false);
        }}
        initialData={product}
        onSuccess={fetchProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') setConfirmDelete(false);
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{product.productName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetails;
