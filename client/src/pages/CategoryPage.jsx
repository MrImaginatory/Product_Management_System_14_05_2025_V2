import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
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
    CardMedia,
    CardContent,
    Chip,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash/debounce';
import Masonry from '@mui/lab/Masonry';

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

    const fetchCategories = useCallback(
        async (searchValue = searchTerm, pageValue = page) => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/category/categories', {
                    params: { search: searchValue, page: pageValue, limit: 12 },
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

    const debouncedFetch = useMemo(
        () =>
            debounce((searchValue) => {
                setPage(1);
                fetchCategories(searchValue, 1);
            }, 800),
        [fetchCategories]
    );

    useEffect(() => {
        fetchCategories(searchTerm, page);
    }, [page, fetchCategories, searchTerm]);

    useEffect(() => {
        return () => debouncedFetch.cancel();
    }, [debouncedFetch]);

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(1);
        fetchCategories('', 1);
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

                <Stack direction="row" spacing={2} mb={3}>
                    <TextField
                        label="Search Categories or Subcategories"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
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
                        sx={{ flexGrow: 1 }}
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
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
                        {categories.map((cat) => (
                            <Card
                                key={cat._id}
                                sx={{
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Box sx={{ height: '100%', overflow: 'hidden' }}>
                                    {cat.categoryImage && (
                                        <CardMedia
                                            component="img"
                                            image={cat.categoryImage}
                                            alt={cat.categoryName}
                                            sx={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    )}
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {cat.categoryName}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                DOMPurify.sanitize(cat.categoryDescription.slice(0, 120)) + '...',
                                        }}
                                        sx={{ mb: 1 }}
                                    />

                                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                        {cat.subCategoriesName?.slice(0, 3).map((sub, i) => (
                                            <Chip label={sub.replace(/_/g, ' ')} size="small" key={i} />
                                        ))}
                                        {cat.subCategoriesName?.length > 3 && (
                                            <Chip label={`+${cat.subCategoriesName.length - 3}`} size="small" />
                                        )}
                                    </Box>

                                    <Button size="small" variant="outlined" href={`/category/${cat._id}`}>
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Masonry>
                )}

                <Box mt={4} display="flex" justifyContent="center">
                    <CustomPagination page={page} totalPages={totalPages} onChange={(val) => setPage(val)} />
                </Box>
            </Container>

            <CategoryForm
                open={openAdd}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') setOpenAdd(false);
                }}
                onSuccess={() => fetchCategories(searchTerm, page)}
            />
            <SubCategoryForm
                open={openSub}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') setOpenSub(false);
                }}
                onSuccess={() => fetchCategories(searchTerm, page)}
            />
        </>
    );
};

export default CategoryPage;
