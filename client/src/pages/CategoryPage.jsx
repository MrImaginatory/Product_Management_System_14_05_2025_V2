import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
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
import CategoryForm from '../components/categories/CategoryForm';
import SubCategoryForm from '../components/categories/SubCategoryForm';
import { useSnackbar } from '../context/SnackbarContext';
import CustomPagination from '../components/common/CustomPagination';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAdd, setOpenAdd] = useState(false);
    const [openSub, setOpenSub] = useState(false);

    const { showSnackbar } = useSnackbar();

    // fetchCategories is wrapped in useCallback to keep stable reference for debounce
    const fetchCategories = useCallback(
        async (searchValue = searchTerm, pageValue = page) => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/category/categories', {
                    params: {
                        search: searchValue,
                        page: pageValue,
                        limit: 10,
                    },
                });
                setCategories(res.data.categories);
                setTotalPages(Math.ceil(res.data.matchingCount / res.data.limit));
            } catch (err) {
                console.error('Error fetching categories:', err.message);
                showSnackbar(err?.response?.data?.message || 'Fetching Data failed', 'error');
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, page, showSnackbar]
    );

    // Debounced fetch for search input (1 second)
    const debouncedFetch = useMemo(
        () =>
            debounce((searchValue) => {
                setPage(1);
                fetchCategories(searchValue, 1);
            }, 1000),
        [fetchCategories]
    );

    // Effect to fetch categories on page change (except when page is reset by search)
    useEffect(() => {
        fetchCategories(searchTerm, page);
    }, [page, fetchCategories, searchTerm]);

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(1);
        fetchCategories('', 1); // fetch all categories on clear
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedFetch(value);
    };

    return (
        <>
            <Container sx={{ mt: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Categories</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>
                            Add Category
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setOpenSub(true)}>
                            Add Subcategory
                        </Button>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} mb={2}>
                    <TextField
                        label="Search Categories or Subcategories"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // immediate search on enter without debounce
                                debouncedFetch.cancel();
                                setPage(1);
                                fetchCategories(searchTerm, 1);
                            }
                        }}
                        InputProps={{
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClearSearch} aria-label="clear search">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => {
                            debouncedFetch.cancel();
                            setPage(1);
                            fetchCategories(searchTerm, 1);
                        }}
                    >
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
                                    <TableCell>Category Name</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Subcategories</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((cat, index) => (
                                    <TableRow key={cat._id}>
                                        <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                                        <TableCell>{cat.categoryName}</TableCell>
                                        <TableCell>{cat.slug}</TableCell>
                                        <TableCell>{cat.subCategoriesName?.map((sub) => sub.replace(/_/g, ' ')).join(', ')}</TableCell>
                                        <TableCell>
                                            {cat.categoryDescription.length > 100 ? (
                                                <>
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(cat.categoryDescription.slice(0, 100)) + '...',
                                                        }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        onClick={() => (window.location.href = `/category/${cat._id}`)}
                                                    >
                                                        Read More
                                                    </Button>
                                                </>
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(cat.categoryDescription),
                                                    }}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell>{cat.categoryImage && <img src={cat.categoryImage} alt="thumb" width={50} height={50} />}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined" href={`/category/${cat._id}`}>
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
            </Container>

            <CategoryForm open={openAdd}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') setOpenAdd(false);
                }}
                onSuccess={() => fetchCategories(searchTerm, page)} />
            <SubCategoryForm open={openSub}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') setOpenSub(false);
                }}
                onSuccess={() => fetchCategories(searchTerm, page)} />
        </>
    );
};

export default CategoryPage;
