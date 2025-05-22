import React, { useEffect, useState } from 'react';
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
    Pagination,
    CircularProgress,
} from '@mui/material';
import axiosClient from '../services/axiosClient';
import ProductForm from '../components/products/ProductForm';
import { useSnackbar } from '../context/SnackbarContext'

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAdd, setOpenAdd] = useState(false);

    const { showSnackbar } = useSnackbar();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/getProducts?page=${page}&searchProduct=${searchProduct}`);
            setProducts(res.data.products);
            setTotalPages(Math.ceil(res.data.totalProducts / res.data.limit));
        } catch (err) {
            console.error('Error fetching products:', err.message);
            showSnackbar(err?.response?.data?.message || 'Fetching Data failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchProducts();
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
                    onChange={(e) => setSearchProduct(e.target.value)}
                />
                <Button variant="outlined" onClick={handleSearch}>Search</Button>
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
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            href={`/product/${product._id}`}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Box mt={3} display="flex" justifyContent="center">
                        <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
                    </Box>
                </Box>
            )}

            <ProductForm
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchProducts}
            />
        </Container>
    );
};

export default ProductPage;
