import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    Stack,
    CircularProgress,
    InputAdornment,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    CardActions,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash/debounce';
import Masonry from '@mui/lab/Masonry';

import axiosClient from '../services/axiosClient';
import ProductForm from '../components/products/ProductForm';
import { useSnackbar } from '../context/SnackbarContext';
import CustomPagination from '../components/common/CustomPagination';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAdd, setOpenAdd] = useState(false);

    const { showSnackbar } = useSnackbar();

    const fetchProducts = useCallback(
        async (searchValue = searchProduct, pageValue = page) => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/product/getProducts', {
                    params: {
                        searchProduct: searchValue,
                        page: pageValue,
                        limit: 12,
                    },
                });
                setProducts(res.data.products);
                setTotalPages(Math.ceil(res.data.totalProducts / res.data.limit));
            } catch (err) {
                console.error('Error fetching products:', err.message);
            } finally {
                setLoading(false);
            }
        },
        [searchProduct, page, showSnackbar]
    );

    const debouncedFetch = useMemo(
        () =>
            debounce((searchValue) => {
                setPage(1);
                fetchProducts(searchValue, 1);
            }, 1000),
        [fetchProducts]
    );

    useEffect(() => {
        fetchProducts(searchProduct, page);
    }, [page, fetchProducts, searchProduct]);

    useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchProduct(value);
        debouncedFetch(value);
    };

    const handleClearSearch = () => {
        setSearchProduct('');
        setPage(1);
        fetchProducts('', 1);
    };

    const handleSearchClick = () => {
        debouncedFetch.cancel();
        setPage(1);
        fetchProducts(searchProduct, 1);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={600} color="primary.main">
                    Products
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenAdd(true)}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add Product
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} mb={3}>
                <TextField
                    label="Search Product or Category"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchProduct}
                    onChange={handleSearchInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            debouncedFetch.cancel();
                            setPage(1);
                            fetchProducts(searchProduct, 1);
                        }
                    }}
                    InputProps={{
                        endAdornment: searchProduct ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClearSearch}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSearchClick}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Search
                </Button>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
    {products.map((product) => (
        <Card key={product._id} elevation={3} sx={{ borderRadius: 3 }}>
            {product.productDisplayImage && (
                <CardMedia
                    component="img"
                    image={product.productDisplayImage}
                    alt={product.productName}
                    sx={{ objectFit: 'cover' }}
                />
            )}
            <CardContent>
                <Typography variant="h6" fontWeight={600}>
                    {product.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Category: {product.categoryName?.categoryName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Stock: {product.stock}
                </Typography>
                <Typography variant="body2" color="success.main" mt={1}>
                    ₹{product.productSalePrice}{" "}
                    <Typography
                        component="span"
                        sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                    >
                        ₹{product.productPrice}
                    </Typography>
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', pr: 2 }}>
                <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    href={`/product/${product._id}`}
                    sx={{ borderRadius: 2 }}
                >
                    View
                </Button>
            </CardActions>
        </Card>
    ))}
</Masonry>


                    <Box mt={4} display="flex" justifyContent="center">
                        <CustomPagination page={page} totalPages={totalPages} onChange={(val) => setPage(val)} />
                    </Box>
                </>
            )}

            <ProductForm
                open={openAdd}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') setOpenAdd(false);
                }}
                onSuccess={() => fetchProducts(searchProduct, page)}
            />
        </Container>
    );
};

export default ProductPage;
