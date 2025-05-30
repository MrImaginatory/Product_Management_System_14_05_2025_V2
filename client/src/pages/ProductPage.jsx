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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash/debounce';

import axiosClient from '../services/axiosClient';
import ProductForm from '../components/products/ProductForm';
import { useSnackbar } from '../context/SnackbarContext';
import CustomPagination from '../components/common/CustomPagination';

import { exportToCSV } from '../utils/exportCSV';

const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

const transformFullProductDataForCSV = (products) =>
  products.map(
    (
      {
        productName,
        categoryName,
        subCategoryName,
        productDescription,
        productDisplayImage,
        productImages,
        productPrice,
        productSalePrice,
        stock,
        weight,
        availability,
        productType,
        createdAt,
        updatedAt,
        _id,
      },
      index
    ) => ({
      SNo: index + 1,
      ProductName: productName,
      Category: categoryName?.categoryName || '—',
      SubCategories: subCategoryName?.join(', ') || '—',
      ProductDescription: stripHtmlTags(productDescription),
      ProductDisplayImage: productDisplayImage,
      ProductImages: productImages?.join(', ') || '',
      ProductPrice: productPrice,
      ProductSalePrice: productSalePrice,
      Stock: stock,
      Weight: weight,
      Availability: availability,
      ProductType: productType?.join(', ') || '',
      CreatedAt: new Date(createdAt).toLocaleString(),
      UpdatedAt: new Date(updatedAt).toLocaleString(),
      ProductID: _id,
    })
  );

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // New state for limit per page
  const [totalPages, setTotalPages] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [exporting, setExporting] = useState(false);

  const { showSnackbar } = useSnackbar();

  const fetchProducts = useCallback(
    async (searchValue = searchProduct, pageValue = page, limitValue = limit) => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/product/getProducts', {
          params: {
            searchProduct: searchValue,
            page: pageValue,
            limit: limitValue,
          },
        });
        setProducts(res.data.products);
        setTotalPages(Math.ceil(res.data.totalProducts / limitValue));
        setSelectedProducts([]);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        showSnackbar('Error fetching products', 'error');
      } finally {
        setLoading(false);
      }
    },
    [searchProduct, page, limit, showSnackbar]
  );

  const debouncedFetch = useMemo(
    () =>
      debounce((searchValue) => {
        setPage(1);
        fetchProducts(searchValue, 1, limit);
      }, 1000),
    [fetchProducts, limit]
  );

  useEffect(() => {
    fetchProducts(searchProduct, page, limit);
  }, [page, limit, fetchProducts, searchProduct]);

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
    fetchProducts('', 1, limit);
  };

  const handleSearchClick = () => {
    debouncedFetch.cancel();
    setPage(1);
    fetchProducts(searchProduct, 1, limit);
  };

  const handleCheckboxToggle = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  // New handler for limit change
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(1);
    fetchProducts(searchProduct, 1, newLimit);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      let productsToExport = [];

      if (selectedProducts.length > 0) {
        productsToExport = products.filter((p) => selectedProducts.includes(p._id));
      } else {
        const res = await axiosClient.get('/product/productCSV');
        productsToExport = res.data.productData || [];
      }

      if (productsToExport.length === 0) {
        showSnackbar('No product data available for export', 'warning');
        setExporting(false);
        return;
      }

      const csvData = transformFullProductDataForCSV(productsToExport);
      exportToCSV(csvData, 'products.csv');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showSnackbar('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        spacing={2}
      >
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

        <Button
          variant="outlined"
          color="primary"
          onClick={handleExportCSV}
          disabled={exporting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        {/* Limit per page selector */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="limit-select-label">Limit</InputLabel>
          <Select
            labelId="limit-select-label"
            id="limit-select"
            value={limit}
            label="Limit"
            onChange={handleLimitChange}
          >
            {[5, 10, 15, 20, 50].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
              fetchProducts(searchProduct, 1, limit);
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
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleCheckboxToggle(product._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {product.productDisplayImage && (
                        <img
                          src={product.productDisplayImage}
                          alt={product.productName}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      )}
                      <Typography fontWeight={600}>{product.productName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.categoryName?.categoryName || '—'}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Typography color="success.main">
                      ₹{product.productSalePrice}{' '}
                      <Typography
                        component="span"
                        sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                      >
                        ₹{product.productPrice}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      href={`product/${product._id}`}
                      sx={{ borderRadius: 2 }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={4} display="flex" justifyContent="center">
        <CustomPagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} />
      </Box>

      <ProductForm open={openAdd} setOpen={setOpenAdd} />
    </Container>
  );
};

export default ProductPage;
