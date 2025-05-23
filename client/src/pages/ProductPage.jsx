import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Stack,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash/debounce';

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

    // Fetch products with search and pagination params
    const fetchProducts = useCallback(
        async (searchValue = searchProduct, pageValue = page) => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/getProducts', {
                    params: {
                        searchProduct: searchValue,
                        page: pageValue,
                        limit: 10,
                    },
                });
                setProducts(res.data.products);
                setTotalPages(Math.ceil(res.data.totalProducts / res.data.limit));
            } catch (err) {
                console.error('Error fetching products:', err.message);
                showSnackbar(err?.response?.data?.message || 'Fetching Data failed', 'error');
            } finally {
                setLoading(false);
            }
        },
        [searchProduct, page, showSnackbar]
    );

    // Debounced fetch on search input change
    const debouncedFetch = useMemo(
        () =>
            debounce((searchValue) => {
                setPage(1);
                fetchProducts(searchValue, 1);
            }, 1000),
        [fetchProducts]
    );

    // Fetch products when page changes (except when search resets page)
    useEffect(() => {
        fetchProducts(searchProduct, page);
    }, [page, fetchProducts, searchProduct]);

    // Cleanup debounce on unmount
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
                <Typography variant="h5">Products</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>
                    Add Product
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    label="Search Product"
                    variant="outlined"
                    size="small"
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
                                <IconButton size="small" onClick={handleClearSearch} aria-label="clear search">
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
                <Button variant="outlined" onClick={handleSearchClick}>
                    Search
                </Button>
            </Stack>

            {loading ? (
                <CircularProgress />
            ) : (
                <Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Sale Price</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product, index) => (
                                <TableRow key={product._id}>
                                    <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                                    <TableCell>{product.productName}</TableCell>
                                    <TableCell>{product.categoryName.categoryName}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>₹{product.productSalePrice}</TableCell>
                                    <TableCell>₹{product.productPrice}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" href={`/product/${product._id}`}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Box mt={3} display="flex" justifyContent="center">
                        <CustomPagination page={page} totalPages={totalPages} onChange={(val) => setPage(val)} />
                    </Box>
                </Box>
            )}

            <ProductForm open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => fetchProducts(searchProduct, page)} />
        </Container>
    );
};

export default ProductPage;
